import 'dotenv/config';
import { readFile } from 'fs/promises';
import path from 'path';
import mongoose, { type Model } from 'mongoose';
import { DataSource } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import dataSourceOptions from '../src/database/data-source';
import {
  Question,
  QuestionSchema,
} from '../src/questions/schemas/question.schema';
import {
  ParametricTemplate,
  ParametricTemplateSchema,
} from '../src/questions/parametric/schemas/parametric-template.schema';
import type { CreateQuestionDto } from '../src/questions/dto/create-question.dto';
import type { QuestionTypeConfig } from '../src/questions/types/question-type-config.type';
import type { ParametricTemplateDefinition } from '../src/questions/parametric/types/parametric-template-definition.type';
import { normalizeCreateQuestionData } from '../src/questions/utils/question-payload.util';
import { assertValidQuestionContent } from '../src/questions/utils/question-validation.util';
import { QuestionType } from '../src/questions/enums/question-type.enum';

const DEFAULT_MONGO_URI =
  process.env.MONGO_URI ?? 'mongodb://localhost:27017/tfg_questions';
const DEFAULT_INPUT_PLACEHOLDER = 'Ej.: 1/2, pi/4 o 0.7854';

type ManifestEntry =
  | {
      type: 'question-bank';
      file: string;
      createdByUserEmail: string;
    }
  | {
      type: 'parametric-templates';
      file: string;
    };

type BootstrapManifest = {
  version: number;
  imports: ManifestEntry[];
};

type QuestionSeedRecord = {
  seedKey: string;
  title: string;
  type: QuestionType;
  statement: string;
  explanation?: string | null;
  tags?: string[];
  questionConfig: QuestionTypeConfig;
};

type QuestionBankFile = {
  bundleKey: string;
  questions: QuestionSeedRecord[];
};

type ParametricTemplateFile = {
  bundleKey: string;
  templates: ParametricTemplateDefinition[];
};

type ParsedArgs = {
  dir: string;
};

function parseArgs(argv: string[]): ParsedArgs {
  const dirIndex = argv.findIndex((entry) => entry === '--dir');
  const dir = dirIndex >= 0 ? argv[dirIndex + 1] : null;

  if (!dir) {
    throw new Error(
      'Usage: npm run bootstrap:content -- --dir <private-bootstrap-dir>',
    );
  }

  return {
    dir: path.resolve(process.cwd(), dir),
  };
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const rawFile = await readFile(filePath, 'utf8');
  return JSON.parse(rawFile) as T;
}

function getQuestionModel(): Model<Question> {
  return (
    mongoose.models[Question.name] ||
    mongoose.model(Question.name, QuestionSchema)
  );
}

function getParametricTemplateModel(): Model<ParametricTemplate> {
  return (
    mongoose.models[ParametricTemplate.name] ||
    mongoose.model(ParametricTemplate.name, ParametricTemplateSchema)
  );
}

function assertPlainObject(
  value: unknown,
  errorMessage: string,
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(errorMessage);
  }
}

function normalizeQuestionSeedPayload(
  record: QuestionSeedRecord,
): CreateQuestionDto {
  const payload: CreateQuestionDto = {
    title: record.title,
    type: record.type,
    statement: record.statement,
    explanation: record.explanation,
    tags: record.tags,
    questionConfig: record.questionConfig,
  };

  const normalizedPayload = normalizeCreateQuestionData(payload);
  assertValidQuestionContent(normalizedPayload);

  return {
    ...payload,
    title: normalizedPayload.title,
    statement: normalizedPayload.statement,
    explanation: normalizedPayload.explanation,
    tags: normalizedPayload.tags,
    questionConfig: normalizedPayload.questionConfig,
  };
}

async function resolveUserIdByEmail(
  dataSource: DataSource,
  email: string,
): Promise<number> {
  const usersRepository = dataSource.getRepository(User);
  const normalizedEmail = email.trim().toLowerCase();
  const user = await usersRepository.findOne({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new Error(
      `No user found with email ${normalizedEmail}. Import the content after creating the administrator account.`,
    );
  }

  return user.id;
}

async function importQuestionBank(
  filePath: string,
  createdByUserEmail: string,
  dataSource: DataSource,
): Promise<void> {
  const questionModel = getQuestionModel();
  const questionBank = await readJsonFile<QuestionBankFile>(filePath);
  assertPlainObject(questionBank, 'Invalid question bank JSON payload');

  if (
    !Array.isArray(questionBank.questions) ||
    questionBank.questions.length === 0
  ) {
    throw new Error(
      `Question bank file ${filePath} does not contain any questions`,
    );
  }

  const actorUserId = await resolveUserIdByEmail(
    dataSource,
    createdByUserEmail,
  );

  for (const record of questionBank.questions) {
    const normalizedPayload = normalizeQuestionSeedPayload(record);
    await questionModel
      .findOneAndUpdate(
        { externalSeedKey: record.seedKey },
        {
          $set: {
            title: normalizedPayload.title,
            type: normalizedPayload.type,
            statement: normalizedPayload.statement,
            explanation: normalizedPayload.explanation ?? null,
            tags: normalizedPayload.tags ?? [],
            questionConfig: normalizedPayload.questionConfig,
            updatedByUserId: actorUserId,
            sourceSeedBundle: questionBank.bundleKey,
          },
          $setOnInsert: {
            createdByUserId: actorUserId,
            externalSeedKey: record.seedKey,
            isArchived: false,
            version: 1,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      )
      .exec();
  }
}

function assertValidParametricTemplate(
  template: ParametricTemplateDefinition,
  sourceFile: string,
): void {
  if (!template.templateId || !template.name || !template.canonicalStatement) {
    throw new Error(
      `Template file ${sourceFile} contains an incomplete template definition`,
    );
  }

  if (!Array.isArray(template.variants) || template.variants.length === 0) {
    throw new Error(
      `Template ${template.templateId} in ${sourceFile} does not contain any variants`,
    );
  }

  const seenVariantKeys = new Set<number>();

  for (const variant of template.variants) {
    if (seenVariantKeys.has(variant.variantKey)) {
      throw new Error(
        `Template ${template.templateId} in ${sourceFile} contains duplicated variantKey ${variant.variantKey}`,
      );
    }

    seenVariantKeys.add(variant.variantKey);

    if (
      !variant.statement ||
      !variant.correctAnswerLatex ||
      typeof variant.correctAnswerNumeric !== 'number' ||
      !Number.isFinite(variant.correctAnswerNumeric)
    ) {
      throw new Error(
        `Template ${template.templateId} in ${sourceFile} contains an invalid variant payload`,
      );
    }
  }
}

async function importParametricTemplates(filePath: string): Promise<void> {
  const parametricTemplateModel = getParametricTemplateModel();
  const templateBundle = await readJsonFile<ParametricTemplateFile>(filePath);
  assertPlainObject(templateBundle, 'Invalid parametric template JSON payload');

  if (
    !Array.isArray(templateBundle.templates) ||
    templateBundle.templates.length === 0
  ) {
    throw new Error(
      `Parametric template file ${filePath} does not contain any templates`,
    );
  }

  for (const template of templateBundle.templates) {
    assertValidParametricTemplate(template, filePath);
    await parametricTemplateModel
      .findOneAndUpdate(
        { templateId: template.templateId },
        {
          $set: {
            name: template.name,
            canonicalStatement: template.canonicalStatement,
            defaultTolerance: Number(template.defaultTolerance ?? 0.01),
            inputPlaceholder:
              template.inputPlaceholder?.trim() || DEFAULT_INPUT_PLACEHOLDER,
            variants: template.variants.map((variant) => ({
              variantKey: variant.variantKey,
              statement: variant.statement,
              correctAnswerNumeric: variant.correctAnswerNumeric,
              correctAnswerLatex: variant.correctAnswerLatex,
              generatedValues: variant.generatedValues,
            })),
            sourceSeedBundle: templateBundle.bundleKey,
          },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      )
      .exec();
  }
}

async function run(): Promise<void> {
  const { dir } = parseArgs(process.argv.slice(2));
  const manifestPath = path.join(dir, 'manifest.json');
  const manifest = await readJsonFile<BootstrapManifest>(manifestPath);

  if (!Array.isArray(manifest.imports) || manifest.imports.length === 0) {
    throw new Error(`Manifest ${manifestPath} does not contain any imports`);
  }

  let relationalDataSource: DataSource | null = null;

  try {
    await mongoose.connect(DEFAULT_MONGO_URI);

    for (const entry of manifest.imports) {
      const filePath = path.join(dir, entry.file);

      if (entry.type === 'question-bank') {
        if (!relationalDataSource) {
          relationalDataSource = new DataSource(dataSourceOptions.options);
          await relationalDataSource.initialize();
        }

        await importQuestionBank(
          filePath,
          entry.createdByUserEmail,
          relationalDataSource,
        );
        console.log(`Imported question bank from ${entry.file}`);
        continue;
      }

      await importParametricTemplates(filePath);
      console.log(`Imported parametric templates from ${entry.file}`);
    }

    console.log('Bootstrap content import completed successfully.');
  } finally {
    if (relationalDataSource?.isInitialized) {
      await relationalDataSource.destroy();
    }

    await mongoose.disconnect();
  }
}

void run().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : 'Unknown bootstrap error';
  console.error(message);
  process.exitCode = 1;
});
