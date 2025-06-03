export interface Vote {
  pollId: string;
  userId: string;
  optionId: string;
  optionText: string;
  votedAt: Date;
  isAnonymous?: boolean;
}
