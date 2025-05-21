export type PollVisibility = 'public' | 'registered' | 'private';
export type ResultVisibility = 'live' | 'after100Votes' | 'afterExpiration' | 'afterAllVoted';

export interface PollOption {
  id: string;
  text: string;
}

export interface Poll {
  id?: string;
  subject: string;
  options: PollOption[];
  visibility: PollVisibility;
  allowedVoters?: string[];
  resultsVisibility: ResultVisibility;
  publishDate: Date;
  expiresAt: Date;
  totalVotes: number;
  createdBy: string;
}
