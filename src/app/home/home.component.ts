import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


interface Poll {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'ended';
  totalVotes: number;
  options: PollOption[];
}

interface PollOption {
  id: number;
  text: string;
  votes: number;
  percentage?: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class HomeComponent implements OnInit {
  username: string = 'Guest';
  isLoggedIn: boolean = false;
  featuredPolls: Poll[] = [];
  recentPolls: Poll[] = [];
  popularPolls: Poll[] = [];
  
  constructor() { }

  ngOnInit(): void {
    // Simulate getting user data from a service
    this.checkLoginStatus();
    
    // Load sample polls data
    this.loadSamplePolls();
  }

  checkLoginStatus(): void {
    // This would typically come from an auth service
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.isLoggedIn = true;
      this.username = localStorage.getItem('username') || 'User';
    }
  }

  loadSamplePolls(): void {
    // Sample data - in a real app, this would come from an API
    this.featuredPolls = [
      {
        id: 1,
        title: 'City Park Renovation Plan',
        description: 'Vote on the proposed designs for the central city park renovation project.',
        startDate: '2025-05-01',
        endDate: '2025-05-30',
        status: 'active',
        totalVotes: 324,
        options: [
          { id: 1, text: 'Design A: Eco-friendly with solar panels', votes: 145, percentage: 45 },
          { id: 2, text: 'Design B: Traditional with more green space', votes: 98, percentage: 30 },
          { id: 3, text: 'Design C: Modern with water features', votes: 81, percentage: 25 }
        ]
      },
      {
        id: 2,
        title: 'Community Budget Allocation',
        description: 'Help decide how to allocate the community development fund for next year.',
        startDate: '2025-05-05',
        endDate: '2025-06-05',
        status: 'active',
        totalVotes: 512,
        options: [
          { id: 1, text: 'Road infrastructure improvements', votes: 215, percentage: 42 },
          { id: 2, text: 'Public school programs', votes: 187, percentage: 37 },
          { id: 3, text: 'Public health initiatives', votes: 110, percentage: 21 }
        ]
      }
    ];
    
    this.recentPolls = [
      {
        id: 3,
        title: 'Neighborhood Watch Program',
        description: 'Vote on establishing a neighborhood watch program in your area.',
        startDate: '2025-05-10',
        endDate: '2025-05-25',
        status: 'active',
        totalVotes: 158,
        options: [
          { id: 1, text: 'Yes, establish the program', votes: 95, percentage: 60 },
          { id: 2, text: 'No, focus on other security measures', votes: 63, percentage: 40 }
        ]
      },
      {
        id: 4,
        title: 'Local Festival Theme',
        description: 'Choose the theme for this year\'s summer festival.',
        startDate: '2025-05-08',
        endDate: '2025-05-18',
        status: 'active',
        totalVotes: 276,
        options: [
          { id: 1, text: 'Cultural Heritage Celebration', votes: 98, percentage: 35 },
          { id: 2, text: 'Sustainability and Environment', votes: 85, percentage: 31 },
          { id: 3, text: 'Arts and Music Showcase', votes: 93, percentage: 34 }
        ]
      }
    ];
    
    this.popularPolls = [
      {
        id: 5,
        title: 'New Public Library Location',
        description: 'Help choose the location for our new public library.',
        startDate: '2025-04-15',
        endDate: '2025-05-20',
        status: 'active',
        totalVotes: 879,
        options: [
          { id: 1, text: 'Downtown near the plaza', votes: 432, percentage: 49 },
          { id: 2, text: 'Near the community college', votes: 289, percentage: 33 },
          { id: 3, text: 'In the eastern suburb area', votes: 158, percentage: 18 }
        ]
      },
      {
        id: 6,
        title: 'School Calendar Reform',
        description: 'Vote on the proposed changes to the school calendar.',
        startDate: '2025-04-20',
        endDate: '2025-05-25',
        status: 'active',
        totalVotes: 756,
        options: [
          { id: 1, text: 'Keep the current calendar', votes: 312, percentage: 41 },
          { id: 2, text: 'Year-round schedule with shorter breaks', votes: 289, percentage: 38 },
          { id: 3, text: 'Extended summer break with longer school days', votes: 155, percentage: 21 }
        ]
      }
    ];
  }

  calculatePercentage(votes: number, totalVotes: number): number {
    return Math.round((votes / totalVotes) * 100);
  }
  
  vote(pollId: number, optionId: number): void {
    // This would normally send a request to the backend
    alert(`Vote recorded for Option ${optionId} in Poll ${pollId}`);
    // In a real app, you'd then refresh the polls or update the specific poll
  }
}