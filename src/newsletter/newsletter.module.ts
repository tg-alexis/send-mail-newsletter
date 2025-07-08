import { Module } from '@nestjs/common';
import { MailModule } from 'src/mail';
import { NewsletterService } from './newletter.service';
import { NewsletterController } from './newsletter.controller';

@Module({
  imports: [MailModule.register()],
  controllers: [NewsletterController],
  providers: [NewsletterService],
})
export class NewsletterModule {}
