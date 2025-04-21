import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { DevicesModule } from './devices/devices.module';
import { RedisModule } from './services/redis/redis.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { SmsModule } from './services/sms/sms.module';

console.log('DB_HOST:', process.env.POSTGRES_HOST);
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadModels: true,
      synchronize: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 10 }],
    }),
    UsersModule,
    DevicesModule,
    SmsModule,
    RedisModule,
    AuthModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
