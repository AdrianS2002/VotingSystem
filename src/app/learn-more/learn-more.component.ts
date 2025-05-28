import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service'; // adjust path as needed
import { Observable } from 'rxjs';
import { User } from '../models/user';


@Component({
  selector: 'app-learn-more',
  templateUrl: './learn-more.component.html',
  styleUrls: ['./learn-more.component.css'],
  standalone: true,
  imports: [NgFor, NgIf, AsyncPipe]
})
export class LearnMoreComponent implements OnInit {
  user$: Observable<User | null>;

   constructor(private authService: AuthService) {
    this.user$ = this.authService.user.asObservable();
  }

  features = [
    {
      icon: 'fa-vote-yea',
      title: 'Secure Voting',
      description: 'Our platform ensures transparent and secure voting with end-to-end encryption and verification systems.'
    },
    {
      icon: 'fa-users',
      title: 'Community Decisions',
      description: 'Empower your community with collaborative decision-making tools designed for maximum participation.'
    },
    {
      icon: 'fa-chart-bar',
      title: 'Real-time Results',
      description: 'Watch votes come in with our real-time analytics dashboard that provides instant insights.'
    },
    {
      icon: 'fa-mobile-alt',
      title: 'Mobile Friendly',
      description: 'Vote anywhere, anytime with our responsive design that works across all devices.'
    }
  ];

  faqs = [
    {
      question: 'How secure is the voting platform?',
      answer: 'Our platform implements industry-leading security measures including end-to-end encryption, two-factor authentication, and blockchain verification to ensure vote integrity and prevent tampering.'
    },
    {
      question: 'Can I create custom voting options?',
      answer: 'Yes! Our platform allows you to create fully customizable voting polls with multiple question types, custom response options, and flexible voting periods.'
    },
    {
      question: 'Is there a limit to the number of participants?',
      answer: 'Our standard plan supports up to 1,000 participants per vote. For larger communities, our premium and enterprise plans offer unlimited participation.'
    },
    {
      question: 'How do I share my vote with others?',
      answer: 'Each vote generates a unique shareable link that you can distribute via email, social media, or embedding directly on your website.'
    },
    {
      question: 'Can I export voting results?',
      answer: 'Yes, all voting results can be exported in multiple formats including PDF, CSV, and Excel for further analysis or record-keeping.'
    }
  ];

  testimonials = [
    {
      quote: 'This platform revolutionized how our neighborhood association makes decisions. Participation increased by 300% in the first month!',
      author: 'Sarah Chen',
      organization: 'Oak Hills Community Association'
    },
    {
      quote: 'The analytics provided insights we never had before. We finally understand what our members truly want.',
      author: 'Marcus Johnson',
      organization: 'Tech Professionals Guild'
    },
    {
      quote: 'We switched from a complex voting system to this platform and saved countless hours in administration time.',
      author: 'Priya Patel',
      organization: 'University Student Council'
    }
  ];



  ngOnInit(): void {
    // Any initialization logic here
  }
}