import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  await app.listen(3000);
  console.log('🚀 Newsletter Service démarré sur http://localhost:3000');
  console.log('📧 Endpoints disponibles :');
  console.log('  - POST /newsletter/send : Envoyer la newsletter');
  console.log('  - POST /newsletter/test : Envoyer un email de test');
  console.log('  - GET /newsletter/health : Vérifier le statut');
}
void bootstrap();
