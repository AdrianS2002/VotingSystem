import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Component } from '@angular/core';
import { routes } from './app/app.routes';


const firebaseConfig = {
  apiKey: "AIzaSyCLI336dPkrEf59kKjqXRzApc_8II-cbME",
  authDomain: "votingsystem-f94a1.firebaseapp.com",
  projectId: "votingsystem-f94a1",
  storageBucket: "votingsystem-f94a1.firebasestorage.app",
  messagingSenderId: "857406504881",
  appId: "1:857406504881:web:3ba4dad8181a52481ec790",
  measurementId: "G-45CBTXR6Y4"

};


console.log("dsadasd",routes)
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()), 
    provideAnimationsAsync(),
  ]
}).catch(err => console.error(err)); 