import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  getDoc
} from '@angular/fire/firestore';
import { Poll } from '../models/poll.model';
import { AuthService } from './auth.service';
import { Observable, take, switchMap, from, of, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PollService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) { }

  createPoll(poll: Poll) {
    const pollsCollection = collection(this.firestore, 'polls');

    return this.authService.user.pipe(
      take(1),
      switchMap(user => {
        const userId = user ? user.id : 'anonymous';

        return from(addDoc(pollsCollection, {
          ...poll,
          publishDate: poll.publishDate,
          expiresAt: poll.expiresAt,
          totalVotes: 0,
          createdBy: userId,
          createdAt: new Date()
        }));
      })
    );
  }

  getPoll(id: string): Observable<Poll> {
  console.log('📡 Apel getPoll() cu id:', id);
  const pollRef = doc(this.firestore, `polls/${id}`);
  console.log('🧾 pollRef construit:', pollRef);

  return from(getDoc(pollRef)).pipe(
    map(snapshot => {
      if (!snapshot.exists()) {
        throw new Error('Poll not found');
      }
      const data = snapshot.data() as Poll;
      data.id = snapshot.id;
      console.log('✅ Snapshot convertit în Poll:', data);
      return data;
    })
  );
}


  getPolls(): Observable<Poll[]> {
    const pollsCollection = collection(this.firestore, 'polls');
    const votesCollection = collection(this.firestore, 'votes');

    return from(getDocs(pollsCollection)).pipe(
      switchMap(async pollSnap => {
        const polls: Poll[] = [];

        for (const docSnap of pollSnap.docs) {
          const poll = { id: docSnap.id, ...docSnap.data() } as Poll;

          // Count votes for this poll
          const voteQuery = query(votesCollection, where('pollId', '==', poll.id!));
          const voteSnap = await getDocs(voteQuery);
          poll.totalVotes = voteSnap.size;

          polls.push(poll);
        }

        return polls;
      }),
      map(polls => polls.sort((a, b) => b.totalVotes - a.totalVotes)) // Optional: sort polls by popularity
    );
  }


  updatePoll(id: string, poll: Partial<Poll>) {
    console.log('📝 Apel updatePoll() cu id:', id);
    console.log('📦 Conținut de updatat:', poll);
    const pollDocRef = doc(this.firestore, `polls/${id}`);
    console.log('📌 Referință document Firestore:', pollDocRef);

    return from(updateDoc(pollDocRef, poll));
  }


  deletePoll(id: string) {
    const pollDocRef = doc(this.firestore, `polls/${id}`);
    return from(deleteDoc(pollDocRef));
  }

  async hasUserVoted(pollId: string, userId: string): Promise<boolean> {
    const votesRef = collection(this.firestore, 'votes');
    const q = query(votesRef, where('pollId', '==', pollId), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }


}