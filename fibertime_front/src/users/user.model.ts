import { Column, Model, Table, DataType, HasMany } from 'sequelize-typescript';
import { Device } from 'src/devices/device.model';

@Table({ tableName: 'users' })
export class User extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;
  @Column({ type: DataType.STRING(100) })
  declare name: string;
  @Column({ type: DataType.STRING(100), unique: true, allowNull: true })
  declare email: string;
  @Column({ type: DataType.STRING(100), unique: true })
  declare phone: string;
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  declare isActive: boolean;
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  declare lastLogin: Date;

  @HasMany(() => Device)
  declare devices: Device[];
}
