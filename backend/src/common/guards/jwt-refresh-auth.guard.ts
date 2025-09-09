import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// JWT refresh authentication guard to the route for refreshing access token
// It uses the 'jwt-refresh' strategy defined in the application
@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {}
