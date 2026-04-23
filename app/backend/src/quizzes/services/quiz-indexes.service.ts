import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Quiz, type QuizDocument } from '../schemas/quiz.schema';

@Injectable()
export class QuizIndexesService implements OnModuleInit {
  private readonly logger = new Logger(QuizIndexesService.name);

  constructor(
    @InjectModel(Quiz.name)
    private readonly quizModel: Model<QuizDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    const collection = this.quizModel.collection;

    if (!collection) {
      return;
    }

    try {
      const indexes = await collection.indexes();
      const legacyUniqueAccessCodeIndex = indexes.find(
        (index) =>
          index.unique === true &&
          Object.keys(index.key).length === 1 &&
          index.key.accessCode === 1,
      );

      if (legacyUniqueAccessCodeIndex?.name) {
        await collection.dropIndex(legacyUniqueAccessCodeIndex.name);
      }

      const hasPlainAccessCodeIndex = indexes.some(
        (index) =>
          index.name === 'accessCode_1' &&
          index.unique !== true &&
          Object.keys(index.key).length === 1 &&
          index.key.accessCode === 1,
      );

      if (!hasPlainAccessCodeIndex) {
        await collection.createIndex(
          { accessCode: 1 },
          { name: 'accessCode_1' },
        );
      }
    } catch (error) {
      this.logger.warn(
        'Unable to normalize quiz access code indexes automatically',
      );
      if (error instanceof Error) {
        this.logger.warn(error.message);
      }
    }
  }
}
