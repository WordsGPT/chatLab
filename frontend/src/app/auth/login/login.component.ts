import { NgClass } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { LoginService } from '@core/services/login.service';

// This component handles the user login functionality
// It uses Angular's Reactive Forms for form management and validation, and it integrates with a LoginService to handle the login logic
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: '../styles/auth.scss'
})
export class LoginComponent implements OnInit {
  
  // Injecting dependencies
  private fb = inject(FormBuilder);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

  // Properties for managing form state and user interaction
  protected readonly loading = this.loginService.loading;
  protected readonly submitted = this.loginService.submitted;

  protected loginError: string | null = null;
  protected showPassword = false;
  
  // Reactive form for login with validation rules
  protected loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]  
  });

  // Lifecycle hook for component initialization
  // It checks if there is an email in the navigation state to pre-fill the form from the registration process
  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state || history.state;
    
    if (state['email']) {
      this.loginForm.patchValue({
        email: state['email']
      });
    }
  }

  /* 
   * Method to handle form submission
   */
  protected onSubmit(): void {
    this.loginError = null;
    this.loginService.submit();

    if (this.loginForm.invalid) {
      this.loginError = 'Please complete all fields correctly.';
      return;
    }

    const { email, password } = this.loginForm.value;
    this.loginService.login(email!, password!);
  }

  /**
   * Check if a form field is invalid
   * 
   * @param controlName The name of the form control
   * @param errorName The name of the error to check
   * @returns True if the field is invalid, false otherwise
   */
  protected isFieldInvalid(controlName: string, errorName: string): boolean | undefined {
    const control = this.loginForm.get(controlName);
    return !!(control?.hasError(errorName));
  }

  /* 
   * Method to toggle the visibility of the password field
   */
  protected togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}