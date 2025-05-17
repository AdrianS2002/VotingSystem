// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { Routes } from '@angular/router';
import { HomeComponent } from './app/home/home.component';

// Dummy component for routing targets
import { Component } from '@angular/core';
import { AuthComponent } from './app/auth/auth.component';
import { LearnMoreComponent } from './app/learn-more/learn-more.component';
@Component({ standalone: true, template: 'Coming soon...' })
class DummyComponent {}

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'polls', component: DummyComponent },
  { path: 'polls/:id', component: DummyComponent },
  { path: 'polls/:id/results', component: DummyComponent },
  { path: 'polls/create', component: DummyComponent },
  { path: 'about', component: LearnMoreComponent },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes)
  ]
}).catch(err => console.error(err));
