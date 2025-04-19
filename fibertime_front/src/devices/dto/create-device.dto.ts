export class CreateDeviceDto {
  userId: string;
  deviceKey: string;
  name?: string;
  connectionStatus?: string;
  connectionExplanation?: Date;
}
