import { PartialType } from '@nestjs/mapped-types';
import { CreateDeviceDto } from './create-device.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { ConnectionStatus } from '../device.model';

export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {
  deviceKey?: string;
  connectionExpiration?: Date;
  connectionStatus?: ConnectionStatus;
}

export class DeviceFingerprintDto {
  @IsString()
  @IsNotEmpty()
  value: string;
}

export class DeviceConnectDto {
  deviceCode: string;
  deviceFingerprint: string;
  userId: string;
}
