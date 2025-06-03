import { Component, OnInit } from '@angular/core';
import { Poll, PollOption } from '../../models/poll.model';
import { PollService } from '../../services/poll.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-poll-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './poll-create.component.html',
  styleUrl: './poll-create.component.css'
})
export class PollCreateComponent implements OnInit {
  poll: Poll = {
    subject: '',
    options: [],
    visibility: 'public',
    resultsVisibility: 'live',
    publishDate: new Date(),
    expiresAt: new Date(),
    totalVotes: 0,
    createdBy: '',
  };
  dateValidation?: {valid: boolean, message?: string};
  voterEmails = '';
  isLoading = false;

  constructor(private pollService: PollService, private router: Router) {}

  ngOnInit() {
    this.addOption();
    this.addOption();
    
    // Set default dates with proper formatting for input fields
    const now = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    
    // Format dates for datetime-local input
    this.poll.publishDate = this.formatDateForInput(now);
    this.poll.expiresAt = this.formatDateForInput(expiryDate);
    
    // Run initial validation
    this.dateValidation = this.validateDates();
  }

   generateId(): string {

    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    
    // Fallback
    return 'id-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  addOption() {
    this.poll.options.push({ id: this.generateId(), text: '' });
  }

  removeOption(index: number) {
    if (this.poll.options.length > 2) {
      this.poll.options.splice(index, 1);
    }
  }

  createPoll() {
    if (!this.poll.subject.trim()) {
      alert('Please provide a poll subject');
      return;
    }

    const validOptions = this.poll.options.filter(option => option.text.trim().length > 0);
    if (validOptions.length < 2) {
      alert('Please provide at least 2 valid options');
      return;
    }

    const dateValidation = this.validateDates();
    if (!dateValidation.valid) {
      alert(dateValidation.message);
      return;
    }

    const pollToSubmit = {
      ...this.poll,
      options: validOptions,
      publishDate: new Date(this.poll.publishDate),
      expiresAt: new Date(this.poll.expiresAt)
    };

    if (this.poll.visibility === 'private') {
      if (!this.voterEmails.trim()) {
        alert('Please provide voter emails for private poll');
        return;
      }
      pollToSubmit.allowedVoters = this.voterEmails.split(',').map(email => email.trim());
    }

    this.isLoading = true;
    this.pollService.createPoll(pollToSubmit).subscribe({
      next: () => {
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      },
      error: (error) => {
        console.error('Error creating poll:', error);
        alert('Failed to create poll. Please try again.');
        this.isLoading = false;
      }
    });
  }


validateDates(): {valid: boolean, message?: string} {
  let startDate: Date;
  let endDate: Date;

  if (typeof this.poll.publishDate === 'string') {
    startDate = new Date(this.poll.publishDate);
  } else {
    startDate = this.poll.publishDate;
  }

  if (typeof this.poll.expiresAt === 'string') {
    endDate = new Date(this.poll.expiresAt);
  } else {
    endDate = this.poll.expiresAt;
  }

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return {
      valid: false,
      message: 'Datele introduse nu sunt valide.'
    };
  }
  
  if (endDate <= startDate) {
    return {
      valid: false,
      message: 'Data de expirare trebuie să fie după data de publicare.'
    };
  }

  const diffMs = endDate.getTime() - startDate.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  
  if (diffMinutes < 1) {
    return {
      valid: false,
      message: 'Trebuie să existe cel puțin un minut între data de publicare și data de expirare.'
    };
  }
  
  return { valid: true };
}

formatDateForInput(date: Date): any {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
}
