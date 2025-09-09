import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { toast } from 'ngx-sonner';

import { environment } from '@env/environment';

import { AuthenticatedUserDto } from '@auth/interfaces/authenticated-user-dto.interface';
import { JwtTokensDto } from '@auth/interfaces/jwt-tokens-dto.interface';
import { JwtPayloadDto } from '@auth/interfaces/jwt-payload-dto.interface';
import { LoginReqDto } from '@auth/interfaces/login-req-dto.interface';
import { LoginResDto } from '@auth/interfaces/login-res-dto.interface';
import { RegisterDto } from '@auth/interfaces/register-dto.interface';

import { SKIP_AUTH, ORIGIN, REFRESH_AUTH } from '@core/constants/http-context-token';
import { UserService } from '@core/services/user.service';
import { ThemeService } from '@core/services/theme.service';

// This service handles user authentication, including login, registration, and logout functionalities.
@Injectable({
  providedIn: 'root' 
})
export class LoginService {

  // Injecting dependencies
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  // URLs for the backend server
  private readonly serverUrl = environment.BACKEND_URI;
  private readonly loginUrl = `${this.serverUrl}/auth`;

  // Signals to manage the login state and exposing the login state as a readonly signal
  private readonly _isLoggedIn = signal<boolean>(!!this.getTokens());
  private readonly _loading = signal(false);
  private readonly _submitted = signal(false);

  readonly isLoggedIn = this._isLoggedIn.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly submitted = this._submitted.asReadonly();

  // Constructor to initialize the service and set the current user from stored tokens
  constructor() {
    const tokens = this.getTokens();
    if (tokens) {
      try {
        const payload: JwtPayloadDto = JSON.parse(atob(tokens.access_token.split('.')[1]));
        const user: AuthenticatedUserDto = {
          id: payload.sub,
          email: payload.email,
          username: payload.username,
          role: payload.role,
        };
        this.userService.setUser(user);
      } catch {
        this.userService.setUser(null);
      }
    }
  }

  // ------------------ HTTP Requests ------------------

  /** POST */

  /**
   * Login to the application
   * This method sends a POST request to the backend server with the user's email and password
   * It retrieves the access and refresh tokens, sets the current user, and navigates to the home page
   * Use SKIP_AUTH context to skip authentication for this request and ORIGIN to identify the service
   * 
   * @param email     - The email of the user
   * @param password  - The password of the user
   */
  login(email: string, password:string): void {
    const url = `${this.loginUrl}/login`;

    const context = new HttpContext()
      .set(ORIGIN, 'LoginService')
      .set(SKIP_AUTH, true);

    const loginDto: LoginReqDto = {
      email,
      password
    };

    this._loading.set(true);

    this.http.post<LoginResDto>(url, loginDto, { context })
      .pipe(
        finalize(() => this._loading.set(false))
      )
      .subscribe((response: LoginResDto) => {
        this._submitted.set(false);
        const { tokens, ...user } = response;
        this.createToken(tokens.access_token, tokens.refresh_token);
        this.themeService.setTheme(response.themePreference);
        this.userService.setUser(user);
        this.userService.setThemeRegistry();
        this._isLoggedIn.set(true);
        this.router.navigate(['/']);
      });
  }

  /**
   * Logout from the application
   * This method sends a POST request to the backend server to log out the user
   * It deletes the tokens from local storage, sets the current user to null, and navigates to the login page
   * Use ORIGIN context to identify the service
   */
  logout(): void {
    const url = `${this.loginUrl}/logout`;

    const context = new HttpContext()
      .set(ORIGIN, 'LoginService')

    this.http.post<void>(url, {}, { context })
      .subscribe({
        next: () => {
          this.silentLogout();
        },
        error: () => {
          this.silentLogout();
        }
      });
  }

  /**
   * Sing up to the application
   * This method sends a POST request to the backend server with the user's email, username, and password
   * It creates a new user account and navigates to the login page saving the email in the router state
   * Use SKIP_AUTH context to skip authentication for this request and ORIGIN to identify the service
   * 
   * @param email - The email of the user.
   * @param username - The username of the user.
   * @param password - The password of the user.
   */
  register(email: string, username:string, password:string): void {
    const url = `${this.loginUrl}/register`;

    const context = new HttpContext()
      .set(ORIGIN, 'LoginService')
      .set(SKIP_AUTH, true);

    const registerDto: RegisterDto = {
      email,
      username,
      password
    };

    this._loading.set(true);

    this.http.post<void>(url, registerDto, { context })
      .pipe(
        finalize(() => this._loading.set(false))
      )
      .subscribe(() => {
        this._submitted.set(false);
        this.router.navigate(['/login'], { 
          state: { 
            email: email
          }
        });
        toast.success('Account created successfully! Please log in with your credentials.');
      });
  }

  /**
   * Refresh the access token using the refresh token
   * This method sends a POST request to the backend server to refresh the access token
   * If successful, it updates the access token in local storage and returns true
   * If it fails, it logs out the user and returns false
   * Use REFRESH_AUTH context to indicate that this request is for refreshing authentication
   * 
   * @returns A promise that resolves to a boolean indicating whether the refresh was successful
   */
  private async refreshTokens(): Promise<boolean> {
    const url = `${this.loginUrl}/refresh`;

    const context = new HttpContext()
      .set(ORIGIN, 'LoginService')
      .set(SKIP_AUTH, true)
      .set(REFRESH_AUTH, true);
    
    try {
      const response = await firstValueFrom(
        this.http.post(url, {}, { 
          context, 
          responseType: 'text'
        })
      );

      const newAccessToken = response;
      this.createToken(newAccessToken);

      return true;

    } catch (error) {
      this.logout();
      return false;
    }
  }

  // ------------------ Token Management ---------------

  /**
   * Get the tokens from local storage
   * 
   * @returns A JwtTokensDto representing the token if the user is logged in, or null if not.
  */
  getTokens(): JwtTokensDto | null {
    const access_token = localStorage.getItem('chatwords_access');
    const refresh_token = localStorage.getItem('chatwords_refresh');

    if (!access_token || !refresh_token) {
      return null;
    }

    return {
      access_token: access_token, 
      refresh_token: refresh_token
    }
  }

  /**
   * Validate the authentication status of the user
   * This method checks if the tokens are present and valid
   * If the tokens are invalid or expired, it deletes them and sets the login state to false
   */
  async validateAuthStatus(): Promise<void> {
    const tokens = this.getTokens();
    if (!tokens) {
      this._isLoggedIn.set(false);
      return;
    }

    const isValid = await this.areTokensValid(tokens);
    this._isLoggedIn.set(isValid);
    
    if (!isValid) {
      this.deleteTokens();
    }
  }

  /**
   * Check if the tokens are valid
   * This method decodes the JWT tokens to check their expiration times
   * If the refresh token is expired, it logs out the user
   * If the access token is expired, it attempts to refresh the tokens
   * 
   * @param tokens - The JWT tokens to validate
   * @returns A boolean indicating whether the tokens are valid or not
   */
  private async areTokensValid(tokens: JwtTokensDto): Promise<boolean> {
    try {
      const accessPayload  = JSON.parse(atob(tokens.access_token.split('.')[1]));
      const refreshPayload = JSON.parse(atob(tokens.refresh_token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (refreshPayload.exp <= now) {
        this.logout();
        return false;
      }
      
      if (accessPayload.exp <= now) {
        const refreshed = await this.refreshTokens();
        this._isLoggedIn.set(refreshed);
        return refreshed;
      }
      return true;

    } catch (error) {
      return false;
    }
  }

  /**
   * Set the tokens in local storage.
  */
  private createToken(access_token: string, refresh_token?: string) {
    localStorage.setItem('chatwords_access', access_token);

    if (refresh_token) {
      localStorage.setItem('chatwords_refresh', refresh_token);
    }
  }

  /**
   * Delete the tokens from local storage.
  */
  private deleteTokens() {
    localStorage.removeItem('chatwords_access');
    localStorage.removeItem('chatwords_refresh');
  }

  // ------------------ Auxiliary Methods --------------

  /**
   * Silent logout from the application
   * This method deletes the tokens and the theme from local storage, sets the current user to null, and navigates to the login page if not already there
   */
  private silentLogout(): void {
    this.deleteTokens();
    this.themeService.deleteTheme();
    this.userService.setUser(null);
    this._isLoggedIn.set(false);
    
    if (!this.router.url.includes('/login')) {
      this.router.navigate(['/login']);
    }

    toast.success('Logout successfully');
  }

  /**
   * Set the submitted state to true
   * This method is used to indicate that the login or registration form has been submitted
   */
  submit(): void {
    this._submitted.set(true);
  }
}