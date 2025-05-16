import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule]
})
export class AuthComponent {
  activeTab: 'login' | 'register' = 'login';

  loginForm: FormGroup;
  registerForm: FormGroup;

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  setActiveTab(tab: 'login' | 'register') {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')!.value === form.get('confirmPassword')!.value
      ? null : { mismatch: true };
  }

  onLogin() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      if (this.loginForm.value.email === 'user@example.com' && this.loginForm.value.password === 'password') {
        this.successMessage = 'Login successful!';
      } else {
        this.errorMessage = 'Invalid email or password.';
      }
    }, 1500);
  }

  onRegister() {
    if (this.registerForm.invalid) return;
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Simulate API call
    setTimeout(() => {
      this.loading = false;
      this.successMessage = 'Registration successful! You can now login.';
      this.registerForm.reset();
      this.setActiveTab('login');
    }, 1500);
  }
}
