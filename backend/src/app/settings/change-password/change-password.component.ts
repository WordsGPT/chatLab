import { NgClass } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { UserService } from '@core/services/user.service';

// This component handles the functionality for changing a user's password
// It uses Angular's Reactive Forms for form management and validation, and it integrates with a UserService to handle the password change logic
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: '../styles/children-settings.scss'
})
export class ChangePasswordComponent implements OnDestroy {

  // Injecting dependencies
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  // Properties for managing form state and user interaction
  protected readonly user = this.userService.currentUser;
  protected readonly loading = this.userService.loading;
  protected readonly submitted = this.userService.submitted;
  
  protected passwordError: string | null = null;
  protected showCurrentPassword = false;
  protected showNewPassword = false;

  // Lifecycle hook to cancel any possible submission during the component's lifecycle
  ngOnDestroy(): void {
    this.userService.cancelSubmit();
  }

  // Reactive form for changing password with validation rules
  protected passwordForm: FormGroup = this.fb.group({
    currentPassword: ["", Validators.required],
    newPassword: ["", [Validators.required, Validators.minLength(4), Validators.maxLength(255)]],
  }, {
    validators: this.passwordMatchValidator
  });

  /* 
   * Method to handle form submission
   */
  protected onSubmit(): void {
    this.passwordError = null;
    this.userService.submit();

    if (this.passwordForm.invalid) {
      this.passwordError = 'Please complete all fields correctly.';
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;
    this.userService.changePassword(currentPassword, newPassword);
    this.passwordForm.reset();
  }

  /**
   * Check if a form field is invalid
   * 
   * @param controlName The name of the form control
   * @param errorName The name of the error to check
   * @returns True if the field is invalid, false otherwise
   */
  protected isFieldInvalid(controlName: string, errorName: string): boolean | undefined {
    const control = this.passwordForm.get(controlName);
    return !!(control?.hasError(errorName) && (control.dirty || control.touched));
  }

  /* 
   * Method to toggle the visibility of the current password field
   */
  protected toggleCurrentPasswordVisibility(): void {
    this.showCurrentPassword = !this.showCurrentPassword;
  }

  /* 
   * Method to toggle the visibility of the new password field
   */
  protected toggleNewPasswordVisibility(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  /**
   * Custom validator to check if the new password matches the current password
   * 
   * @param control - The form group control containing password fields
   * @returns ValidationErrors or null if passwords match
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const currentPassword = control.get('currentPassword')?.value;
    const newPasswordControl = control.get('newPassword');
    const newPassword = newPasswordControl?.value;

    if (!currentPassword || !newPassword || !newPasswordControl) {
      return null;
    }

    if (currentPassword === newPassword) {
      newPasswordControl.setErrors({ ...newPasswordControl.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    }

    const errors = { ...newPasswordControl.errors };
    if (errors['passwordMismatch']) {
      delete errors['passwordMismatch'];
      newPasswordControl.setErrors(Object.keys(errors).length ? errors : null);
    }

    return null;
  }
}
