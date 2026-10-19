import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module.js';
import { TransformResponseInterceptor } from './interceptor/transform-response/transform-response.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Halaman form (login, register, dst.) ada di folder /public.
  // `extensions: ['html']` membuat /login membuka login.html.
  app.useStaticAssets(join(import.meta.dirname, '..', 'public'), {
    extensions: ['html'],
  });
  app.enableShutdownHooks();
  app.useGlobalInterceptors(new TransformResponseInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
