import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthComponent } from './auth/auth.component';
import { DummyComponent } from './dummy/dummy.component'; 
import { LearnMoreComponent } from './learn-more/learn-more.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'auth',
    loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent)
  },
  { path: 'polls/create',
    loadComponent: () => import('./polls/poll-create/poll-create.component').then(m => m.PollCreateComponent), canActivate: [AuthGuard]
  },
  { 
    path: 'polls/:id/results', 
    loadComponent: () => import('./polls/poll-results/poll-results.component').then(m => m.PollResultsComponent) 
  },
  { 
    path: 'polls/:id', 
    loadComponent: () => import('./polls/poll-details/poll-details.component').then(m => m.PollDetailsComponent) 
  },
  { 
    path: 'polls',
    loadComponent: () => import('./polls/poll-list/poll-list.component').then(m => m.PollListComponent) 
  },
   { path: 'about', component: LearnMoreComponent },
];
