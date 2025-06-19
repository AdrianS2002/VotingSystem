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
  styleUrls: ['./home.component.css', './home-extended.component.css'],
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
    this.router.navigate(['/polls', pollId]);
  }


  loadPolls(): void {
    this.pollService.getPolls().subscribe({
      next: (polls: Poll[]) => {
        const now = new Date();

        const convertedPolls = polls.map(p => ({
          ...p,
          expiresAt: (p.expiresAt as any).toDate ? (p.expiresAt as any).toDate() : new Date(p.expiresAt),
          publishDate: (p.publishDate as any).toDate ? (p.publishDate as any).toDate() : new Date(p.publishDate),
          createdAt: (() => {
            const raw = (p as any).createdAt;
            if (raw?.toDate) return raw.toDate();
            if (typeof raw === 'string' || typeof raw === 'number') return new Date(raw);
            return null;
          })()
        }));

        const sortedByVotes = [...convertedPolls].sort((a, b) => b.totalVotes - a.totalVotes);



        this.featuredPolls = sortedByVotes.slice(0, 3);
        if (!this.isLoggedIn) {
          const publicPolls = convertedPolls.filter(p => p.visibility === 'public');

          this.recentPolls = publicPolls
            .filter(p => p.createdAt instanceof Date && !isNaN(p.createdAt.getTime()))
            .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
            .slice(0, 3);

          if (this.recentPolls.length < 3) {
            const fallback = publicPolls
              .filter(p => !(p.createdAt instanceof Date) || isNaN(p.createdAt?.getTime()))
              .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime())
              .slice(0, 3 - this.recentPolls.length);

            this.recentPolls = [...this.recentPolls, ...fallback];
          }

          this.popularPolls = [...publicPolls]
            .sort((a, b) => b.totalVotes - a.totalVotes)
            .slice(0, 3);

        }

        console.log('Converted Polls:', convertedPolls.map(p => ({
          subject: p.subject,
          createdAt: p.createdAt,
          createdAtValid: p.createdAt instanceof Date && !isNaN(p.createdAt.getTime())
        })));


        console.log('Recent polls:', this.recentPolls.map(p => ({
          subject: p.subject,
          createdAt: p.createdAt
        })));
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
