import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  Ip,
  HttpException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { RedisService } from 'src/services/redis/redis.service';

function generateCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
}

@Controller('devices')
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly redisService: RedisService,
  ) {}

  @Post()
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  /**
   * Creates or retrieves a device code for the requesting client.
   *
   * This endpoint generates a unique device code based on the client's IP address
   * and user agent. If a code already exists for this combination, it returns the
   * existing code instead of generating a new one. The code is stored in Redis
   * with a 10-minute expiration time.
   *
   * @param ip - The IP address of the client making the request
   * @param userAgent - The user agent string from the client's browser/device
   * @returns An object containing the device code that can be used for device authentication
   */
  @Post('create-device-code')
  @HttpCode(HttpStatus.OK)
  async createDeviceCode(
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const deviceFingerprint = Buffer.from(
      `${ip}-${userAgent}`,
      'binary',
    ).toString('base64');

    const fingerprintKey = `fingerprint:${deviceFingerprint}`;
    const existingDeviceCode = await this.redisService.get(fingerprintKey);

    if (existingDeviceCode) {
      const deviceKey = `device_code:${existingDeviceCode}`;
      const deviceData = await this.redisService.get(deviceKey);

      if (deviceData) {
        const deviceTtl = await this.redisService.ttl(deviceKey);
        return { deviceCode: existingDeviceCode, ttl: deviceTtl };
      }
    }
    let deviceCode;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      deviceCode = generateCode();
      const exists = await this.redisService.exists(
        `device_code:${deviceCode}`,
      );
      if (!exists) break;

      attempts++;
    }

    if (attempts >= maxAttempts)
      throw new HttpException('Failed to generate a unique device code', 400);

    const expiresIn = 60 * 10; // 10 minutes

    const deviceKey = `device_code:${deviceCode}`;
    await this.redisService.set(deviceKey, deviceFingerprint, expiresIn);
    await this.redisService.set(fingerprintKey, deviceCode, expiresIn);

    // // TODO: publish the device code to a Redis channel for real-time updates
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { deviceCode, ttl: expiresIn };
  }

  @Post('connect-device')
  @HttpCode(HttpStatus.OK)
  async authenticateDevice(
    @Body() { deviceCode, clientToken, userId },
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const deviceFingerprint = Buffer.from(
      `${ip}-${userAgent}`,
      'binary',
    ).toString('base64');

    const deviceKey = `device_code:${deviceCode}`;

    const deviceData = await this.redisService.get(deviceKey);

    if (!deviceData) throw new HttpException('Invalid device code', 401);

    if (deviceData !== deviceFingerprint)
      throw new HttpException('Could not authenticate device', 401);
  }

  @Get()
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesService.remove(id);
  }
}
