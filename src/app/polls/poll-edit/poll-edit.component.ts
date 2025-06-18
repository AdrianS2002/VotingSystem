import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Poll, PollVisibility, ResultVisibility } from '../../models/poll.model';
import { PollService } from '../../services/poll.service';

@Component({
  selector: 'app-edit-poll',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, NgIf],
  templateUrl: './poll-edit.component.html',
  styleUrl: './poll-edit.component.css'
})
export class EditPollComponent implements OnInit {
  pollId = '';
  poll: Poll = {
    subject: '',
    options: [{ id: '', text: '' }, { id: '', text: '' }],
    visibility: 'public',
    resultsVisibility: 'live',
    publishDate: new Date(),
    expiresAt: new Date(),
    totalVotes: 0,
    createdBy: ''
  };

  voterEmails = '';
  isLoading = false;
  dateValidation?: { valid: boolean, message?: string };

  constructor(
    private route: ActivatedRoute,
    private pollService: PollService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.pollId = this.route.snapshot.paramMap.get('id') || '';
    console.log('📌 pollId extras din URL:', this.pollId);
    if (!this.pollId) return;

    this.isLoading = true;
    console.log('🔄 Se încarcă sondajul din Firestore...');

    this.pollService.getPoll(this.pollId).subscribe({
      next: (data) => {
        console.log('📥 Poll primit din Firestore:', data);
        console.log('📊 Tip publishDate:', typeof data.publishDate, '| Tip expiresAt:', typeof data.expiresAt);

        this.poll = {
          ...data,
          publishDate: this.safeToDate(data.publishDate),
          expiresAt: this.safeToDate(data.expiresAt)
        };

        console.log('✅ Poll mapat local:', this.poll);

        this.voterEmails = (data.allowedVoters || []).join(', ');
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading poll:', err);
        this.isLoading = false;
      }
    });
  }


  updatePoll(): void {
    const updatedPoll: Partial<Poll> = {
      ...this.poll,
      allowedVoters: this.poll.visibility === 'private'
        ? this.voterEmails.split(',').map(e => e.trim()).filter(e => e)
        : []
    };

    console.log('📤 Trimitem sondajul actualizat către Firestore:', updatedPoll);

    this.pollService.updatePoll(this.pollId, updatedPoll).subscribe({
      next: () => {
        console.log('✅ Update reușit. Navigare către /my-polls');
        this.router.navigate(['/my-polls']);
      },
      error: (err) => console.error('❌ Update failed:', err)
    });
  }


  addOption(): void {
    this.poll.options.push({ id: '', text: '' });
  }

  removeOption(index: number): void {
    if (this.poll.options.length > 2) {
      this.poll.options.splice(index, 1);
    }
  }

  validateDates(): { valid: boolean, message?: string } {
    const startDate = this.poll.publishDate;
    const endDate = this.poll.expiresAt;

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { valid: false, message: 'Datele introduse nu sunt valide.' };
    }

    if (endDate <= startDate) {
      return { valid: false, message: 'Data de expirare trebuie să fie după data de publicare.' };
    }

    const diffMinutes = (endDate.getTime() - startDate.getTime()) / 60000;

    if (diffMinutes < 1) {
      return { valid: false, message: 'Trebuie să existe cel puțin un minut între date.' };
    }

    return { valid: true };
  }

  safeToDate(date: any): Date {
    console.log('🔍 Convertim data:', date, '| tip:', typeof date);

    if (date?.toDate) return date.toDate(); // Firebase Timestamp
    if (typeof date === 'string' || typeof date === 'number') return new Date(date);
    return date instanceof Date ? date : new Date(); // fallback
  }


  private toDatetimeLocalString(date: Date): string {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  get publishDateLocal(): string {
    return this.toDatetimeLocalString(this.poll.publishDate);
  }
  set publishDateLocal(value: string) {
    this.poll.publishDate = new Date(value);
  }

  get expiresAtLocal(): string {
    return this.toDatetimeLocalString(this.poll.expiresAt);
  }
  set expiresAtLocal(value: string) {
    this.poll.expiresAt = new Date(value);
  }
}
