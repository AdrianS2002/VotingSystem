import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Firestore, doc, getDoc, collection, getDocs } from '@angular/fire/firestore';
import { Poll, PollOption } from '../../models/poll.model';

interface ResultOption extends PollOption {
  votes: number;
  percentage: number;
}

interface PollResult extends Poll {
  resultOptions: ResultOption[];
}

@Component({
  selector: 'app-poll-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './poll-results.component.html',
  styleUrl: './poll-results.component.css'
})
export class PollResultsComponent implements OnInit {
  pollId: string = '';
  poll?: PollResult;
  isLoading: boolean = true;
  error: string | null = null;
  totalVotes: number = 0;
  
  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore
  ) {}

  async ngOnInit() {
    this.isLoading = true;
    
    try {
      this.pollId = this.route.snapshot.paramMap.get('id') || '';
      if (!this.pollId) {
        throw new Error('Poll ID is required');
      }

      const pollDoc = await getDoc(doc(this.firestore, `polls/${this.pollId}`));
      if (!pollDoc.exists()) {
        throw new Error('Poll not found');
      }

      const pollData = { id: pollDoc.id, ...pollDoc.data() } as Poll;
      
      const votesSnapshot = await getDocs(collection(this.firestore, `polls/${this.pollId}/votes`));
      const voteCounts: Record<string, number> = {};
      
      pollData.options.forEach(option => {
        voteCounts[option.id] = 0;
      });
      
      votesSnapshot.forEach(voteDoc => {
        const voteData = voteDoc.data();
        const optionId = voteData['optionId'] || '';
        if (optionId && voteCounts.hasOwnProperty(optionId)) {
          voteCounts[optionId] = (voteCounts[optionId] || 0) + 1;
        }
      });
      
      this.totalVotes = votesSnapshot.size;
      
      const resultOptions = pollData.options.map(option => {
        const votes = voteCounts[option.id] || 0;
        const percentage = this.totalVotes > 0 ? Math.round((votes / this.totalVotes) * 100) : 0;
        
        return {
          ...option,
          votes,
          percentage
        };
      });
      
      resultOptions.sort((a, b) => b.votes - a.votes);
      
      this.poll = {
        ...pollData,
        resultOptions
      };
      
    } catch (error) {
      console.error('Error loading poll results:', error);
      this.error = 'Failed to load poll results.';
    } finally {
      this.isLoading = false;
    }
  }
  
  isPollActive(): boolean {
    if (!this.poll) return false;
    
    const expiryDate = this.getDateObject(this.poll.expiresAt);
    return expiryDate > new Date();
  }

  formatDate(date: any): string {
    const dateObj = this.getDateObject(date);
    return dateObj.toLocaleString();
  }

  private getDateObject(date: any): Date {
    if (date instanceof Date) return date;

    if (date && typeof date.toDate === 'function') {
      return date.toDate();
    }
    
    return new Date(date);
  }
  
  getColorForIndex(index: number): string {
    const colors = [
      '#4285F4', // Google Blue
      '#34A853', // Google Green
      '#FBBC05', // Google Yellow
      '#EA4335', // Google Red
      '#8958FF', // Purple
      '#00C9A7', // Teal
      '#FF8A65', // Orange
      '#4FC3F7', // Light Blue
      '#AED581', // Light Green
      '#FFD54F'  // Light Yellow
    ];
    
    return colors[index % colors.length];
  }
}
