import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [NgIf, CommonModule],
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();

 constructor(private router: Router, public authService: AuthService) {}

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

  logout(event: Event) {
  event.preventDefault();
  this.authService.logout();
}
}
