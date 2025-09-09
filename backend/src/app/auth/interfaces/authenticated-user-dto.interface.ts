import { UserRole } from '@core/enums/user-role.enum';

// Interface representing the authenticated user data transfer object
export interface AuthenticatedUserDto {
    id: string;
    email: string;
    username: string;
    role: UserRole;
}