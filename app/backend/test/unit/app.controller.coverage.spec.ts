import { loadModuleWithoutReflect } from './helpers/load-without-reflect';

describe('AppController coverage', () => {
  it('loads the module without Reflect decorator helpers', () => {
    const { AppController } = loadModuleWithoutReflect<
      typeof import('../../src/app.controller')
    >('../../src/app.controller', __filename);

    const controller = new AppController({
      getRoot: jest.fn(),
      getHealth: jest.fn(),
    } as never);

    expect(controller).toBeInstanceOf(AppController);
  });
});
