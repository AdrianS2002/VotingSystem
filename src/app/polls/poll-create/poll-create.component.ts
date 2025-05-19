import { Component, OnInit } from '@angular/core';
import { Poll, PollOption } from '../poll.model';
import { PollService } from '../poll.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';

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
    
    // Set expiration date to 7 days from now by default
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);
    this.poll.expiresAt = expiryDate;
  }

  addOption() {
    this.poll.options.push({ id: uuidv4(), text: '' });
  }

  removeOption(index: number) {
    // Prevent removing if there are only 2 options left
    if (this.poll.options.length > 2) {
      this.poll.options.splice(index, 1);
    }
  }

  createPoll() {
    // Validate required fields
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
    this.pollService.createPoll(this.poll)
      .then(() => {
        this.router.navigate(['/polls']);
      })
      .catch((error: unknown) => {
        console.error('Error creating poll:', error);
        alert('Failed to create poll. Please try again.');
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
}
