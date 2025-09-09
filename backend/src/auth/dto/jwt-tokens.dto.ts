import { IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

// DTO for structure the JWT tokens used in authentication
export class JwtTokensDto {
  @ApiProperty({
    description: 'JWT Access Token que se usará para autenticar las peticiones',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYzQyOGMxNC00M2YyLTQzN2UtYTMyYi1lNzE0YWEzNjdiMDkiLCJlbWFpbCI6ImFsZWphbmRyb0BhLmNvbSIsInVzZXJuYW1lIjoiYWxleCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU1NDIyNTc2LCJleHAiOjE3NTU0MjYxNzZ9.gF_PXknVgKmHU9pG9YmVLK2Z4n33-Vi4q3sMRzpd2TE',
  })
  @IsString()
  access_token: string;

  @ApiProperty({
    description:
      'JWT Refresh Token que se usará para obtener un nuevo access token cuando expire',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlYzQyOGMxNC00M2YyLTQzN2UtYTMyYi1lNzE0YWEzNjdiMDkiLCJlbWFpbCI6ImFsZWphbmRyb0BhLmNvbSIsInVzZXJuYW1lIjoiYWxleCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU1NDIyNTc2LCJleHAiOjE3NTYwMjczNzZ9.Yeya4rxO3_3W-Hr6K9cfggahgCtvN4nvQWvhHwBQ71c',
  })
  @IsString()
  refresh_token: string;
}
