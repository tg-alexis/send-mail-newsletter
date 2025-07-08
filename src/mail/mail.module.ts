import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { MailService } from './services/mail.service';
import { MjmlService } from './services/mjml.service';
export const IMAIL_SERVICE = Symbol('IMAIL_SERVICE');
/**
 * Email service module configuration options
 */
export interface IMailModuleOptions {
  /**
   * Directory path for email templates relative to project root
   */
  templateDir?: string;
}

/**
 * Mail module responsible for handling email communications
 */
@Module({})
export class MailModule {
  /**
   * Register the module with default configuration
   * @returns A dynamic module for the mail service
   */
  static register(): DynamicModule {
    return this.registerAsync({});
  }

  /**
   * Register the module with async configuration
   * @param options Mail module configuration options
   * @returns A dynamic module for the mail service
   */
  static registerAsync(options: IMailModuleOptions): DynamicModule {
    const templateDir = options.templateDir || 'src/core/mail/templates';

    return {
      module: MailModule,
      imports: [
        MailerModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            transport: {
              host: config.get('SMTP_HOST'),
              port: config.get('SMTP_PORT'),
              auth: {
                user: config.get('SMTP_USER'),
                pass: config.get('SMTP_PASS'),
              },
              tls: {
                rejectUnauthorized: config.get('NODE_ENV') !== 'development',
              },
            },
            defaults: {
              from: `"${config.get('FROM_NAME')}" <${config.get('FROM_EMAIL')}>`,
            },
            template: {
              dir: join(process.cwd(), templateDir),
              adapter: new PugAdapter(),
              options: {
                strict: true,
              },
            },
          }),
        }),
      ],
      providers: [
        MjmlService,
        {
          provide: IMAIL_SERVICE,
          useClass: MailService,
        },
      ],
      exports: [IMAIL_SERVICE],
    };
  }
}
