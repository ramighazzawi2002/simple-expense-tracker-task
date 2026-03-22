import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { AppModule } from './app.module';
import { UniqueConstraintFilter } from './common/filters/unique-constraint.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  app.useGlobalFilters(new UniqueConstraintFilter());

  if (process.env.NODE_ENV === 'production') {
    const swaggerAuth = basicAuth({
      users: {
        [process.env.SWAGGER_USER ?? 'admin']:
          process.env.SWAGGER_PASSWORD ?? 'changeme',
      },
      challenge: true,
    });
    app.use('/api/docs', swaggerAuth);
    app.use('/api/docs-json', swaggerAuth);
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
