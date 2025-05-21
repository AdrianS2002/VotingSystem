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
import { Observable, take, switchMap, from, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PollService {
  constructor(
    private firestore: Firestore, 
    private authService: AuthService
  ) {}

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
          createdBy: userId
        }));
      })
    );
  }

  getPoll(id: string): Observable<Poll> {
    const pollDocRef = doc(this.firestore, `polls/${id}`);
    return docData(pollDocRef, { idField: 'id' }) as Observable<Poll>;
  }

  getPolls(): Observable<Poll[]> {
    return from(this.getPollsRaw());
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
}