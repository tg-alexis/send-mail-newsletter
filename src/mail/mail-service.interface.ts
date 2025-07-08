/**
 * Interface for mail service operations.
 * This service is responsible for sending various types of emails in the application.
 */
export interface IMailService {
  /**
   * Sends a password reset email to the user.
   * @param email - The recipient email address
   * @param data - Object containing reset URL and expiration date
   * @returns Promise resolving to boolean indicating success
   */
  sendNewsletterEmail(email: string): Promise<boolean>;

  sendBulkEmails(
    emails: string[],
  ): Promise<{ success: string[]; failed: string[] }>;
}
