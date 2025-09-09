import { Component, inject } from '@angular/core';

import { ThemePreference } from '@core/enums/theme-preference.enum';
import { ThemeService } from '@core/services/theme.service';
import { UserService } from '@core/services/user.service';

// This component handles user preferences, including theme selection
@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [],
  templateUrl: './preferences.component.html',
  styleUrl: '../styles/children-settings.scss'
})
export class PreferencesComponent {

  // Injecting dependencies
  private readonly userService = inject(UserService);
  private readonly themeService = inject(ThemeService);

  // Properties for managing theme selection
  protected selectedTheme: string;
  
  protected readonly currentTheme = this.themeService.currentTheme;
  protected readonly loading = this.userService.loading;

  // Constructor to initialize the selected theme
  constructor() {
    this.selectedTheme = this.themeService.getTheme() || 'auto';
  }

  /**
   * Method to select a theme and save the preference in local storage
   */
  protected selectTheme(theme: string) {
    this.selectedTheme = theme;
    this.userService.changeTheme(theme as ThemePreference);
  }
}
