import { Request } from 'express';

import { AuthenticatedUserDto } from '@auth/dto/authenticated-user.dto';

// This interface extends the Express Request object to include a user property
// Used for the request from the Passport strategies
export interface RequestWithUser extends Request {
  user: AuthenticatedUserDto;
}
