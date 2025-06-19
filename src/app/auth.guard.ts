import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { take, map, tap } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.authService.user.pipe(
      take(1),
      map(user => {
        const profile = this.authService.currentUserProfile;
        
        // Check if the route requires admin role specifically
        const requiresAdmin = route.data['requiresAdmin'] === true;
        
        // Allow if the user is authenticated
        if (profile) {
          // If admin role is required, check for it
          if (requiresAdmin && !profile.role?.includes('admin')) {
            return this.router.createUrlTree(['/access-denied']);
          }
          return true;
        } else {
          // Store the current URL for redirection after login
          localStorage.setItem('redirectUrl', state.url);
          return this.router.createUrlTree(['/auth']);
        }
      })
    );
  }
}
