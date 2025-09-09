import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';

import { HeaderComponent } from '@core/components/header/header.component';
import { ThemeService } from '@core/services/theme.service';

// The main application component that serves as the root of the Angular application
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, NgxSonnerToaster, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  
  // Injecting dependencies
  private readonly themeService = inject(ThemeService);

  constructor() {
    this.themeService.initializeTheme();
  }
}
