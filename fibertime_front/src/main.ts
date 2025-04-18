import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

declare const module: any;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT ?? 3000);

  /* eslint-disable  */
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  /* eslint-enable */
}
void bootstrap();
