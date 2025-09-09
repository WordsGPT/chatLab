import { inject } from '@angular/core';
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { tap } from 'rxjs';

import { ORIGIN } from '@core/constants/http-context-token';
import { MessageService } from '@core/services/message.service';

// Interceptor to log HTTP requests
export const loggerInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {

  // Injecting dependencies
  const messageService = inject(MessageService);

  // Extracting the origin from the request context
  const origin = req.context.get(ORIGIN);

  // If the request method is OPTIONS, skip logging
  if (req.method === 'OPTIONS') {
    return next(req);
  }

  // Log the HTTP request details
  return next(req).pipe(
    tap(_ => messageService.add(`${origin} - HTTP: [${req.method}] from ${req.urlWithParams}`))
  );
};
