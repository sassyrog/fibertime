import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

declare const module: any;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  })

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips properties not in the DTO
      forbidNonWhitelisted: true, // Throws an error if extra properties are present
      transform: true, // Transforms all properties to lowercase
    }),
  );

  await app.listen(process.env.PORT ?? 3000);

  /* eslint-disable  */
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  /* eslint-enable */
}
void bootstrap();
