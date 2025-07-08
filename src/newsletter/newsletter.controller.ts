import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  SendNewsletterDto,
  SendSingleEmailDto,
} from './dto/send-newsletter.dto';
import { NewsletterService } from './newletter.service';

@Controller('newsletter')
// @UseFilters(EmailValidationFilter) // Optionnel : décommentez pour utiliser le filter personnalisé
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post('send')
  async sendNewsletter(@Body() sendNewsletterDto: SendNewsletterDto) {
    return await this.newsletterService.sendNewsletter(sendNewsletterDto);
  }

  @Post('test')
  async sendTestEmail(@Body() sendSingleEmailDto: SendSingleEmailDto) {
    return await this.newsletterService.sendTestEmail(sendSingleEmailDto.email);
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'OK',
      service: 'Newsletter Service',
      timestamp: new Date().toISOString(),
    };
  }
}
