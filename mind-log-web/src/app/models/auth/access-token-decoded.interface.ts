import {RolesEnum} from "../../enums/roles.enum";

export interface AccessTokenDecoded {
  sub: string,
  roles: RolesEnum[],
  completeName: string,
  id: number,
  iss: string,
  exp: number,
  picture?: string;
}
