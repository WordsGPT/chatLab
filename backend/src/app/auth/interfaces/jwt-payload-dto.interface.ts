import { UserRole } from "@core/enums/user-role.enum";

// Interface representing the structure of a JWT payload
export interface JwtPayloadDto {
  sub: string;
  email: string;
  username: string;
  role: UserRole;
  iat: number;
  exp: number;
}