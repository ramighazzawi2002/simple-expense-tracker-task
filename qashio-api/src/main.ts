import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  if (process.env.NODE_ENV === 'production') {
    app.use(
      '/api/docs',
      basicAuth({
        users: {
          [process.env.SWAGGER_USER ?? 'admin']:
            process.env.SWAGGER_PASSWORD ?? 'changeme',
        },
        challenge: true,
      }),
    );
  }

  const config = new DocumentBuilder()
    .setTitle('Qashio API')
    .setDescription('Expense Tracker REST API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();


