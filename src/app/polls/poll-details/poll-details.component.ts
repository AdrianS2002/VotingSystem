import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Firestore, doc, getDoc, setDoc, collection, getDocs, query, where } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Poll } from '../../models/poll.model';
import { VoteService } from '../../services/vote.service';
import { AuthService } from '../../services/auth.service';

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
  userEmail: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore,
    private auth: Auth,
    private voteService: VoteService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    this.isLoading = true;
    try {
      this.pollId = this.route.snapshot.paramMap.get('id') || '';
      if (!this.pollId) throw new Error('Poll ID is required');

      const pollDoc = await getDoc(doc(this.firestore, `polls/${this.pollId}`));
      if (!pollDoc.exists()) throw new Error('Poll not found');

      this.poll = { id: pollDoc.id, ...pollDoc.data() } as Poll;

      const userId = await this.getVoterId();
      const voteQuery = query(
        collection(this.firestore, 'votes'),
        where('pollId', '==', this.pollId),
        where('userId', '==', userId)
      );
      const voteSnap = await getDocs(voteQuery);
      if (!voteSnap.empty) {
        this.hasVoted = true;
        this.selectedOption = voteSnap.docs[0].data()['optionId'];
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
      this.error = 'Please select an option to vote.';
      return;
    }

    if (!this.poll) {
      this.error = 'Poll data is missing.';
      return;
    }

    if (this.poll.visibility === 'private' && this.poll.allowedVoters?.length) {
      const normalizedEmails = this.poll.allowedVoters.map(email => email.trim().toLowerCase());
      const currentEmail = this.userEmail.trim().toLowerCase();

      console.log('Normalized Emails:', normalizedEmails);
      console.log('Current Email:', currentEmail);

      if (!normalizedEmails.includes(currentEmail)) {
        this.error = 'You are not allowed to vote in this private poll.';
        return;
      }
    }


    this.isLoading = true;

    try {
      const selected = this.poll.options.find(opt => opt.id === this.selectedOption);
      if (!selected) throw new Error('Selected option not found');

      await this.voteService.vote(this.pollId, selected.id, selected.text).toPromise();
      const pollRef = doc(this.firestore, `polls/${this.pollId}`);
      await setDoc(pollRef, {
        totalVotes: (this.poll.totalVotes || 0) + 1
      }, { merge: true });

      this.hasVoted = true;

      if (this.poll.resultsVisibility === 'live') {
        setTimeout(() => {
          this.router.navigate(['/polls', this.pollId, 'results']);
        }, 1500);
      }

    } catch (error: any) {
      console.error('Vote error:', error);
      this.error = error.message || 'Failed to submit your vote.';
    } finally {
      this.isLoading = false;
    }
  }

  private async getVoterId(): Promise<string> {
    const user = this.authService.currentUserProfile;

    if (user && user.uid) {
      this.userEmail = user.email || '';
      return user.uid;
    }

    let fingerprint = localStorage.getItem('anonymous-voter-id');
    if (!fingerprint) {
      fingerprint = 'anon-' + crypto.randomUUID();
      localStorage.setItem('anonymous-voter-id', fingerprint);
    }

    this.userEmail = 'anonymous';
    return fingerprint;
  }
}