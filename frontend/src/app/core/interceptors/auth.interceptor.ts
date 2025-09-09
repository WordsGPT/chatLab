import { inject } from '@angular/core';
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

import { REFRESH_AUTH, SKIP_AUTH } from '@core/constants/http-context-token';
import { LoginService } from '@core/services/login.service';

// This interceptor adds the Authorization header to HTTP requests
// Skips for login and registration requests
// Uses access token for normal requests and refresh token for refresh requests
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {

  // Injecting dependencies
  const loginService = inject(LoginService);

  // Retrieve tokens and context flags
  const tokens = loginService.getTokens();
  const skipAuth = req.context.get(SKIP_AUTH);
  const refreshAuth = req.context.get(REFRESH_AUTH);

  let headers = req.headers;

  // Define headers for the request
  if (!(req.body instanceof FormData)) {
    headers = headers.set('Content-Type', 'application/json');
  }

  // Add Authorization header with access token for normal requests
  if (tokens && !skipAuth) {
    headers = headers.set('Authorization', `Bearer ${tokens.access_token}`);
  }

  // Add Authorization header with refresh token for refresh requests
  if (tokens && refreshAuth) {
    headers = headers.set('Authorization', `Bearer ${tokens.refresh_token}`);
  }

  // Clone the request with the new headers and returned
  const authReq = req.clone({ headers });
  return next(authReq);
};