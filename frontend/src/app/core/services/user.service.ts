import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { toast } from 'ngx-sonner';

import { environment } from '@env/environment';

import { AuthenticatedUserDto } from '@auth/interfaces/authenticated-user-dto.interface';

import { ORIGIN } from '@core/constants/http-context-token';
import { ThemePreference } from '@core/enums/theme-preference.enum';
import { ThemeService } from '@core/services/theme.service';

// This service is responsible for managing user-related operations such as editing profile, changing password, and soft deleting account
@Injectable({
  providedIn: 'root'
})
export class UserService {

  // Injecting dependencies
  private readonly http = inject(HttpClient);
  private readonly themeService = inject(ThemeService);

  // URLs for the backend server
  private readonly serverUrl = environment.BACKEND_URI;
  private readonly userUrl = `${this.serverUrl}/profile`;

  // Signals to manage the state of the user, loading, and submitted status
  private readonly _currentUser = signal<AuthenticatedUserDto | null>(null);
  private readonly _loading = signal(false);
  private readonly _themeRegistry = signal(false);
  private readonly _submitted = signal(false);

  readonly currentUser = this._currentUser.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly themeRegistry = this._themeRegistry.asReadonly();
  readonly submitted = this._submitted.asReadonly();

  // ------------------ HTTP Requests ------------------

  /** GET */

  /**
   * Get the user's theme preference
   */
  getTheme(): void {
    const url = `${this.userUrl}/theme`;
    const context = new HttpContext()
      .set(ORIGIN, 'UserService');

    this.http.get<{ theme: ThemePreference }>(url, { context })
      .subscribe((response) => {
        this.themeService.setTheme(response.theme);
        this.setThemeRegistry();
      });
  }

  /** PATCH */

  /**
   * Change the user's theme preference
   * This method sends a PATCH request to the backend to change the user's theme preference
   * 
   * @param theme - The new theme preference to set
   */
  changeTheme(theme: ThemePreference): void {
    const url = `${this.userUrl}/change-theme`;

    const context = new HttpContext()
      .set(ORIGIN, 'UserService');

    this._loading.set(true);

    this.http.patch<{ message: string }>(url, { theme }, { context })
      .pipe(
        finalize(() => this._loading.set(false))
      )
      .subscribe((response) => {
          this.themeService.setTheme(theme);
          toast.success(response.message);
        });
  }

  /**
   * Change the user's password
   * This method sends a PATCH request to the backend to change the user's password
   * 
   * @param currentPassword - The current password of the user
   * @param newPassword - The new password to set for the user
   */
  changePassword(currentPassword: string, newPassword: string): void {
    const url = `${this.userUrl}/change-password`;

    const context = new HttpContext()
      .set(ORIGIN, 'UserService')
    
    this._loading.set(true);

    const changePasswordDto = {
      currentPassword: currentPassword,
      newPassword: newPassword
    };

    this.http.patch<{ message: string }>(url, changePasswordDto, { context })
      .pipe(
        finalize(() => this._loading.set(false))
      )
      .subscribe((response) => {
        this._submitted.set(false);
        toast.success(response.message);
      });
  }

  /**
   * Edit the current user data
   * This method sends a PATCH request to the backend to update the user profile
   * 
   * @param updateUserData - The data to update the user profile with
   */
  editProfile(updateUserData: Partial<AuthenticatedUserDto>): void {
    const url = `${this.userUrl}/edit`;

    const context = new HttpContext()
      .set(ORIGIN, 'UserService')
    
    this._loading.set(true);

    this.http.patch<AuthenticatedUserDto>(url, updateUserData, { context })
      .pipe(
        finalize(() => this._loading.set(false))
      )
      .subscribe((response: AuthenticatedUserDto) => {
        this._submitted.set(false);
        this.setUser(response);
        toast.success('Profile updated successfully');
      });
  }

  /** DELETE */

  /**
   * Soft delete the user's account
   * This method sends a DELETE request to the backend to soft delete the user's account
   */
  softDeleteAccount(): void {
    const url = `${this.userUrl}/soft-delete`;

    const context = new HttpContext()
      .set(ORIGIN, 'UserService');

    this._loading.set(true);

    this.http.delete<{ message: string }>(url, { context })
      .pipe(
        finalize(() => this._loading.set(false))
      )
      .subscribe((response) => {
        toast.success(response.message);
        this.clearUserData();
      });
  }

  // ------------------ Auxiliary Methods --------------

  /**
   * Set the current user data
   * 
   * @param user - The authenticated user data to set
   */
  setUser(user: AuthenticatedUserDto | null): void {
    this._currentUser.set(user);
  }

  /**
   * Set the theme registry state
   */
  setThemeRegistry(): void {
    this._themeRegistry.set(true);
  }

  /**
   * Set the submitted state to true
   * This method is used to indicate that the user form has been submitted
   */
  submit(): void {
    this._submitted.set(true);
  }

  /**
   * Set the submitted state to false
   * This method is used to cancel the user form has been submitted
   */
  cancelSubmit(): void {
    this._submitted.set(false);
  }

  /**
   * Clear the current user data
   */
  private clearUserData(): void {
    this._currentUser.set(null);
  }
}
