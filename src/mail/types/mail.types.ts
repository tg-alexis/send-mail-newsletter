/**
 * Types for mail service
 */

/**
 * Base email data interface
 */
export interface IBaseEmailData {
  to: string;
  subject?: string;
  template: string;
  context: Record<string, any>;
  pdfFile?: any[];
}

/**
 * Password reset email data
 */
export interface IPasswordResetEmailData {
  resetUrl: string;
  expiresAt: Date;
}

/**
 * Account approval email data
 */
export interface IAccountApprovalEmailData {
  loginUrl: string;
}

/**
 * Account creation email data
 */
export interface IAccountCreationEmailData {
  password: string;
  loginUrl: string;
  username?: string;
}

export interface IInscriptionSendTicketEmailData {
  name: string;
  pdfFile: any[];
}

/**
 * Account rejection email data
 */
export interface IAccountRejectionEmailData {
  reason: string;
}

/**
 * Email send result
 */
export interface IEmailSendResult {
  success: boolean;
  messageId?: string;
  error?: Error;
}
