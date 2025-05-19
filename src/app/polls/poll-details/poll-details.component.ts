import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Firestore, docData, doc, collection, setDoc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { Poll } from '../poll.model';

@Component({
  selector: 'app-poll-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './poll-details.component.html',
  styleUrl: './poll-details.component.css'
})
export class PollDetailsComponent implements OnInit {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private route = inject(ActivatedRoute);

  pollId!: string;
  poll!: Poll;
  selectedOption = '';
  hasVoted = false;

  async ngOnInit() {
    this.pollId = this.route.snapshot.paramMap.get('id')!;
    const pollDoc = doc(this.firestore, `polls/${this.pollId}`);
    this.poll = await docData(pollDoc).toPromise() as Poll;

    const userId = await this.getVoterId();

    const voteDoc = doc(this.firestore, `polls/${this.pollId}/votes/${userId}`);
    const voteSnap = await getDoc(voteDoc);
    this.hasVoted = voteSnap.exists();
  }

  async submitVote() {
    if (!this.selectedOption) return;

    const userId = await this.getVoterId();
    const voteRef = doc(this.firestore, `polls/${this.pollId}/votes/${userId}`);
    await setDoc(voteRef, {
      optionId: this.selectedOption,
      votedAt: new Date()
    });

    // incrementare contor voturi total
    const pollRef = doc(this.firestore, `polls/${this.pollId}`);
    await setDoc(pollRef, { totalVotes: (this.poll.totalVotes || 0) + 1 }, { merge: true });

    this.hasVoted = true;
  }

private async getVoterId(): Promise<string> {
  // Check for authenticated user first
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
