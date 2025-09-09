import { LoginReqDto } from "@auth/interfaces/login-req-dto.interface";

// Interface for registration data transfer object
// This interface extends LoginReqDto to include a username field
export interface RegisterDto extends LoginReqDto {
    username: string;
}