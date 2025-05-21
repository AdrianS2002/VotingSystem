import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Firestore, doc, getDoc, setDoc, collection, getDocs } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Poll } from '../../models/poll.model';

@Component({
  selector: 'app-poll-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './poll-details.component.html',
  styleUrl: './poll-details.component.css'
})
export class PollDetailsComponent implements OnInit {
  pollId: string = '';
  poll?: Poll;
  selectedOption: string = '';
  hasVoted: boolean = false;
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore,
    private auth: Auth
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

      this.poll = { id: pollDoc.id, ...pollDoc.data() } as Poll;
      
      const userId = await this.getVoterId();
      const voteDoc = await getDoc(doc(this.firestore, `polls/${this.pollId}/votes/${userId}`));
      this.hasVoted = voteDoc.exists();
      
      if (this.hasVoted) {
        this.selectedOption = voteDoc.data()?.['optionId'];
      }
      
    } catch (error) {
      console.error('Error loading poll:', error);
      this.error = 'Failed to load poll details.';
    } finally {
      this.isLoading = false;
    }
  }

  async submitVote() {
    if (!this.selectedOption) {
      alert('Please select an option to vote.');
      return;
    }
    
    if (!this.poll) {
      this.error = 'Poll data is missing.';
      return;
    }

    this.isLoading = true;
    
    try {
      const userId = await this.getVoterId();
      const voteRef = doc(this.firestore, `polls/${this.pollId}/votes/${userId}`);
      await setDoc(voteRef, {
        optionId: this.selectedOption,
        votedAt: new Date()
      });

      const pollRef = doc(this.firestore, `polls/${this.pollId}`);
      await setDoc(pollRef, { totalVotes: (this.poll.totalVotes || 0) + 1 }, { merge: true });

      this.hasVoted = true;
      
      if (this.poll.resultsVisibility === 'live') {
        setTimeout(() => {
          this.router.navigate(['/polls', this.pollId, 'results']);
        }, 1500);
      }
      
    } catch (error) {
      console.error('Error submitting vote:', error);
      this.error = 'Failed to submit your vote. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  private async getVoterId(): Promise<string> {
    const user = this.auth.currentUser;
    if (user && user.uid) return user.uid;
    
    let fingerprint = localStorage.getItem('anonymous-voter-id');
    if (!fingerprint) {
      fingerprint = 'anon-' + crypto.randomUUID();
      localStorage.setItem('anonymous-voter-id', fingerprint);
    }
    
    return fingerprint;
  }
}
