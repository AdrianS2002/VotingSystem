import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthComponent } from './auth/auth.component';
import { DummyComponent } from './dummy/dummy.component'; 

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'auth',
    loadComponent: () => import('./auth/auth.component').then(m => m.AuthComponent)
  },
//   { path: 'polls', component: DummyComponent },
//   { path: 'polls/:id', component: DummyComponent },
//   { path: 'polls/:id/results', component: DummyComponent },
//   { path: 'polls/create', component: DummyComponent },
//   { path: 'about', component: DummyComponent },
];
