import { inject } from '@angular/core';
import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { toast } from 'ngx-sonner';

import { ORIGIN, REFRESH_AUTH } from '@core/constants/http-context-token';
import { ERROR_HANDLERS, DEFAULT_ERROR_HANDLER } from '@core/constants/http-error-handler';
import { LoginService } from '@core/services/login.service';

// Interceptor to handle HTTP errors globally
// It intercepts HTTP requests and handles errors based on their status codes
// It also provides specific handling for authentication-related errors
export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {

  // Injecting dependencies
  const loginService = inject(LoginService);

  // Function to handle authentication errors
  function handleAuthError(req: HttpRequest<unknown>, error: HttpErrorResponse, loginService: LoginService) {
    if (req.url.includes('/auth/login') && error.status === 401) {
      toast.error('Invalid email or password. Please try again.');
      return throwError(() => error);
    }

    if (req.url.includes('/auth/login') && error.status === 403) {
      toast.error('Your account is inactive. Please contact support.');
      return throwError(() => error);
    }

    if (req.url.includes('/auth/register') && error.status === 409) {
      toast.error("This email is already registered. Please use a different email or try logging in.");
      return throwError(() => error);
    }

    if (req.url.includes('/auth/logout')) {
      return throwError(() => error);
    }

    const handler = ERROR_HANDLERS[error.status] || DEFAULT_ERROR_HANDLER;
    toast.error(handler.message);
    
    if (handler.action) {
      handler.action(loginService);
    }

    return throwError(() => error);
  }

  // Intercept the request and handle errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let handler = ERROR_HANDLERS[error.status] || DEFAULT_ERROR_HANDLER;

      const origin = req.context.get(ORIGIN);
      const isRefreshRequest = req.context.get(REFRESH_AUTH);
      
      if (isRefreshRequest && error.status === 401) {
        return throwError(() => error);
      }

      if (error.status === 401 && !isRefreshRequest) {
        return from(loginService.validateAuthStatus()).pipe(
          switchMap(() => {
            if (!loginService.isLoggedIn()) {
              toast.error('Session expired. Please log in again.')
              return throwError(() => error);
            }
            const tokens = loginService.getTokens();
            const cloned = req.clone({
              setHeaders: {
                Authorization: `Bearer ${tokens?.access_token}`,
              },
            });
            return next(cloned);
          })
        );
      }

      if (origin === 'LoginService') {
        return handleAuthError(req, error, loginService);
      }

      if (origin === 'UserService' && req.url.includes('/profile/change-password')) {
        handler.message = error.error.message
      }

      toast.error(handler.message);

      return throwError(() => error);
    })
  );
};