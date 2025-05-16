import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true
})
export class HeaderComponent {
  constructor(private router: Router) {}

  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToHome(event: Event) {
      event.preventDefault(); 
      this.router.navigate(['/']);
  }

    navigateToAuth(event: Event) {
      event.preventDefault(); 
      console.log('Login clicked, navigating...');
      this.router.navigate(['/auth']);
  }



}
