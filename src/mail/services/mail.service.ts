import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MailSendException,
  MailTemplateException,
} from '../exceptions/mail.exception';
import { IMailService } from '../mail-service.interface';
import { EMailTemplates, MAIL_CONFIG } from '../mail.constants';
import { IBaseEmailData, IEmailSendResult } from '../types/mail.types';
import { MjmlService } from './mjml.service';
type MailResult = {
  messageId: string;
  accepted: string[];
  rejected: string[];
  // etc. selon ce que renvoie ton mailer
};

/**
 * Service responsible for sending emails.
 * Handles email templates, retry logic, and error handling.
 */
@Injectable()
export class MailService implements IMailService {
  private readonly logger = new Logger(MailService.name);
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private readonly mjmlService: MjmlService,
  ) {}
  async sendNewsletterEmail(email: string): Promise<boolean> {
    this.logger.log(`Sending benevole status changed email to: ${email}`);
    try {
      const emailData: IBaseEmailData = {
        to: email,
        subject: MAIL_CONFIG.SUBJECTS[EMailTemplates.NEWSLETTER],
        template: EMailTemplates.NEWSLETTER,
        context: {},
      };
      const result = await this.sendEmail(emailData);
      return result.success;
    } catch (error) {
      this.logger.error(
        `Failed to send benevole status changed email to ${email}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new MailSendException(
        email,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  async sendBulkEmails(recipients: string[]): Promise<{
    success: string[];
    failed: string[];
  }> {
    const results = {
      success: [],
      failed: [],
    };

    // Envoyer les emails avec un délai pour éviter le spam
    for (const recipient of recipients) {
      const sent = await this.sendNewsletterEmail(recipient);
      if (sent) {
        results.success.push(recipient);
      } else {
        results.failed.push(recipient);
      }

      // Délai de 1 seconde entre chaque email
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return results;
  }

  /**
   * Core method to send emails with retry logic
   * @param emailData The email data to send
   * @returns Promise resolving to email send result
   * @private
   */
  private async sendEmail(
    emailData: IBaseEmailData,
  ): Promise<IEmailSendResult> {
    const maxRetries = MAIL_CONFIG.RETRY.MAX_ATTEMPTS;
    const retryDelay = MAIL_CONFIG.RETRY.DELAY_MS;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Render template with MJML
        const html = await this.mjmlService.renderTemplate(
          emailData.template,
          emailData.context,
        );

        // Send email with rendered HTML
        const result = (await this.mailerService.sendMail({
          to: emailData.to,
          subject: emailData.subject,
          html: html,
          context: emailData.context,
          from: {
            name: MAIL_CONFIG.DEFAULT_SENDER_NAME,
            address: this.configService.get('FROM_EMAIL'),
          },
        })) as unknown as MailResult;
        console.log('Email sent successfully', result);
        this.logger.log(
          `Email sent successfully to ${emailData.to} (MessageId: ${result.messageId})`,
        );

        return {
          success: true,
          messageId: result.messageId,
        };
      } catch (error: unknown) {
        console.log('Error sending email', error);
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          (error as { code?: string }).code === 'ETIMEDOUT' &&
          attempt < maxRetries
        ) {
          this.logger.warn(
            `Email send attempt ${attempt} failed, retrying in ${retryDelay}ms...`,
          );
          await this.delay(retryDelay);
          continue;
        }

        if (error instanceof MailTemplateException) {
          throw error;
        }

        return {
          success: false,
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    }

    return {
      success: false,
      error: new Error(`Failed to send email after ${maxRetries} attempts`),
    };
  }

  /**
   * Helper method to create a delay
   * @param ms Milliseconds to delay
   * @returns Promise resolving after the delay
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
