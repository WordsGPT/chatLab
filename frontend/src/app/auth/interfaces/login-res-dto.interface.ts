import { JwtTokensDto } from '@auth/interfaces/jwt-tokens-dto.interface';
import { AuthenticatedUserDto } from '@auth/interfaces/authenticated-user-dto.interface';

import { ThemePreference } from '@core/enums/theme-preference.enum';

// Interface for login response data transfer object
// This interface extends AuthenticatedUserDto to include the JWT tokens
export interface LoginResDto extends AuthenticatedUserDto {
    tokens: JwtTokensDto;
    themePreference: ThemePreference;
}