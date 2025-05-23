import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Vote } from '../models/vote.model';
import { from, Observable, switchMap, take, of, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class VoteService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService
  ) {}

  vote(pollId: string, optionId: string, optionText: string): Observable<void> {
    const voteCollection = collection(this.firestore, 'votes');

    return this.authService.user.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          return throwError(() => new Error('User must be logged in to vote.'));
        }

        const voteQuery = query(voteCollection, where('pollId', '==', pollId), where('userId', '==', user.id));
        return from(getDocs(voteQuery)).pipe(
          switchMap(snapshot => {
            if (!snapshot.empty) {
              return throwError(() => new Error('You have already voted in this poll.'));
            }

            const vote: Vote = {
              pollId,
              userId: user.id,
              optionId,
              optionText,
              votedAt: new Date()
            };

            return from(addDoc(voteCollection, vote)).pipe(
              switchMap(() => of(void 0))
            );
          })
        );
      })
    );
  }
}
