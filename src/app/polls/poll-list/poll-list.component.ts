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
  styleUrl: './poll-list.component.css'
})
export class PollListComponent implements OnInit {
   @ViewChild('resultsSection') resultsSection!: ElementRef;
  allPolls: Poll[] = [];
  polls: Poll[] = [];
  isLoading = true;
  isAdmin = true;
  error: string | null = null;


  constructor(private pollService: PollService, private authService: AuthService, private router: Router) { }


  
  searchTerm = '';
  statusFilter = 'all';
  
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;
  

  ngOnInit() {
    const profile = this.authService.currentUserProfile;
    console.log('Profile:', profile);
    if (!profile || profile.role !== 'admin') {
      this.isAdmin = false;
    }

    console.log('Initializing PollListComponent');
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
  
  applyFilters() {
    let filteredPolls = [...this.allPolls];
    
  if (!this.isAdmin) {
    const now = new Date();
    filteredPolls = filteredPolls.filter(poll => {
      const publishDate = this.getDateObject(poll.publishDate);
      return publishDate <= now;
    });
  }

    if (this.searchTerm?.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filteredPolls = filteredPolls.filter(poll => 
        poll.subject.toLowerCase().includes(term)
      );
    }
    
    if (this.statusFilter === 'active') {
      filteredPolls = filteredPolls.filter(poll => !this.isPollExpired(poll));
    } else if (this.statusFilter === 'expired') {
      filteredPolls = filteredPolls.filter(poll => this.isPollExpired(poll));
    }
    
    this.totalPages = Math.max(1, Math.ceil(filteredPolls.length / this.itemsPerPage));
    
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.polls = filteredPolls.slice(startIndex, startIndex + this.itemsPerPage);
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
  
isPollExpired(poll: Poll): boolean {
  return this.getDateObject(poll.expiresAt) < new Date();
}

isPollPublished(poll: Poll): boolean {
  return this.getDateObject(poll.publishDate) <= new Date();
}

  formatDate(date: any): string {
    if (!date) return '';
    
   
    if (date && typeof date.toDate === 'function') {
      date = date.toDate();
    }
    
    const d = new Date(date);
    return d.toLocaleDateString();
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
}
