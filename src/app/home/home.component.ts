import { Component, OnInit } from '@angular/core';
import { Poll } from '../models/poll.model';
import { PollService } from '../services/poll.service';
import { AuthService } from '../services/auth.service';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule]
})
export class HomeComponent implements OnInit {
  isLoggedIn = false;
  username = '';
  hasRole = '';
  today = new Date();
  featuredPolls: Poll[] = [];
  recentPolls: Poll[] = [];
  popularPolls: Poll[] = [];
  visiblePolls: (Poll & { hasVoted: boolean })[] = [];

  totalVotes: number = 0;
  activePollsCount: number = 0;
  registeredUsers: number = 0;
  totalPolls: number = 0;


  constructor(
    private pollService: PollService,
    private authService: AuthService,
    private router: Router

  ) { }

  ngOnInit(): void {
    const profile = this.authService.currentUserProfile;
    this.isLoggedIn = !!profile;
    this.username = profile?.name || '';
    this.hasRole = profile?.role || '';
    console.log('User Profile:', profile);
    const allPolls = [...this.featuredPolls, ...this.recentPolls, ...this.popularPolls];

    // Remove duplicates (by id)
    const uniquePollsMap = new Map<string, any>();
    allPolls.forEach(poll => uniquePollsMap.set(poll.id!, poll));
    const uniquePolls = Array.from(uniquePollsMap.values());

    this.totalPolls = uniquePolls.length;
    this.totalVotes = uniquePolls.reduce((sum, poll) => sum + (poll.totalVotes || 0), 0);


    this.loadPolls();



  }

  onVoteClick(pollId?: string) {
    if (!pollId) {
      console.error('Poll ID is undefined');
      return;
    }

    // if (this.isLoggedIn) {
    this.router.navigate(['/polls', pollId]);
    // } else {
    //   this.router.navigate(['/auth']);
    // }
  }


  loadPolls(): void {
    this.pollService.getPolls().subscribe({
      next: (polls: Poll[]) => {
        const now = new Date();

        const convertedPolls = polls.map(p => ({
          ...p,
          expiresAt: (p.expiresAt as any).toDate ? (p.expiresAt as any).toDate() : new Date(p.expiresAt),
          publishDate: (p.publishDate as any).toDate ? (p.publishDate as any).toDate() : new Date(p.publishDate)
        }));

        const sortedByVotes = [...convertedPolls].sort((a, b) => b.totalVotes - a.totalVotes);
        const sortedByDate = [...convertedPolls].sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());

        this.featuredPolls = sortedByVotes.slice(0, 3);
        this.recentPolls = sortedByDate.slice(0, 3);
        this.popularPolls = sortedByVotes.slice(3, 6);

        this.visiblePolls = convertedPolls
          .filter(p => p.visibility === 'public')
          .map(poll => {
            const totalVotes = poll.options.reduce((sum, opt) => sum + (opt.votes || 0), 0);

            const topOptions = [...poll.options]
              .sort((a, b) => (b.votes || 0) - (a.votes || 0))
              .slice(0, 3)
              .map(option => ({
                ...option,
                percentage: totalVotes > 0
                  ? Math.round((option.votes || 0) * 100 / totalVotes)
                  : 0
              }));

            return {
              ...poll,
              options: topOptions,
              isExpired: poll.expiresAt < now,
              hasVoted: false
            };
          });

        this.totalVotes = convertedPolls.reduce((acc, p) => acc + p.totalVotes, 0);
        this.activePollsCount = convertedPolls.filter(p => p.expiresAt > now).length;
      },
      error: (err) => {
        console.error('Error loading polls:', err);
      }
    });
  }


}
