import { Component, OnInit } from '@angular/core';
import { Poll } from '../models/poll.model';
import { Router, RouterModule } from '@angular/router';
import { PollService } from '../services/poll.service';
import { AuthService } from '../services/auth.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-polls',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, RouterModule, FormsModule],
  templateUrl: './my-polls.component.html',
  styleUrls: ['./my-polls.component.css', './my-polls-extended.component.scss']
})
export class MyPollsComponent implements OnInit {
  myPolls: Poll[] = [];
  filteredPolls: Poll[] = [];
  isLoading = false;
  isLoggedIn = false;
  username = '';
  userEmail = '';
  profilePicture = '';
  today = new Date();
  
  // Filters
  statusFilter = 'all';
  sortFilter = 'newest';

  // Stats
  totalPolls = 0;
  totalVotes = 0;
  activePolls = 0;
  expiredPolls = 0;
  upcomingPolls = 0;
  avgVotesPerPoll = 0;
  mostVotedPoll?: Poll;
  recentPoll?: Poll;

  constructor(
    private pollService: PollService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const profile = this.authService.currentUserProfile;
    const userId = profile?.uid;

    if (profile) {
      this.username = profile.name || '';
      this.userEmail = profile.email || '';
      this.isLoggedIn = true;
    }
    
    if (!userId) {
      console.warn('User not authenticated');
      this.router.navigate(['/login'], { 
        queryParams: { redirectTo: '/my-polls' } 
      });
      return;
    }

    this.isLoading = true;
    this.pollService.getPolls().subscribe({
      next: (polls: Poll[]) => {
        this.myPolls = polls.filter(p => p.createdBy === userId);
        this.calculateStats();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load polls:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filteredList = [...this.myPolls];
    
    // Apply status filter
    switch(this.statusFilter) {
      case 'active':
        filteredList = filteredList.filter(poll => this.isPollActive(poll));
        break;
      case 'upcoming':
        filteredList = filteredList.filter(poll => !this.isPollPublished(poll));
        break;
      case 'expired':
        filteredList = filteredList.filter(poll => this.isPollExpired(poll));
        break;
      case 'all':
      default:
        break;
    }
    
    // Apply sort filter
    switch(this.sortFilter) {
      case 'newest':
        filteredList.sort((a, b) => {
          const dateA = this.getDateObject(a.createdAt || a.publishDate);
          const dateB = this.getDateObject(b.createdAt || b.publishDate);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case 'oldest':
        filteredList.sort((a, b) => {
          const dateA = this.getDateObject(a.createdAt || a.publishDate);
          const dateB = this.getDateObject(b.createdAt || b.publishDate);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'most-votes':
        filteredList.sort((a, b) => 
          (b.totalVotes || 0) - (a.totalVotes || 0)
        );
        break;
      case 'least-votes':
        filteredList.sort((a, b) => 
          (a.totalVotes || 0) - (b.totalVotes || 0)
        );
        break;
      case 'ending-soon':
        const now = new Date();
        filteredList = filteredList
          .filter(poll => !this.isPollExpired(poll) && this.isPollPublished(poll))
          .sort((a, b) => {
            const dateA = this.getDateObject(a.expiresAt);
            const dateB = this.getDateObject(b.expiresAt);
            return dateA.getTime() - dateB.getTime();
          });
        break;
    }
    
    this.filteredPolls = filteredList;
  }

  calculateStats(): void {
    const now = new Date();
    
    // Basic statistics
    this.totalPolls = this.myPolls.length;
    this.totalVotes = this.myPolls.reduce((sum, poll) => sum + (poll.totalVotes || 0), 0);
    
    // Count by status
    this.activePolls = this.myPolls.filter(poll => this.isPollActive(poll)).length;
    this.expiredPolls = this.myPolls.filter(poll => this.isPollExpired(poll)).length;
    this.upcomingPolls = this.myPolls.filter(poll => !this.isPollPublished(poll)).length;
    
    // Average votes
    this.avgVotesPerPoll = this.totalPolls ? Math.round(this.totalVotes / this.totalPolls) : 0;
    
    // Most voted poll
    this.mostVotedPoll = this.myPolls.reduce((max, poll) => 
      (!max || (poll.totalVotes || 0) > (max.totalVotes || 0)) ? poll : max, 
      undefined as Poll | undefined
    );
    
    // Most recent poll
    this.recentPoll = [...this.myPolls].sort((a, b) => {
      const dateA = this.getDateObject(a.createdAt || a.publishDate);
      const dateB = this.getDateObject(b.createdAt || b.publishDate);
      return dateB.getTime() - dateA.getTime();
    })[0];
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onSortFilterChange(): void {
    this.applyFilters();
  }

  isPollExpired(poll: Poll): boolean {
    const now = new Date();
    const expiryDate = this.getDateObject(poll.expiresAt);
    return now > expiryDate;
  }

  isPollPublished(poll: Poll): boolean {
    const now = new Date();
    const publishDate = this.getDateObject(poll.publishDate);
    return now >= publishDate;
  }

  isPollActive(poll: Poll): boolean {
    return this.isPollPublished(poll) && !this.isPollExpired(poll);
  }

  getDateObject(date: any): Date {
    if (date instanceof Date) return date;

    if (date && typeof date.toDate === 'function') {
      return date.toDate();
    }

    return new Date(date);
  }

  formatDate(date: any): string {
    if (!date) return '';
    
    const d = this.getDateObject(date);
    return d.toLocaleDateString();
  }
  
  formatTime(date: any): string {
    if (!date) return '';
    
    const d = this.getDateObject(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getTimeRemaining(poll: Poll): string {
    if (this.isPollExpired(poll)) {
      return 'Expired';
    }
    
    if (!this.isPollPublished(poll)) {
      return 'Not started';
    }
    
    const now = new Date();
    const expiryDate = this.getDateObject(poll.expiresAt);
    const diff = expiryDate.getTime() - now.getTime();
    
    // Convert to days, hours, minutes
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h left`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes} min left`;
    }
  }


  getStatusClass(poll: Poll): string {
    if (!this.isPollPublished(poll)) {
      return 'upcoming';
    } else if (this.isPollExpired(poll)) {
      return 'expired';
    } else {
      return 'active';
    }
  }
  
  getPollsCountByVisibility(visibility: string): number {
    return this.myPolls.filter(poll => poll.visibility === visibility).length;
  }

  onDeletePoll(pollId: string): void {
  if (confirm('Are you sure you want to delete this poll?')) {
    this.pollService.deletePoll(pollId).subscribe({
      next: () => {
        this.myPolls = this.myPolls.filter(p => p.id !== pollId);
        console.log('Poll deleted successfully.');
      },
      error: err => {
        console.error('Failed to delete poll:', err);
      }
    });
  }
}


}