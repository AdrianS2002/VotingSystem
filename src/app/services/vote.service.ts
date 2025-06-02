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
        return from(this.getUserIdWithFallback(user)).pipe(
          switchMap(userId => {
            if (!userId) {
              return throwError(() => new Error('Unable to identify user. Please try again.'));
            }

            const voteQuery = query(voteCollection, where('pollId', '==', pollId), where('userId', '==', userId));
            return from(getDocs(voteQuery)).pipe(
              switchMap(snapshot => {
                if (!snapshot.empty) {
                  return throwError(() => new Error('You have already voted in this poll.'));
                }

                const vote: Vote = {
                  pollId,
                  userId: userId,
                  optionId,
                  optionText,
                  isAnonymous: !user || !user.id,
                  votedAt: new Date()
                };

                return from(addDoc(voteCollection, vote)).pipe(
                  switchMap(() => of(void 0))
                );
              })
            );
          })
        );
      })
    );
  }

  // Create a method to handle the same fingerprint logic as in PollDetailsComponent
  private async getUserIdWithFallback(user: any): Promise<string> {
    // If user is authenticated, use their ID
    if (user && user.id) {
      return user.id;
    }

    // Otherwise, use the fingerprint from localStorage (anonymous user)
    let fingerprint = localStorage.getItem('anonymous-voter-id');
    if (!fingerprint) {
      fingerprint = 'anon-' + crypto.randomUUID();
      localStorage.setItem('anonymous-voter-id', fingerprint);
    }
    
    return fingerprint;
  }
}
