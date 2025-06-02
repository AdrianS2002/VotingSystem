import { Component, OnInit } from '@angular/core';
import { Poll } from '../models/poll.model';
import { Router, RouterModule } from '@angular/router';
import { PollService } from '../services/poll.service';
import { AuthService } from '../services/auth.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-my-polls',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, RouterModule],
  templateUrl: './my-polls.component.html',
  styleUrl: './my-polls.component.css'
})
export class MyPollsComponent implements OnInit {
  myPolls: Poll[] = [];
  isLoading = false;
  isLoggedIn = false;
  username = '';
  today = new Date();

  constructor(
    private pollService: PollService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const profile = this.authService.currentUserProfile;
    const userId = profile?.uid;

    this.username = profile?.name || '';
    if (!userId) {
      console.warn('User not authenticated');
      return;
    }

    this.isLoading = true;
    this.pollService.getPolls().subscribe({
      next: (polls: Poll[]) => {
        this.myPolls = polls.filter(p => p.createdBy === userId);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load polls:', err);
        this.isLoading = false;
      }
    });
  }

  onPollClick(pollId?: string) {
    if (pollId) {
      this.router.navigate(['/polls', pollId]);
    }
  }
}