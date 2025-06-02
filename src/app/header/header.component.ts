import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [NgIf, CommonModule],
  standalone: true
})
export class HeaderComponent {
  constructor(private router: Router, public authService: AuthService) { }

  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToHome(event: Event) {
    event.preventDefault();
    this.router.navigate(['/']);
  }

  navigateToPolls(event: Event) {
    event.preventDefault();
    this.router.navigate(['/polls']);
  }

  navigateToAuth(event: Event) {
    event.preventDefault();
    console.log('Login clicked, navigating...');
    this.router.navigate(['/auth']);
  }

  navigateToMyPolls(event: Event) {
    event.preventDefault();
    this.router.navigate(['/my-polls']);
  }

  isAdmin(): boolean {
    const profile = this.authService.currentUserProfile;
    return profile?.role === 'admin';
  }

  logout(event: Event) {
    event.preventDefault();
    this.authService.logout();
  }




}
