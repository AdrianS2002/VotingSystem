import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthComponent } from './auth/auth.component';
import { DummyComponent } from './dummy/dummy.component';
import { LearnMoreComponent } from './learn-more/learn-more.component';
import { AuthGuard } from './auth.guard';
import { PollAccessGuard } from './poll-access.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'auth',
    loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'access-denied',
    loadComponent: () => import('./access-denied/access-denied.component').then(m => m.AccessDeniedComponent)
  },
  {
    path: 'polls/create',
    loadComponent: () => import('./polls/poll-create/poll-create.component').then(m => m.PollCreateComponent), canActivate: [AuthGuard]

  },
  {
    path: 'polls/:id/results',
    loadComponent: () => import('./polls/poll-results/poll-results.component').then(m => m.PollResultsComponent),
    canActivate: [PollAccessGuard]
  },
  {
    path: 'polls/:id',
    loadComponent: () => import('./polls/poll-details/poll-details.component').then(m => m.PollDetailsComponent),
    canActivate: [PollAccessGuard]
  },
  {
    path: 'polls/:id/edit',
    loadComponent: () => import('./polls/poll-edit/poll-edit.component').then(m => m.EditPollComponent), canActivate: [AuthGuard]
  },
  {
    path: 'my-polls',
    loadComponent: () => import('./my-polls/my-polls.component').then(m => m.MyPollsComponent),
  },
  {
    path: 'polls',
    loadComponent: () => import('./polls/poll-list/poll-list.component').then(m => m.PollListComponent)
  },
  { path: 'about', component: LearnMoreComponent },
  

  { 
    path: '**', 
    loadComponent: () => import('./fallback/fallback.component').then(m => m.ErrorFallbackComponent),
    data: { 
      errorInfo: { 
        code: 404, 
        message: 'Page not found' 
      },
      customTitle: '404',
      customMessage: 'The page you are looking for does not exist. It might have been moved, deleted, or you entered the wrong URL.',
      showRetry: false 
    }
  }

];
