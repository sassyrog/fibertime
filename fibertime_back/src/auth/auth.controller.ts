import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDto, OtpDto } from './dto/auth.dto';
import { RedisService } from 'src/services/redis/redis.service';
import { SmsService } from 'src/services/sms/sms.service';
import parsePhoneNumber from 'libphonenumber-js';
import { Throttle } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

function normalizePhoneNumber(phone: string): string {
  const parsed = parsePhoneNumber(phone);
  if (!parsed) {
    throw new HttpException('Invalid phone number', HttpStatus.BAD_REQUEST);
  }
  return parsed.format('E.164');
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
    private readonly smsService: SmsService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async login(@Body() loginBody: LoginDto) {
    const phoneNumber: string = normalizePhoneNumber(loginBody.phone);

    const user = await this.usersService.findByPhone(phoneNumber);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const otpKey = `otp:${user.phone}`;
    const storedOtp: string | null = await this.redisService.get(otpKey);

    if (!storedOtp) {
      throw new HttpException(
        'OTP has expired. Please request a new OTP',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    try {
      const verification: boolean =
        await this.smsService.verifyVerificationCode(
          phoneNumber,
          loginBody.otpCode,
        );
      if (!verification)
        throw new HttpException('Invalid OTP', HttpStatus.UNAUTHORIZED);

      await this.redisService.del(otpKey);
      await this.usersService.update(user.id, { lastLogin: new Date() });

      const payload = { userId: user.id, phone: user.phone };
      const token: string = this.jwtService.sign(payload);

      return {
        message: 'Login successful',
        user,
        token,
      };
    } catch (err) {
      console.error(err);
      throw new HttpException('Invalid OTP', HttpStatus.UNAUTHORIZED);
    }
  }
  @Post('request-otp')
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() otpBody: OtpDto) {
    // const otp = generateOtp();

    // Fix this line:
    const phoneNumber: string = normalizePhoneNumber(otpBody.phone);

    let user = await this.usersService.findByPhone(phoneNumber);
    if (!user) {
      user = await this.usersService.create({
        phone: phoneNumber,
      });

      if (!user)
        throw new HttpException(
          'Failed to create user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    const otpKey = `otp:${user.phone}`;

    if (await this.redisService.exists(otpKey)) {
      const otpTtl = await this.redisService.ttl(otpKey);
      throw new HttpException(
        `OTP already sent. Please try again after ${otpTtl} seconds`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otpTtl = parseInt(this.configService.get<string>('OTP_TTL', '300'));

    const verification =
      await this.smsService.sendVerificationCode(phoneNumber);
    await this.redisService.set(otpKey, JSON.stringify(verification), otpTtl);

    return {
      ttl: otpTtl ?? 0 + 1, // account for check race condition
      message: 'OTP sent successfully',
      user: user,
    };
  }
}
