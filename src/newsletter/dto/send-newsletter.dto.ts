import { IsArray, IsEmail } from 'class-validator';

export class SendNewsletterDto {
  @IsArray()
  @IsEmail({}, { each: true })
  recipients: string[];
}

export class SendSingleEmailDto {
  @IsEmail()
  email: string;
}
