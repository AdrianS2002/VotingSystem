import { Component, OnInit } from '@angular/core';
import { Poll } from '../../models/poll.model';
import { PollService } from '../../services/poll.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-poll-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './poll-list.component.html',
  styleUrl: './poll-list.component.css'
})
export class PollListComponent implements OnInit {
  allPolls: Poll[] = [];
  polls: Poll[] = [];
  isLoading = true;
  error: string | null = null;
  
  searchTerm = '';
  statusFilter = 'all';
  
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 1;
  
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
  

  onSearch() {
    this.currentPage = 1; 
    this.applyFilters();
  }
  
  onStatusFilterChange() {
    this.currentPage = 1; 
    this.applyFilters();
  }
  
  isPollExpired(poll: Poll): boolean {
    return new Date(poll.expiresAt) < new Date();
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
