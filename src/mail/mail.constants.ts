/**
 * Mail configuration constants
 */

export enum EMailTemplates {
  NEWSLETTER = 'send-newsletter',
}

export const MAIL_CONFIG = {
  /**
   * Default sender name for all emails
   */
  DEFAULT_SENDER_NAME: 'SAMAC 2025',

  /**
   * Default email subjects by template
   */
  SUBJECTS: {
    [EMailTemplates.NEWSLETTER]:
      'Salon Malien de l’Architecture et de la Construction',
  },

  /**
   * Retry configuration
   */
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000,
  },
};
