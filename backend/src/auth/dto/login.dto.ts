import { ApiProperty } from '@nestjs/swagger';

import { AuthenticatedUserDto } from '@auth/dto/authenticated-user.dto';
import { JwtTokensDto } from '@auth/dto/jwt-tokens.dto';
import { ThemePreference } from '@users/enums/theme-preference.enum';

// DTO for login response structure
export class LoginDto extends AuthenticatedUserDto {
  @ApiProperty({
    description: 'Access and Refresh tokens for the authenticated session',
    type: JwtTokensDto,
  })
  tokens: JwtTokensDto;

  @ApiProperty({
    description: 'User theme preference',
    enum: ThemePreference,
  })
  themePreference: ThemePreference;
}
