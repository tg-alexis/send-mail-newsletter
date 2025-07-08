import { InternalServerErrorException } from '@nestjs/common';

/**
 * Custom exception for mail service errors
 */
export class MailException extends InternalServerErrorException {
  constructor(message: string, cause?: Error) {
    super(
      {
        message,
        error: 'Mail Service Error',
        cause: cause ? cause.message : undefined,
      },
      {
        cause,
      },
    );
    this.name = 'MailException';
  }
}

/**
 * Exception for mail template rendering errors
 */
export class MailTemplateException extends MailException {
  constructor(templateName: string, cause?: Error) {
    super(`Failed to render email template: ${templateName}`, cause);
    this.name = 'MailTemplateException';
  }
}

/**
 * Exception for mail sending errors
 */
export class MailSendException extends MailException {
  constructor(recipient: string, cause?: Error) {
    super(`Failed to send email to: ${recipient}`, cause);
    this.name = 'MailSendException';
  }
}
