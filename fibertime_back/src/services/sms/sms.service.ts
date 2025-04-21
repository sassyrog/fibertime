import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Twilio } from 'twilio';
import { ConfigService } from '@nestjs/config';
import { VerificationInstance } from 'twilio/lib/rest/verify/v2/service/verification';

@Injectable()
export class SmsService implements OnModuleInit, OnModuleDestroy {
  private twilioClient: Twilio;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioClient = new Twilio(accountSid, authToken);
  }

  async sendVerificationCode(to: string): Promise<VerificationInstance> {
    const formattedNumber = to.startsWith('+') ? to : `+${to}`;
    return await this.twilioClient.verify.v2
      .services(this.configService.get<string>('TWILIO_SERVICE_ID', ''))
      .verifications.create({
        to: formattedNumber,
        channel: 'sms',
      });
  }

  async verifyVerificationCode(to: string, code: string): Promise<boolean> {
    const verificationCheck = await this.twilioClient.verify.v2
      .services(this.configService.get<string>('TWILIO_SERVICE_ID', ''))
      .verificationChecks.create({
        to,
        code,
      });
    return verificationCheck.status === 'approved';
  }

  onModuleDestroy() {
    // this.twilioClient.destroy();
  }
}
