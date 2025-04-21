export class CreateUserDto {
  name?: string;
  email?: string;
  phone: string;
  isActive?: boolean;
  lastLogin?: Date;
}
