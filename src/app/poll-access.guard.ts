import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of, from } from 'rxjs';
import { map, switchMap, take, catchError } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Poll } from './models/poll.model';

@Injectable({ providedIn: 'root' })
export class PollAccessGuard implements CanActivate {
  constructor(
    private authService: AuthService, 
    private router: Router,
    private firestore: Firestore
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    const pollId = route.paramMap.get('id');
    
    if (!pollId) {
      return of(this.router.createUrlTree(['/polls']));
    }

    return from(getDoc(doc(this.firestore, `polls/${pollId}`))).pipe(
      switchMap(pollDoc => {
        if (!pollDoc.exists()) {
          return of(this.router.createUrlTree(['/polls']));
        }

        const poll = { id: pollDoc.id, ...pollDoc.data() } as Poll;
        
        const now = new Date();
        const publishDate = this.getDateObject(poll.publishDate);
        
        if (publishDate > now) {
          const isAdmin = this.authService.currentUserProfile?.role === 'admin';
          if (!isAdmin) {
            return of(this.router.createUrlTree(['/polls']));
          }
        }

        // For public polls, allow access
        if (poll.visibility === 'public') {
          return of(true);
        }
        
        // For registered or private polls, check authentication
        return this.authService.user.pipe(
          take(1),
          map(user => {
            if (!user) {
              // Store the URL to redirect to after login
              this.storeRedirectUrl(state.url);
              return this.router.createUrlTree(['/auth']);
            }
            
            // For registered-only polls, any authenticated user is allowed
            if (poll.visibility === 'registered') {
              return true;
            }
            
            // For private polls, check if the user's email is in the allowedVoters list
            if (poll.visibility === 'private' && poll.allowedVoters?.length) {
              const userEmail = user.email?.toLowerCase();
              const allowedEmails = poll.allowedVoters.map(email => email.toLowerCase());
              
              if (userEmail && allowedEmails.includes(userEmail)) {
                return true;
              }
              
              // User is authenticated but not allowed for this private poll
              return this.router.createUrlTree(['/access-denied']);
            }
            
            return true;
          })
        );
      }),
      catchError(() => {
        return of(this.router.createUrlTree(['/polls']));
      })
    );
  }

  private getDateObject(date: any): Date {
    if (date instanceof Date) return date;

    if (date && typeof date.toDate === 'function') {
      return date.toDate();
    }

    return new Date(date);
  }

  private storeRedirectUrl(url: string): void {
    localStorage.setItem('redirectUrl', url);
  }
}
