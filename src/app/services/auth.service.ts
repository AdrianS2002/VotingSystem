import { Injectable } from "@angular/core";
import { BehaviorSubject, catchError, from, map, Observable, switchMap, take, tap, throwError } from "rxjs";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { DatabaseService } from "./database.service";
import { User } from "../models/user";

export interface AuthResponseData {
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiKey = "AIzaSyCLI336dPkrEf59kKjqXRzApc_8II-cbME";
    private signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`;
    private loginUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${this.apiKey}`;
    private verifyEmailUrl = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${this.apiKey}`;
    private getUserDataUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${this.apiKey}`;

    user = new BehaviorSubject<User | null>(null);

    constructor(
        private http: HttpClient,
        private router: Router,
        private databaseService: DatabaseService
    ) {
        this.autoLogin();
    }

    signup(name: string, email: string, password: string): Observable<AuthResponseData> {
        const hashedPassword = btoa(password);
        return this.http.post<AuthResponseData>(this.signUpUrl, {
            email,
            password,
            returnSecureToken: true
        }).pipe(
            switchMap((resData) => {
                if (!resData.localId) {
                    return throwError(() => new Error("User creation failed"));
                }
                return this.sendVerificationEmail(resData.idToken).pipe(
                    switchMap(() => {
                        return this.databaseService.saveUserProfile(resData.localId, email, name);
                    }),
                    map(() => resData)
                );
            }),
            tap(() => {
                console.log("User signed up successfully");
            }),
            catchError(this.handleError)
        );
    }

    sendVerificationEmail(idToken: string): Observable<any> {
        return this.http.post<any>(this.verifyEmailUrl, {
            requestType: "VERIFY_EMAIL",
            idToken
        }).pipe(
            catchError(this.handleError)
        );
    }

    logout() {
        this.user.next(null);
        console.log('Logging out...');
        localStorage.removeItem('userData');
        this.router.navigate(['/auth']);
    }

    private handleAuthentification(email: string, userId: string, token: string, expiresIn: number) {
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
        const user = new User(email, userId, token, expirationDate);
        this.user.next(user);
        localStorage.setItem('userData', JSON.stringify({
            email: user.email,
            id: user.id,
            _token: user.token,
            _tokenExpirationDate: expirationDate.toISOString()
        }));
    }


    login(email: string, password: string): Observable<AuthResponseData> {
        return this.http.post<AuthResponseData>(this.loginUrl, {
            email,
            password,
            returnSecureToken: true
        }).pipe(
            switchMap((resData) => {
                return this.checkEmailVerification(resData.idToken).pipe(
                    switchMap((isVerified) => {
                        if (!isVerified) {
                            return throwError(() => ({
                                error: { error: { message: 'EMAIL_NOT_VERIFIED' } }
                            }));
                        }
                        return from(this.databaseService.getUserProfile(resData.localId)).pipe(
                            map(() => resData)
                        );
                    })
                );
            }),
            catchError(this.handleError),
            tap(resData => {
                this.handleAuthentification(resData.email, resData.localId, resData.idToken, +resData.expiresIn);
            })
        );
    }

    updateUserPassword(newPassword: string): Observable<any> {
        return this.user.pipe(
            take(1),
            switchMap(user => {
                if (!user) {
                    return throwError(() => new Error('No authenticated user!'));
                }
                return this.http.post<any>(
                    `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${this.apiKey}`,
                    {
                        idToken: user.token,
                        password: newPassword,
                        returnSecureToken: true
                    }
                ).pipe(
                    switchMap(resData => {
                        return from(this.databaseService.updateUserPassword(user.id, newPassword)).pipe(
                            map(() => resData)
                        );
                    }),
                    tap(() => console.log('Password successfully updated in Firebase Authentication and Firestore.')),
                    catchError(this.handleError)
                );
            })
        );
    }

    checkEmailVerification(idToken: string): Observable<boolean> {
        return this.http.post<any>(this.getUserDataUrl, { idToken }).pipe(
            map((res) => {
                const user = res.users ? res.users[0] : null;
                console.log('User:', user);
                console.log('Email verified:', user?.emailVerified);
                if (user?.email === 'admin@admin.com') {
                    return true;
                }

                return user?.emailVerified || false;
            }),
            catchError(this.handleError)
        );
    }


    autoLogin() {
        const userDataStr = localStorage.getItem('userData');
        if (!userDataStr) {
            return;
        }
        try {
            const userDataObj = JSON.parse(userDataStr);
            const loadedUser = new User(
                userDataObj.email,
                userDataObj.id,
                userDataObj._token,
                new Date(userDataObj._tokenExpirationDate)
            );
            if (loadedUser.token) {
                this.user.next(loadedUser);
            }
        } catch (error) {
            console.error("Auto login failed", error);
        }
    }

    private handleError(errorRes: HttpErrorResponse) {
        let errorMessage = 'An unknown error occurred!';
        if (!errorRes.error || !errorRes.error.error) {
            return throwError(() => new Error(errorMessage));
        }
        switch (errorRes.error.error.message) {
            case 'EMAIL_EXISTS':
                errorMessage = 'This email exists already.';
                break;
            case 'EMAIL_NOT_FOUND':
                errorMessage = 'Credentials were not found.';
                break;
            case 'INVALID_PASSWORD':
                errorMessage = 'Credentials were not found.';
                break;
            case 'INVALID_LOGIN_CREDENTIALS':
                errorMessage = 'Invalid login credentials.';
                break;
            case 'USER_DISABLED':
                errorMessage = 'This user has been disabled.';
                break;
            case 'INVALID_ID_TOKEN':
                errorMessage = 'Invalid session token. Please login again.';
                break;
            case 'EMAIL_NOT_VERIFIED':
                errorMessage = 'Please verify your email before logging in.';
                break;
        }
        return throwError(() => new Error(errorMessage));
    }


}