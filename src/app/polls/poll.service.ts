import { Injectable } from '@angular/core';
import { collection, collectionData, doc, docData, Firestore, addDoc, updateDoc, deleteDoc, setDoc } from '@angular/fire/firestore';
import { Poll } from './poll.model';
import { collection as fsCollection, query, where } from 'firebase/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class PollService {
  private pollRef;

  constructor(private firestore: Firestore, private auth: Auth) {
    this.pollRef = fsCollection(this.firestore, 'polls');
  }

  createPoll(poll: Poll) {
    return addDoc(this.pollRef, {
      ...poll,
      totalVotes: 0,
      createdBy: this.auth.currentUser?.uid || 'anonymous'
    });
  }

  getPoll(id: string) {
    return docData(doc(this.firestore, `polls/${id}`));
  }

  getPolls() {
    return collectionData(this.pollRef, { idField: 'id' });
  }

  updatePoll(id: string, poll: Partial<Poll>) {
    return updateDoc(doc(this.firestore, `polls/${id}`), poll);
  }

  deletePoll(id: string) {
    return deleteDoc(doc(this.firestore, `polls/${id}`));
  }
}
