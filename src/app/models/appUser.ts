export interface AppUser{
    uid: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
    createdAt: Date;
}