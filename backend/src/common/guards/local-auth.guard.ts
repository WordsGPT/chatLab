import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Local authentication guard to protect the login route
// It uses the 'local' strategy defined in the application
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
