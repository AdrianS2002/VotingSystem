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

  voterEmails = '';
  isLoading = false;

  constructor(private pollService: PollService, private router: Router) {}

  ngOnInit() {
    this.addOption();
    this.addOption();
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    this.poll.expiresAt = expiryDate;
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

    this.poll.options = validOptions;

    if (this.poll.visibility === 'private') {
      if (!this.voterEmails.trim()) {
        alert('Please provide voter emails for private poll');
        return;
      }
      this.poll.allowedVoters = this.voterEmails.split(',').map(email => email.trim());
    }

    this.isLoading = true;
      this.pollService.createPoll(this.poll).subscribe({
    next: () => {
      this.isLoading = false;
      // Add a short delay before navigation to show success message
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
}
