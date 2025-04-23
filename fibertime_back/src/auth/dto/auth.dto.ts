import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  otpCode: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class OtpDto {
  @IsNotEmpty()
  @IsPhoneNumber('ZA')
  @IsString()
  phone: string;

  @IsString()
  code?: string;
}
