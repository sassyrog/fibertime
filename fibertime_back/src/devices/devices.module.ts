import { Module } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Device } from './device.model';
import { UsersModule } from 'src/users/users.module';
import { RedisModule } from 'src/services/redis/redis.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Device]),
    UsersModule,
    RedisModule,
    AuthModule,
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
