import {Role} from './role.interface';

export interface User {
  id?: number,
  name: string,
  username: string,
  email: string,
  isEnabled?: boolean,
  roles?: Role[]
  createdAt?: Date,
  picture?: string | null;
}
