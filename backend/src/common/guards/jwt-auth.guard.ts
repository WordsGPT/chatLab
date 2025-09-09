import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// JWT authentication guard to protect routes
// It uses the 'jwt' strategy defined in the application
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
