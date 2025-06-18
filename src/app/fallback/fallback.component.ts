import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

export interface ErrorInfo {
  message?: string;
  code?: string | number;
  timestamp?: Date;
  sessionId?: string;
  stack?: string;
}

@Component({
  selector: 'app-error-fallback',
  templateUrl: './fallback.component.html',
  styleUrls: ['./fallback.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ErrorFallbackComponent {
  @Input() errorInfo: ErrorInfo = {};
  @Input() showRetry: boolean = true;
  @Input() showHome: boolean = true;
  @Input() showSupport: boolean = true;
  @Input() customTitle?: string;
  @Input() customMessage?: string;
  
  @Output() retry = new EventEmitter<void>();
  @Output() contactSupport = new EventEmitter<void>();

  showErrorDetails: boolean = false;
  isRetrying: boolean = false;
  
  constructor(private router: Router) {
    // Initialize default error info
    if (!this.errorInfo.timestamp) {
      this.errorInfo.timestamp = new Date();
    }
    if (!this.errorInfo.sessionId) {
      this.errorInfo.sessionId = this.generateSessionId();
    }
  }

  get displayTitle(): string {
    return this.customTitle || 'Oops!';
  }

  get displayMessage(): string {
    return this.customMessage || 
      "We're sorry, but something unexpected happened. This could be due to a temporary issue with our servers or a problem with your connection. Don't worry, our team has been notified and is working to fix this.";
  }

  get userAgent(): string {
    return navigator.userAgent;
  }

  onRetry(): void {
    this.isRetrying = true;
    
    
    this.retry.emit();
    
    
    setTimeout(() => {
      this.isRetrying = false;
    }, 2000);
  }

  onGoHome(): void {
    this.router.navigate(['/']);
  }

  

  toggleErrorDetails(): void {
    this.showErrorDetails = !this.showErrorDetails;
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Method to copy error details to clipboard
  copyErrorDetails(): void {
    const errorText = `
Error Information:
Timestamp: ${this.errorInfo.timestamp?.toLocaleString()}
Error Code: ${this.errorInfo.code || 'Unknown'}
Session ID: ${this.errorInfo.sessionId}
Message: ${this.errorInfo.message || 'No message available'}
User Agent: ${this.userAgent}
    `.trim();

    navigator.clipboard.writeText(errorText).then(() => {
      // Could add a toast notification here
      console.log('Error details copied to clipboard');
    });
  }
}