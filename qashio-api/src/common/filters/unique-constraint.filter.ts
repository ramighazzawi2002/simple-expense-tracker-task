import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class UniqueConstraintFilter implements ExceptionFilter {
  catch(exception: QueryFailedError & { code?: string }, host: ArgumentsHost) {
    if (exception.code === '23505') {
      const conflict = new ConflictException('Resource already exists');
      const response = host.switchToHttp().getResponse();
      response.status(409).json(conflict.getResponse());
      return;
    }
    const response = host.switchToHttp().getResponse();
    response.status(500).json({ statusCode: 500, message: 'Internal server error' });
  }
}
