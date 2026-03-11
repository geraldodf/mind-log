import { Role } from '../models/user/role.interface';

export interface UserRegisterDTO {
    name: string;
    username: string;
    email: string;
    password: string;
    roles: Role[];
  }