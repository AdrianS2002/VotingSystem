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
  getDocs
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
    const pollDocRef = doc(this.firestore, `polls/${id}`);
    return docData(pollDocRef, { idField: 'id' }) as Observable<Poll>;
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

  private async getPollsRaw(): Promise<Poll[]> {
    try {
      const pollsSnapshot = await getDocs(collection(this.firestore, 'polls'));

      return pollsSnapshot.docs.map(doc => {
        const data = doc.data() as Omit<Poll, 'id'>;
        return {
          id: doc.id,
          ...data
        } as Poll;
      });
    } catch (error) {
      console.error('Error fetching polls:', error);
      return [];
    }
  }

  getUserPolls(): Observable<Poll[]> {
    return this.authService.user.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          return of([]);
        }

        try {
          const collectionRef = collection(this.firestore, 'polls');
          const q = query(collectionRef, where('createdBy', '==', user.id));
          return collectionData(q, { idField: 'id' }) as Observable<Poll[]>;
        } catch (error) {
          console.error("Error setting up user polls query:", error);
          return of([]);
        }
      })
    );
  }

  updatePoll(id: string, poll: Partial<Poll>) {
    const pollDocRef = doc(this.firestore, `polls/${id}`);
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