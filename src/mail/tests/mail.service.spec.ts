import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MailSendException } from '../exceptions/mail.exception';
import { EMailTemplates, MAIL_CONFIG } from '../mail.constants';
import { MailService } from '../services/mail.service';

const mockMailerService = {
  sendMail: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

describe('MailService', () => {
  let service: MailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: MailerService, useValue: mockMailerService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
    mailerService = module.get<MailerService>(MailerService);

    // Default mock implementations
    mockConfigService.get.mockImplementation((key: string) => {
      const configs = {
        APP_NAME: 'RH-CONGO',
        SUPPORT_EMAIL: 'support@rh-congo.com',
      };
      return configs[key];
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendPasswordResetEmail', () => {
    const email = 'test@example.com';
    const resetUrl = 'https://example.com/reset-password?token=12345';
    const expiresAt = new Date('2023-01-01T12:00:00Z');

    it('should send a password reset email successfully', async () => {
      mockMailerService.sendMail.mockResolvedValueOnce({
        messageId: '123',
      });

      const result = await service.sendPasswordResetEmail(email, {
        resetUrl,
        expiresAt,
      });

      expect(result).toBe(true);
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: email,
          subject: MAIL_CONFIG.SUBJECTS[EMailTemplates.PASSWORD_RESET],
          template: './emails/password-reset',
          context: expect.objectContaining({
            resetUrl,
          }),
        }),
      );
    });

    it('should throw MailSendException when sending fails', async () => {
      const error = new Error('SMTP error');
      mockMailerService.sendMail.mockRejectedValueOnce(error);

      await expect(
        service.sendPasswordResetEmail(email, {
          resetUrl,
          expiresAt,
        }),
      ).rejects.toThrow(MailSendException);
    });
  });
});
