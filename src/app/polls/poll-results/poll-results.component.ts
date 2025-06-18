import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  Firestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where
} from '@angular/fire/firestore';
import { Poll, PollOption } from '../../models/poll.model';
import { ChartData, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

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
  imports: [CommonModule, RouterModule, NgChartsModule],
  templateUrl: './poll-results.component.html',
  styleUrl: './poll-results.component.css',
})
export class PollResultsComponent implements OnInit {
  pollId: string = '';
  poll?: PollResult;
  isLoading: boolean = true;
  error: string | null = null;
  totalVotes: number = 0;

  votedChartData: ChartData<'pie'> = {
    labels: ['Voted', 'Not Voted'],
    datasets: [{ data: [0, 0], backgroundColor: ['#28a745', '#dc3545'] }]
  };

  votedChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore
  ) { }

  async ngOnInit() {
    this.isLoading = true;

    try {
      this.pollId = this.route.snapshot.paramMap.get('id') || '';
      if (!this.pollId) throw new Error('Poll ID is required');

      const pollDoc = await getDoc(doc(this.firestore, `polls/${this.pollId}`));
      if (!pollDoc.exists()) throw new Error('Poll not found');

      const pollData = { id: pollDoc.id, ...pollDoc.data() } as Poll;

      const voteQuery = query(
        collection(this.firestore, 'votes'),
        where('pollId', '==', this.pollId)
      );
      const voteSnapshot = await getDocs(voteQuery);

      const voteCounts: Record<string, number> = {};
      pollData.options.forEach(opt => voteCounts[opt.id] = 0);

      voteSnapshot.forEach(doc => {
        const vote = doc.data();
        const optionId = vote['optionId'];
        if (optionId in voteCounts) {
          voteCounts[optionId]++;
        }
      });

      this.totalVotes = voteSnapshot.size;

      const resultOptions = pollData.options.map(opt => {
        const votes = voteCounts[opt.id] || 0;
        const percentage = this.totalVotes > 0 ? Math.round((votes / this.totalVotes) * 100) : 0;
        return {
          ...opt,
          votes,
          percentage
        };
      });

      resultOptions.sort((a, b) => b.votes - a.votes);

      this.poll = {
        ...pollData,
        resultOptions
      };

      let totalEligible = 0;
      if (pollData.visibility === 'private') {
        totalEligible = pollData.allowedVoters?.length || 0;
      } else {
        const usersSnapshot = await getDocs(collection(this.firestore, 'users'));
        totalEligible = usersSnapshot.size;
      }

      const voted = voteSnapshot.size;
      const notVoted = Math.max(0, totalEligible - voted);

      this.votedChartData = {
        labels: ['Voted', 'Not Voted'],
        datasets: [{
          data: [voted, notVoted],
          backgroundColor: ['#28a745', '#dc3545']
        }]
      };

    } catch (error) {
      console.error('Error loading poll results:', error);
      this.error = 'Failed to load poll results.';
    } finally {
      this.isLoading = false;
    }
  }

  getDateObject(date: any): Date {
    if (date instanceof Date) return date;
    if (date && typeof date.toDate === 'function') {
      return date.toDate();
    }
    return new Date(date);
  }

  isPollActive(): boolean {
    if (!this.poll) return false;
    const expiryDate = this.getDateObject(this.poll.expiresAt);
    return expiryDate > new Date();
  }

  formatDate(date: any): string {
    return this.getDateObject(date).toLocaleString();
  }

  shouldShowResults(): boolean {
    if (!this.poll) return false;

    const now = new Date();
    const expires = this.getDateObject(this.poll.expiresAt);
    const totalAssigned = this.poll.allowedVoters?.length || 0;

    switch (this.poll.resultsVisibility) {
      case 'live':
        return true;
      case 'after100Votes':
        return this.totalVotes >= 100;
      case 'afterExpiration':
        return now >= expires;
      case 'afterAllVoted':
        return this.poll.visibility === 'private'
          ? this.totalVotes >= totalAssigned
          : now >= expires;
      default:
        return false;
    }
  }

  getColorForIndex(index: number): string {
    const colors = [
      '#4285F4', '#34A853', '#FBBC05', '#EA4335',
      '#8958FF', '#00C9A7', '#FF8A65', '#4FC3F7',
      '#AED581', '#FFD54F'
    ];
    return colors[index % colors.length];
  }
}
