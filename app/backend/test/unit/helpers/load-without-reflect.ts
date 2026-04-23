import fs from 'node:fs';
import path from 'node:path';

function resolveExistingModulePath(
  modulePath: string,
  fromFile: string,
): string {
  const rawPath = path.resolve(path.dirname(fromFile), modulePath);
  const candidates = [
    rawPath,
    `${rawPath}.ts`,
    `${rawPath}.tsx`,
    `${rawPath}.js`,
    `${rawPath}.jsx`,
    path.join(rawPath, 'index.ts'),
    path.join(rawPath, 'index.tsx'),
    path.join(rawPath, 'index.js'),
    path.join(rawPath, 'index.jsx'),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? rawPath;
}

export function loadModuleWithoutReflect<T>(
  modulePath: string,
  fromFile?: string,
): T {
  type ReflectWithOptionalDecoratorApis = Omit<
    typeof Reflect,
    'decorate' | 'metadata'
  > & {
    decorate?: typeof Reflect.decorate;
    metadata?: typeof Reflect.metadata;
  };

  const reflectWithOptional = Reflect as ReflectWithOptionalDecoratorApis;
  const originalDecorate = reflectWithOptional.decorate;
  const originalMetadata = reflectWithOptional.metadata;
  const jestTestPath =
    typeof expect !== 'undefined' && typeof expect.getState === 'function'
      ? expect.getState().testPath
      : undefined;
  const callerFile = fromFile ?? jestTestPath ?? __filename;
  const resolvedModulePath = resolveExistingModulePath(modulePath, callerFile);

  try {
    delete reflectWithOptional.decorate;
    delete reflectWithOptional.metadata;

    let loaded!: T;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      loaded = require(resolvedModulePath) as T;
    });

    return loaded;
  } finally {
    if (originalDecorate) {
      reflectWithOptional.decorate = originalDecorate;
    }

    if (originalMetadata) {
      reflectWithOptional.metadata = originalMetadata;
    }
  }
}
