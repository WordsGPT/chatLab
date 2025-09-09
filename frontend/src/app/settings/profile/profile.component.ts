import { NgClass } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { UserService } from '@core/services/user.service';

// This component manages the user's profile settings
// It uses Angular's Reactive Forms for form management and validation, and integrates with a UserService for profile operations
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: '../styles/children-settings.scss'
})
export class ProfileComponent implements OnDestroy {

  // Injecting dependencies
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  // Properties for managing form state and user interaction
  protected readonly user = this.userService.currentUser;
  protected readonly loading = this.userService.loading;
  protected readonly submitted = this.userService.submitted;

  protected profileError: string | null = null;

  // Lifecycle hook to cancel any possible submission during the component's lifecycle
  ngOnDestroy(): void {
    this.userService.cancelSubmit();
  }

  // Reactive form for profile management with validation rules
  protected profileForm: FormGroup = this.fb.group({
    email: [this.user()!.email, [Validators.required, Validators.email, Validators.maxLength(254)]],
    username: [this.user()!.username, [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    role: [this.user()!.role, Validators.required]
  });

  /**
   * Check if a form field is invalid
   * 
   * @param controlName The name of the form control
   * @param errorName The name of the error to check
   * @returns True if the field is invalid, false otherwise
   */
  protected isFieldInvalid(controlName: string, errorName: string): boolean | undefined {
    const control = this.profileForm.get(controlName);
    return !!(control?.hasError(errorName));
  }

  /*
   * Method to see if the profile form have changed
   */
  protected get isUnchanged(): boolean {
    const { email, username } = this.profileForm.value;
    return email === this.user()!.email && username === this.user()!.username;
  }

  /* 
   * Method to handle form submission
   */
  protected onSubmit(): void {
    this.profileError = null;
    this.userService.submit();

    if (this.profileForm.invalid) {
      this.profileError = 'Please complete all fields correctly.';
      return;
    }

    const { email, username } = this.profileForm.value;
    this.userService.editProfile({email, username});
  }
}
