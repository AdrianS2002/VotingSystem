import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
  
})
export class AuthComponent {
  activeTab: 'login' | 'register' = 'login';

  loginForm: FormGroup;
  registerForm: FormGroup;

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
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

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).pipe(
      catchError(err => {
        this.errorMessage = err.message || 'Login failed.';
        this.loading = false;
        return of(null);
      })
    ).subscribe((res: any) => {
      if (res) {
        this.successMessage = 'Login successful!';
        this.loginForm.reset();
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      }
      this.loading = false;
    });
  }

  onRegister() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const {name, email, password } = this.registerForm.value;

    this.authService.signup(name,email, password).pipe(
      catchError(err => {
        this.errorMessage = err.message || 'Registration failed.';
        this.loading = false;
        return of(null);
      })
    ).subscribe((res: any) => {
      if (res) {
        this.successMessage = 'Registration successful! Please verify your email.';
        this.registerForm.reset();
        this.setActiveTab('login');
      }
      this.loading = false;
    });
  }
}
