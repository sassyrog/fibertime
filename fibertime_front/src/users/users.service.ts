import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './user.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  create(createUserDto: CreateUserDto) {
    return this.userModel.create(createUserDto as any);
  }

  findAll() {
    return this.userModel.findAll({
      attributes: ['id', 'name', 'email', 'phone'],
      where: { isActive: true },
      order: [['name', 'ASC']],
    });
  }

  findOne(id: number) {
    return this.userModel.findByPk(id, { where: { isActive: true } } as any);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const [affected, updatedUsers] = await this.userModel.update(
      updateUserDto as any,
      { where: { id, isActive: true }, returning: true },
    );
    return {
      affected,
      updatedUsers: updatedUsers[0],
    };
  }

  async remove(id: number) {
    const affected = await this.userModel.update(
      { isActive: false },
      { where: { id, isActive: true } },
    );
    return { affected };
  }
}
