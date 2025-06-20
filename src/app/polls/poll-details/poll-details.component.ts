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
  isExpired: boolean = false;

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

    // We don't need to check visibility permissions here anymore
    // because the PollAccessGuard already handles that

    const isAdmin = this.authService.currentUserProfile?.role === 'admin';
    const now = new Date();
    
    // Check if poll has expired
    const expiryDate = this.getDateObject(this.poll.expiresAt);
    if (now > expiryDate) {
      this.isExpired = true;
      this.error = 'This poll has expired and is no longer accepting votes.';
      console.log("Poll has expired");
      
      if(!isAdmin){
        this.error = null
      }
    }

    // Check if the user has already voted
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

  // Check if poll has expired
  const now = new Date();
  const expiryDate = this.getDateObject(this.poll.expiresAt);
  if (now > expiryDate) {
    this.error = 'This poll has expired and is no longer accepting votes.';
    return;
  }

  // Note: We don't need to check visibility permissions here anymore
  // because the PollAccessGuard already handles that

  this.isLoading = true;

  try {
    // Rest of your existing voting code
    const selected = this.poll.options.find(opt => opt.id === this.selectedOption);
    if (!selected) throw new Error('Selected option not found');
    await new Promise<void>((resolve, reject) => {
      this.voteService.vote(this.pollId, selected.id, selected.text)
        .subscribe({
          next: () => resolve(),
          error: (err) => reject(err)
        });
    });
    
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
      console.log("Using authenticated user ID:", user.uid);
      this.userEmail = user.email || '';
      return user.uid;
    }

    const STORAGE_KEY = 'anonymous-voter-id';
    let fingerprint = localStorage.getItem(STORAGE_KEY);
    
    if (!fingerprint) {
      fingerprint = this.generateAnonymousId();
      localStorage.setItem(STORAGE_KEY, fingerprint);
    }
    
    console.log("Using anonymous ID:", fingerprint);
    return fingerprint;
  }

  private generateAnonymousId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return 'anon-' + crypto.randomUUID();
    }
    
    return 'anon-' + Date.now() + '-' + Math.random().toString(36).substring(2);
  }

  private getDateObject(date: any): Date {
  if (date instanceof Date) return date;

  if (date && typeof date.toDate === 'function') {
    return date.toDate();
  }

  return new Date(date);
}

protected formatFirestoreDate(date: any): Date | null {
  if (!date) return null;
  
  // For Firestore Timestamp objects
  if (date && typeof date.toDate === 'function') {
    return date.toDate();
  }
  
  // For string dates
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  // For Date objects
  if (date instanceof Date) {
    return date;
  }
  
  // For numeric timestamps
  if (typeof date === 'number') {
    return new Date(date);
  }
  
  return null;
}
}