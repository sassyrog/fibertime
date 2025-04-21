import { ConnectionStatus } from '../device.model';

export class CreateDeviceDto {
  userId: string;
  deviceKey: string;
  name?: string;
  connectionStatus?: ConnectionStatus;
  connectionExpiration?: Date;
}
