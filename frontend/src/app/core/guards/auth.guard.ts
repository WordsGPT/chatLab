import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { LoginService } from '@core/services/login.service';
import { UserService } from '@core/services/user.service';

// This guard checks if the user is logged in before allowing access to certain routes
export const authGuard: CanActivateFn = () => {

  // Injecting dependencies
  const loginService = inject(LoginService);
  const userService = inject(UserService);
  const router = inject(Router);

  // Check if the user is logged in
  const isLoggedIn = loginService.isLoggedIn;
  const isThemeRegistered = userService.themeRegistry;

  // Validate the authentication status
  loginService.validateAuthStatus();

  // If the user is not logged in, redirect to the login page
  if (!isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // If the theme is not registered, fetch the user's theme preference
  if (!isThemeRegistered()) {
    userService.getTheme();
  }

  return true;
};