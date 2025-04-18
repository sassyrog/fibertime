import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../users/user.model';

@Table({ tableName: 'devices' })
export class Device extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  declare userId: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare name: string;

  @Column({ type: DataType.STRING(4), allowNull: true })
  declare pairingCode: string;

  @Column({
    type: DataType.ENUM('connected', 'expired', 'disconnected'),
    defaultValue: 'disconnected',
  })
  declare connectionStatus: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW, allowNull: true })
  declare connectionExpiration: Date;

  @BelongsTo(() => User)
  declare user: User;
}
