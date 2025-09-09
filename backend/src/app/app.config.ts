import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { loggerInterceptor } from '@core/interceptors/logger.interceptor';

// This is the main configuration file for the Angular application
// It sets up the application with necessary providers and interceptors
// The application uses zone change detection, routing, and HTTP client with interceptors
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      authInterceptor,
      loggerInterceptor,
      errorInterceptor
    ])),
  ]
};
