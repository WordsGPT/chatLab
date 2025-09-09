import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

// This component serves as a container for the settings page
// It handles navigation and state management for the settings section of the application
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  
  // Injecting dependencies
  private readonly router = inject(Router);

  // Property to hold the route to navigate back to
  protected fromRoute?: string;

  // Constructor to initialize the route to navigate back to
  constructor() {
    const nav = this.router.getCurrentNavigation();
    this.fromRoute = nav?.extras.state?.['from'] ?? '/';
  }

  /*
   * Method to navigate back to the previous route or a default route
   */
  protected goBack(): void {
    this.router.navigateByUrl(this.fromRoute ?? '/');
  }
}
