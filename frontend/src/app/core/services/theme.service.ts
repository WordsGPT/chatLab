import { Injectable, signal } from '@angular/core';

import { ThemePreference } from '@core/enums/theme-preference.enum';

// This service manages the application's theme settings
@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  // Signal to manage the current theme
  private readonly _currentTheme = signal(ThemePreference.AUTO);
  readonly currentTheme = this._currentTheme.asReadonly();

  // Array of valid themes
  readonly validThemes = Object.values(ThemePreference);

  /**
   * Initialize the theme service
   * This method checks the saved theme in local storage and applies it
   * If no valid theme is found, it defaults to the user's system preference
   */
  initializeTheme(): void {
    try {
      const savedTheme = this.getTheme();
      
      if (savedTheme && this.validThemes.includes(savedTheme as ThemePreference)) {
        this.applyTheme(savedTheme as ThemePreference);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.applyTheme(prefersDark ? ThemePreference.DARK : ThemePreference.LIGHT);
      }
    } catch (error) {
      this.applyTheme(ThemePreference.LIGHT);
    }
  }

  /**
   * Get the theme from local storage
   * 
   * @returns The saved theme or null if not found
   */
  getTheme(): string | null {
    return localStorage.getItem('theme');
  }

  /**
   * Set the theme for the application
   * This method applies the theme and saves it to local storage
   * 
   * @param theme - The theme to set
   */
  setTheme(theme: ThemePreference): void {
    this.applyTheme(theme);
    localStorage.setItem('theme', theme);
  }

  /**
   * Delete the theme from local storage
   */
  deleteTheme(): void {
    localStorage.removeItem('theme');
  }

  /**
   * Apply the theme to the application
   * This method sets the theme attribute on the document element
   * 
   * @param theme - The theme to apply
   */
  private applyTheme(theme: ThemePreference): void {
    let actualTheme = theme;

    if (theme === ThemePreference.AUTO) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      actualTheme = prefersDark ? ThemePreference.DARK : ThemePreference.LIGHT;
    }

    this._currentTheme.set(theme);
    document.documentElement.setAttribute('data-theme', actualTheme);
  }
}
