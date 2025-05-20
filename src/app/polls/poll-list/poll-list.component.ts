import { Component, OnInit } from '@angular/core';
import { Poll } from '../../models/poll.model';
import { PollService } from '../../services/poll.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-poll-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './poll-list.component.html',
  styleUrl: './poll-list.component.css'
})
export class PollListComponent implements OnInit {
  polls: Poll[] = [];
  isLoading = true;
  error: string | null = null;
  
  constructor(private pollService: PollService) {}
  
  ngOnInit() {
    console.log('Initializing PollListComponent');
    this.loadPolls();
  }
  
  loadPolls() {
    this.isLoading = true;
    this.error = null;
    
    this.pollService.getPolls().subscribe({
      next: (polls) => {
        console.log('Polls loaded successfully:', polls);
        this.polls = polls;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading polls:', err);
        this.error = 'Failed to load polls. Please try again later.';
        this.isLoading = false;
      }
    });
  }
}
