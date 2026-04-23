import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('returns the API root payload', () => {
    expect(appController.getRoot()).toEqual({
      message: 'API running',
    });
  });

  it('returns the API health payload', () => {
    expect(appController.getHealth()).toEqual(
      expect.objectContaining({
        status: 'ok',
        service: 'backend',
      }),
    );
  });
});
