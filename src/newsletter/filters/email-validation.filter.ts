import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';

interface EmailValidationError {
  message: string;
  invalidRecipients?: string[];
  invalidEmail?: string;
  totalInvalid?: number;
  totalProvided?: number;
  validCount?: number;
}

@Catch(BadRequestException)
export class EmailValidationFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as
      | EmailValidationError
      | string;

    // Si c'est une erreur de validation d'emails, on formate la réponse
    if (
      typeof exceptionResponse === 'object' &&
      (exceptionResponse.invalidRecipients || exceptionResponse.invalidEmail)
    ) {
      return response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        message: exceptionResponse.message,
        error: 'Validation Email Failed',
        invalidEmails: exceptionResponse.invalidRecipients || [
          exceptionResponse.invalidEmail || '',
        ],
        summary: {
          totalInvalid: exceptionResponse.totalInvalid || 1,
          totalProvided: exceptionResponse.totalProvided || 1,
          validCount: exceptionResponse.validCount || 0,
        },
      });
    }

    // Sinon, on retourne l'erreur normale
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message:
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse.message,
    });
  }
}
