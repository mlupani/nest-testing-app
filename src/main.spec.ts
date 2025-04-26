import { NestFactory } from '@nestjs/core';
import { bootstrap } from './main';
import { AppModule } from './app.module';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      useGlobalPipes: jest.fn(),
      setGlobalPrefix: jest.fn(),
      listen: jest.fn(),
    }),
  },
}));
describe('main.ts Bootstrap', () => {
  let mockApp: {
    useGlobalPipes: jest.Mock;
    setGlobalPrefix: jest.Mock;
    listen: jest.Mock;
  };

  beforeEach(() => {
    mockApp = {
      useGlobalPipes: jest.fn(),
      setGlobalPrefix: jest.fn(),
      listen: jest.fn(),
    };
    (NestFactory.create as jest.Mock).mockResolvedValue(mockApp);
  });
  it('should create the application', async () => {
    await bootstrap();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
  });

  it('should set global prefix', async () => {
    await bootstrap();
    expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api');
  });

  it('should called listen with default port', async () => {
    await bootstrap();
    expect(mockApp.listen).toHaveBeenCalledWith(3000);
  });

  it('should called listen with the port on env', async () => {
    process.env.PORT = '4200';
    await bootstrap();
    expect(mockApp.listen).toHaveBeenCalledWith(process.env.PORT);
  });

  it('should set useGlobalPipes', async () => {
    await bootstrap();
    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
      expect.objectContaining({
        errorHttpStatusCode: 400,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        validatorOptions: expect.objectContaining({
          whitelist: true,
          forbidNonWhitelisted: true,
        }),
      }),
    );
  });
});
