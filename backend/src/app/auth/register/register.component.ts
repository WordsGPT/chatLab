import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { LoginService } from '@core/services/login.service';

// This component handles the user registration functionality
// It uses Angular's Reactive Forms for form management and validation, and it integrates with a LoginService to handle the registration logic
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: '../styles/auth.scss',
})
export class RegisterComponent {

  // Injecting dependencies
  private fb = inject(FormBuilder);
  private readonly loginService = inject(LoginService);

  // Properties for managing form state and user interaction
  protected readonly loading = this.loginService.loading;
  protected readonly submitted = this.loginService.submitted;
  
  protected registerError: string | null = null;
  protected showPassword = false;
  protected showConfirmPassword = false;

  // Reactive form for registration with validation rules
  protected registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(255)]],
    confirmPassword: ['', Validators.required] 
  }, {
    validators: this.passwordMatchValidator
  });

  /* 
   * Method to handle form submission
   */
  protected onSubmit(): void {
    this.registerError = null;
    this.loginService.submit();

    if (this.registerForm.invalid) {
      this.registerError = 'Please complete all fields correctly.';
      return;
    }

    const { email, username, password } = this.registerForm.value;
    this.loginService.register(email!, username!, password!);
  }      

  /**
   * Check if a form field is invalid
   * 
   * @param controlName The name of the form control
   * @param errorName The name of the error to check
   * @returns True if the field is invalid, false otherwise
   */
  protected isFieldInvalid(controlName: string, errorName: string): boolean | undefined {
    const control = this.registerForm.get(controlName);
    return !!(control?.hasError(errorName));
  }

  /* 
   * Method to toggle the visibility of the password field
   */
  protected togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /* 
   * Method to toggle the visibility of the confirm password field
   */
  protected toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /*
   * Method to handle form validation for matching passwords
   ^
   * @param control - The form group control containing password fields
   * @returns ValidationErrors or null if passwords match
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPasswordControl = control.get('confirmPassword');
    const confirmPassword = confirmPasswordControl?.value;

    if (!password || !confirmPassword || !confirmPasswordControl) {
      return null;
    }

    if (password !== confirmPassword) {
      confirmPasswordControl.setErrors({ ...confirmPasswordControl.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    }

    const errors = { ...confirmPasswordControl.errors };
    if (errors['passwordMismatch']) {
      delete errors['passwordMismatch'];
      confirmPasswordControl.setErrors(Object.keys(errors).length ? errors : null);
    }

    return null;
  }
}
