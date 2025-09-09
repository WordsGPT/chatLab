import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { LoginService } from '@core/services/login.service';
import { UserService } from '@core/services/user.service';

// This component represents the header of the application
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  // Injecting dependencies
  private readonly loginService = inject(LoginService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  // Properties to manage user state
  protected readonly currentUser = this.userService.currentUser;
  protected readonly isLoggedIn = this.loginService.isLoggedIn;

  /*   
   * Method to navigate to the home page
   */
  protected goHome(): void {
    this.router.navigate(['/']);
  }

  /*   
   * Method to navigate to the settings page
   * It passes the current URL as state to the settings page
   */
  protected goToSettings(): void {
    this.router.navigate(['/settings'], {
      state: { from: this.router.url }
    });
  }

  /*
   * Method to handle user logout
   */
  protected logout(): void {
    this.loginService.logout()
  }
}
