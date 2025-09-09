// Interface representing the structure of JWT tokens
// Contains both access and refresh tokens
export interface JwtTokensDto {
    access_token: string; 
    refresh_token: string
}