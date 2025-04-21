import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { DeviceFingerprintDto, UpdateDeviceDto } from './dto/update-device.dto';
import { RedisService } from 'src/services/redis/redis.service';
import { UsersService } from 'src/users/users.service';
import { ConnectionStatus } from './device.model';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

/**
 * Generates a random 4-character alphanumeric code.
 *
 * This function creates a code consisting of uppercase letters (A-Z) and numbers (0-9).
 * It's used for creating device identification codes that are human-readable
 * but sufficiently random for temporary device authentication.
 *
 * @returns A 4-character string containing random uppercase letters and numbers
 */
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
    private readonly userService: UsersService,
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
   * @param fingerprint.value - The base64-encoded string combining with unique client identifiers (e.g., IP address and user agent)
   * @returns A Promise that resolves to an object containing the device code and its remaining time-to-live (TTL)
   * @throws HttpException - If the device code cannot be generated after a certain number of attempts
   */
  @Post('create-device-code')
  @HttpCode(HttpStatus.OK)
  async createDeviceCode(@Body() fingerprint: DeviceFingerprintDto) {
    const deviceFingerprint: string = fingerprint.value;
    const fingerprintKey = `fingerprint:${deviceFingerprint}`;

    const existingDeviceCode = await this.redisService.get(fingerprintKey);

    if (existingDeviceCode) {
      const deviceTtl = await this.redisService.ttl(
        `device_code:${existingDeviceCode}`,
      );
      if (deviceTtl && deviceTtl > 0) {
        return { deviceCode: existingDeviceCode, ttl: deviceTtl };
      }
    }

    // Generate new code
    const deviceCode = await this.generateUniqueCode();
    const expiresIn = 60 * 10; // 10 minutes

    // Store the mappings
    const deviceKey = `device_code:${deviceCode}`;
    await Promise.all([
      this.redisService.set(deviceKey, deviceFingerprint, expiresIn),
      // the next line stores the mapping between the fingerprint and the device code
      // to make reverse lookups possible and easier
      this.redisService.set(fingerprintKey, deviceCode, expiresIn),
    ]);

    return { deviceCode, ttl: expiresIn };
  }

  @UseGuards(JwtAuthGuard)
  @Post('connect-device')
  @HttpCode(HttpStatus.OK)
  async authenticateDevice(@Body() { deviceCode, deviceFingerprint, userId }) {
    const fingerprintKey = `fingerprint:${deviceFingerprint}`;

    // Find user first to fail fast
    const user = await this.userService.findOne(userId as string);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    // Check if device already exists
    let device =
      await this.devicesService.findOneByDeviceKey(deviceFingerprint);

    if (device) {
      // Security check: Prevent device hijacking
      if (device.userId && device.userId !== user.id) {
        throw new HttpException(
          'Device belongs to another user',
          HttpStatus.FORBIDDEN,
        );
      }

      // Update device with new connection details in one operation
      await this.devicesService.update(device.id, {
        userId: user.id, // Ensure user is set
        connectionStatus: ConnectionStatus.Connected,
        connectionExpiration: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });
    } else {
      // New device flow
      const fingerprintData = await this.redisService.get(fingerprintKey);

      if (!fingerprintData || fingerprintData !== deviceCode) {
        throw new HttpException(
          'Could not authenticate device',
          HttpStatus.UNAUTHORIZED,
        );
      }

      try {
        // Create new device
        device = await this.devicesService.create({
          userId: user.id,
          deviceKey: deviceFingerprint as string,
          connectionStatus: ConnectionStatus.Connected,
          connectionExpiration: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        });
      } catch (error) {
        // Handle potential race condition where device was created between our check and create
        if (error.name === 'SequelizeUniqueConstraintError') {
          // Try to retrieve and update the device that was just created
          device =
            await this.devicesService.findOneByDeviceKey(deviceFingerprint);
          if (device) {
            // Check ownership before updating
            if (device.userId && device.userId !== user.id) {
              throw new HttpException(
                'Device belongs to another user',
                HttpStatus.FORBIDDEN,
              );
            }

            await this.devicesService.update(device.id, {
              userId: user.id,
              connectionStatus: ConnectionStatus.Connected,
              connectionExpiration: new Date(Date.now() + 10 * 60 * 1000),
            });
          } else {
            throw new HttpException(
              'Device registration failed',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
        } else {
          throw new HttpException(
            'Failed to register device',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }
    }

    // Clean up Redis regardless of flow path
    await Promise.all([
      this.redisService.del(fingerprintKey),
      this.redisService.del(`device_code:${deviceCode}`),
    ]);

    return {
      message: 'Device connected successfully',
      device,
    };
  }

  @Get()
  findAll() {
    return this.devicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesService.remove(id);
  }

  private async generateUniqueCode(maxAttempts = 10): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      const code = generateCode();
      const exists = await this.redisService.exists(`device_code:${code}`);
      if (!exists) return code;
    }
    throw new HttpException('Failed to generate a unique device code', 400);
  }
}
