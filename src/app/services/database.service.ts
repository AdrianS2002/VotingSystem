import { Injectable } from "@angular/core";
import { Firestore, doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';

import { AppUser } from "../models/appUser";
import { from, map, Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class DatabaseService {
    constructor(private firestore: Firestore) { }
    saveUserProfile(userId: string, email: string, name:string, role: 'user' | 'admin' = 'user'): Observable<void> {
        const userRef = doc(this.firestore, `users/${userId}`);
        const newUser: AppUser = {
            uid: userId,
            email,
            name,
            role,
            createdAt: new Date()
        };

        return from(setDoc(userRef, newUser));
    }

    getUserProfile(userId: string): Observable<AppUser | null> {
        const userRef = doc(this.firestore, `users/${userId}`);
        return from(getDoc(userRef)).pipe(
            map(docSnap => docSnap.exists() ? (docSnap.data() as AppUser) : null)
        );
    }

    updateUserPassword(userId: string, newPassword: string): Observable<void> {
        const password = btoa(newPassword);
        const userRef = doc(this.firestore, `users/${userId}`);
        return from(updateDoc(userRef, { password }));
    }
}