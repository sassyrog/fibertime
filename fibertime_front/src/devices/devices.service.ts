import { Injectable } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { Device } from './device.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class DevicesService {
  constructor(@InjectModel(Device) private deviceModel: typeof Device) {}

  create(createDeviceDto: CreateDeviceDto) {
    return this.deviceModel.create(createDeviceDto as any);
  }

  findAll() {
    return `This action returns all devices`;
  }

  findOne(id: number) {
    return `This action returns a #${id} device`;
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto) {
    const [affected, updatedDevices] = await this.deviceModel.update(
      updateDeviceDto as any,
      { where: { id }, returning: true },
    );
    return {
      affected,
      updatedDevices: updatedDevices[0],
    };
  }

  remove(id: string) {
    return `This action removes a #${id} device`;
  }
}
