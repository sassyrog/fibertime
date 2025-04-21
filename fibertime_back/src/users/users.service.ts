import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  async create(createUserDto: CreateUserDto) {
    return await this.userModel.create(createUserDto as any);
  }

  findAll() {
    return this.userModel.findAll({
      attributes: ['id', 'name', 'email', 'phone'],
      where: { isActive: true },
      order: [['name', 'ASC']],
    });
  }

  findOne(id: string) {
    return this.userModel.findByPk(id, { where: { isActive: true } } as any);
  }

  async findByPhone(phone: string) {
    return this.userModel.findOne({ where: { phone, isActive: true } } as any);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const [affected, updatedUsers] = await this.userModel.update(
      updateUserDto as any,
      { where: { id, isActive: true }, returning: true },
    );
    return {
      affected,
      updatedUsers: updatedUsers[0],
    };
  }

  async remove(id: string) {
    const affected = await this.userModel.update(
      { isActive: false },
      { where: { id, isActive: true } },
    );
    return { affected };
  }
}
