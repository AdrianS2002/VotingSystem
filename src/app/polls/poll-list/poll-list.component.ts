import { Component, OnInit } from '@angular/core';
import { Poll } from '../../models/poll.model';
import { PollService } from '../../services/poll.service';
import { CommonModule } from '@angular/common';
import { ViewChild, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-poll-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './poll-list.component.html',
  styleUrls: ['./poll-list.component.css', './poll-list-extended.component.css']
})
export class PollListComponent implements OnInit {
  @ViewChild('resultsSection') resultsSection!: ElementRef;
  allPolls: Poll[] = [];
  polls: Poll[] = [];
  isLoading = true;
  isAdmin = false;
  isAuthenticated = false;
  error: string | null = null;

  searchTerm = '';
  // Change default to 'active'
  statusFilter = 'active';
  accessFilter = 'all';
  sortFilter = 'newest';
    sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'most-voted', label: 'Most Voted' },
    { value: 'least-voted', label: 'Least Voted' },
    { value: 'start-date', label: 'Start Date' },
    { value: 'end-date', label: 'End Date' }
  ];


  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;
  
  constructor(private pollService: PollService, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    const profile = this.authService.currentUserProfile;
    console.log('Profile:', profile);
    
    // Set authentication status
    this.isAuthenticated = !!profile;
    this.isAdmin = profile?.role === 'admin';

    console.log('Is authenticated:', this.isAuthenticated);
    console.log('Is admin:', this.isAdmin);
    
    this.loadPolls();
  }

  loadPolls() {
    this.isLoading = true;
    this.error = null;

    this.pollService.getPolls().subscribe({
      next: (polls) => {
        console.log('Polls loaded successfully:', polls);
        this.allPolls = polls;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading polls:', err);
        this.error = 'Failed to load polls. Please try again later.';
        this.isLoading = false;
      }
    });
  }
  
  applyFilters() {
    const now = new Date();
    console.log('Current date/time:', now);
    
    // Step 1: Filter by visibility based on user authentication
    let filteredPolls = this.allPolls.filter(poll => {
      // Admin can see all polls
      if (this.isAdmin) {
        return true;
      }
      
      // Public polls are visible to everyone
      if (poll.visibility === 'public') {
        return true;
      }
      
      // Registered polls are only visible to authenticated users
      if (poll.visibility === 'registered' && this.isAuthenticated) {
        return true;
      }
      
      // Private polls are only visible to allowed users
      if (poll.visibility === 'private' && this.isAuthenticated) {
        const userEmail = this.authService.currentUserProfile?.email?.toLowerCase();
        return poll.allowedVoters?.some(email => 
          email.toLowerCase() === userEmail
        );
      }
      
      // Default: not visible
      return false;
    });
    
    console.log('After visibility filtering:', filteredPolls.length);
    
  // Step 2: Filter by access type
  if (this.accessFilter !== 'all') {
    filteredPolls = filteredPolls.filter(poll => poll.visibility === this.accessFilter);
    console.log(`After ${this.accessFilter} access filtering:`, filteredPolls.length);
  }
  
  // Step 3: Filter by status (existing code)
  switch (this.statusFilter) {
    case 'active':
      filteredPolls = filteredPolls.filter(poll => 
        this.isPollPublished(poll) && !this.isPollExpired(poll)
      );
      break;
    case 'future':
      filteredPolls = filteredPolls.filter(poll => 
        !this.isPollPublished(poll)
      );
      break;
    case 'past':
      filteredPolls = filteredPolls.filter(poll => 
        this.isPollExpired(poll)
      );
      break;
    case 'all':
      // No additional filtering needed
      break;
  }
    
    console.log(`After ${this.statusFilter} status filtering:`, filteredPolls.length);
    
    if (this.searchTerm?.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filteredPolls = filteredPolls.filter(poll => 
        poll.subject.toLowerCase().includes(term)
      );
      console.log('After search filtering:', filteredPolls.length);
    }
    
      this.sortPolls(filteredPolls);

    // Update pagination
    this.totalPages = Math.max(1, Math.ceil(filteredPolls.length / this.itemsPerPage));
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.polls = filteredPolls.slice(startIndex, startIndex + this.itemsPerPage);
  }

  isPollExpired(poll: Poll): boolean {
    const now = new Date();
    const expiryDate = this.getDateObject(poll.expiresAt);
    return expiryDate < now;
  }

  isPollPublished(poll: Poll): boolean {
    const now = new Date();
    const publishDate = this.getDateObject(poll.publishDate);
    return publishDate <= now;
  }

  isPollActive(poll: Poll): boolean {
    return this.isPollPublished(poll) && !this.isPollExpired(poll);
  }

  private getDateObject(date: any): Date {
    if (date instanceof Date) return date;

    if (date && typeof date.toDate === 'function') {
      return date.toDate();
    }

    return new Date(date);
  }
  
  onSearch() {
    this.currentPage = 1;
    this.applyFilters();

    setTimeout(() => {
      if (this.resultsSection) {
        const offset = 100; 
        const elementPosition = this.resultsSection.nativeElement.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  }
  
  onStatusFilterChange() {
    this.currentPage = 1; 
    this.applyFilters();
  }

  onAccessFilterChange() {
  this.currentPage = 1;
  this.applyFilters();
}

onSortFilterChange() {
  this.applyFilters();
}

  formatDate(date: any): string {
    if (!date) return '';
    
    if (date && typeof date.toDate === 'function') {
      date = date.toDate();
    }
    
    const d = new Date(date);
    return d.toLocaleDateString();
  }
  
  formatTime(date: any): string {
    if (!date) return '';
    
    if (date && typeof date.toDate === 'function') {
      date = date.toDate();
    }
    
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  get pageNumbers(): number[] {
    const pages: number[] = [];
    
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }
  
  setPage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.applyFilters();
  }
  
  nextPage() {
    this.setPage(this.currentPage + 1);
  }
  
  prevPage() {
    this.setPage(this.currentPage - 1);
  }

private sortPolls(polls: Poll[]): void {
  switch (this.sortFilter) {
    case 'newest':
      polls.sort((a, b) => {
        // Sort by created date, newest first
        return this.getDateObject(b.createdAt).getTime() - this.getDateObject(a.createdAt).getTime();
      });
      break;
      
    case 'oldest':
      polls.sort((a, b) => {
        // Sort by created date, oldest first
        return this.getDateObject(a.createdAt).getTime() - this.getDateObject(b.createdAt).getTime();
      });
      break;
      
    case 'most-voted':
      polls.sort((a, b) => {
        // Sort by total votes, highest first
        return (b.totalVotes || 0) - (a.totalVotes || 0);
      });
      break;
      
    case 'least-voted':
      polls.sort((a, b) => {
        // Sort by total votes, lowest first
        return (a.totalVotes || 0) - (b.totalVotes || 0);
      });
      break;
      
    case 'start-date':
      polls.sort((a, b) => {
        // Sort by start date (publishDate), soonest first
        return this.getDateObject(a.publishDate).getTime() - this.getDateObject(b.publishDate).getTime();
      });
      break;
      
    case 'end-date':
      polls.sort((a, b) => {
        // Sort by end date (expiresAt), soonest first
        return this.getDateObject(a.expiresAt).getTime() - this.getDateObject(b.expiresAt).getTime();
      });
      break;
  }
}

}