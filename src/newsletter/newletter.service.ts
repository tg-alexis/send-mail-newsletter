import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { IMAIL_SERVICE, IMailService } from 'src/mail';
import { SendNewsletterDto } from './dto/send-newsletter.dto';

@Injectable()
export class NewsletterService {
  constructor(
    @Inject(IMAIL_SERVICE)
    private readonly emailService: IMailService,
  ) {}

  async sendNewsletter(sendNewsletterDto: SendNewsletterDto) {
    const { recipients } = sendNewsletterDto;

    // Validation préalable des emails
    const invalidEmails = this.validateEmails(recipients);

    if (invalidEmails.length > 0) {
      throw new BadRequestException({
        message: 'Certains emails ne sont pas valides',
        invalidRecipients: invalidEmails,
        totalInvalid: invalidEmails.length,
        totalProvided: recipients.length,
        validCount: recipients.length - invalidEmails.length,
      });
    }

    const result = await this.emailService.sendBulkEmails(recipients);

    return {
      message: 'Newsletter envoyée',
      totalRecipients: recipients.length,
      successCount: result.success.length,
      failureCount: result.failed.length,
      success: result.success,
      failed: result.failed,
    };
  }

  async sendTestEmail(email: string) {
    // Validation préalable de l'email
    const invalidEmails = this.validateEmails([email]);

    if (invalidEmails.length > 0) {
      throw new BadRequestException({
        message: "L'email fourni n'est pas valide",
        invalidEmail: email,
        reason: 'Format email invalide',
      });
    }

    const success = await this.emailService.sendNewsletterEmail(email);

    return {
      message: success
        ? 'Email de test envoyé avec succès'
        : "Échec de l'envoi de l'email de test",
      success,
      email,
    };
  }

  /**
   * Valide une liste d'emails et retourne ceux qui sont invalides
   * @param emails Liste des emails à valider
   * @returns Liste des emails invalides
   */
  private validateEmails(emails: string[]): string[] {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails: string[] = [];

    emails.forEach((email) => {
      if (!email || typeof email !== 'string') {
        invalidEmails.push(email || 'undefined');
      } else if (!emailRegex.test(email.trim())) {
        invalidEmails.push(email);
      }
    });

    return invalidEmails;
  }
}
