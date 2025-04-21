import {
  Column,
  Model,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../users/user.model';

// define connection status enum\
export enum ConnectionStatus {
  Connected = 'connected',
  Expired = 'expired',
  Disconnected = 'disconnected',
}

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

  @Column({ type: DataType.STRING(100) })
  declare deviceKey: string;

  @Column({
    type: DataType.ENUM(
      ConnectionStatus.Connected,
      ConnectionStatus.Expired,
      ConnectionStatus.Disconnected,
    ),
    defaultValue: 'disconnected',
  })
  declare connectionStatus: string;

  @Column({ type: DataType.DATE, allowNull: true })
  declare connectionExpiration: Date;

  @BelongsTo(() => User)
  declare user: User;
}
