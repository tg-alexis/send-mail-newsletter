import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NewsletterModule } from './newsletter/newsletter.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    NewsletterModule,
  ],
})
export class AppModule {}
