export interface Vote {
  id?: string; 
  pollId: string;       
  userId: string;       
  optionId: string;
  optionText: string;     
  votedAt: Date;        
}
