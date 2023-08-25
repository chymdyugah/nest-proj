import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // restart server after adding this line
  // lets us use the global validation pipe to validate DTOs (serializers)
  // whitelist param tell nest to use only fields we defined in out DTOs
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true }),
  );
  await app.listen(3333);
}
bootstrap();
