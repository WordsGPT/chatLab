import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

// This component is displayed when a requested route is not found.
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {

  // Injecting dependencies
  private readonly router = inject(Router);

  /*
   * Redirects the user to the home page
   */
  protected goHome(): void {
    this.router.navigate(['/']);
  }
}
