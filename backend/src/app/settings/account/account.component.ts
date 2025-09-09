import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { LoginService } from '@core/services/login.service';
import { UserService } from '@core/services/user.service';

// This component handles user account settings, including account deletion
// It uses Angular's Reactive Forms for form management and validation, and it integrates with UserService for account operations
@Component({
  selector: 'app-account',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrl: '../styles/children-settings.scss'
})
export class AccountComponent {

  // Injecting dependencies
  private readonly fb = inject(FormBuilder);
  private readonly loginService = inject(LoginService)
  private readonly userService = inject(UserService); 

  // Properties for managing form state and user interaction
  protected readonly loading = this.userService.loading;

  protected showDeleteModal = false;

  // Reactive form for account deletion with validation rules
  protected deleteForm = this.fb.group({
    confirmDelete: ['', [Validators.required, this.deleteValidator]]
  });

  /*
   * Method to handle account deletion
   */
  protected deleteAccount() {
    if (this.deleteForm.invalid) return;
    this.userService.softDeleteAccount();
    this.logout();
  }

  /*
   * Method to handle user logout
   */
  protected logout(): void {
    this.loginService.logout()
  }

  /*
   * Method to close the delete confirmation modal
   */
  protected closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.deleteForm.reset();
  }
  /*
   * Method to open the delete confirmation modal
   */
  protected openDeleteModal(): void {
    this.showDeleteModal = true;
    this.deleteForm.reset();
  }

  /**
   * Custom validator to check if the delete confirmation input is valid
   */
  private deleteValidator(control: AbstractControl): ValidationErrors | null {
    return control.value === 'DELETE' ? null : { notDelete: true };
  }
}
