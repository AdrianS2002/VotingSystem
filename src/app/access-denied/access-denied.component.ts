import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="access-denied-container">
      <div class="access-denied-card">
        <div class="icon-container">
          <i class="fas fa-lock"></i>
        </div>
        <h1>Access Denied</h1>
        <p>You don't have permission to access this poll.</p>
        <p>This is a private poll and your account is not on the authorized voters list.</p>
        <div class="actions">
          <a routerLink="/polls" class="btn btn-primary">Browse Public Polls</a>
          <a routerLink="/" class="btn btn-outline">Go Home</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .access-denied-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }
    
    .access-denied-card {
      background: white;
      border-radius: 16px;
      padding: 3rem;
      text-align: center;
      max-width: 500px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      animation: fadeIn 0.5s ease-out;
    }
    
    .icon-container {
      margin-bottom: 1.5rem;
    }
    
    .icon-container i {
      font-size: 4rem;
      color: var(--primary-color);
      background: linear-gradient(135deg, var(--primary-color) 0%, #3f51b5 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    
    h1 {
      font-size: 2.5rem;
      color: #1e293b;
      margin-bottom: 1rem;
    }
    
    p {
      font-size: 1.125rem;
      color: #64748b;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }
    
    .actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 2rem;
    }
    
    .btn {
      padding: 0.875rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      text-decoration: none;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, var(--primary-color) 0%, #3f51b5 100%);
      color: white;
    }
    
    .btn-outline {
      border: 2px solid var(--primary-color);
      color: var(--primary-color);
      background: transparent;
    }
    
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(101, 118, 215, 0.2);
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @media (min-width: 640px) {
      .actions {
        flex-direction: row;
        justify-content: center;
      }
    }
  `]
})
export class AccessDeniedComponent {}
