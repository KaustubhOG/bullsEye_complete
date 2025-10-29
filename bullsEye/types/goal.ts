export type VerificationType = 'friend' | 'strangers';
export type FailDestination = 'burn' | 'company';
export type GoalStatus = 'pending' | 'active' | 'verified' | 'claimed' | 'failed';
export type VoteType = 'yes' | 'no';

export interface Vote {
  wallet: string;
  vote: VoteType;
  timestamp: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  amountSol: number;
  deadline: string;
  verificationType: VerificationType;
  verifierWallet?: string;
  failDestination: FailDestination;
  status: GoalStatus;
  votes: Vote[];
  requiredVotes: number;
  createdAt: string;
  ownerWallet: string;
  blinkLinks?: {
    verifier: string;
    link: string;
  }[];
}

export interface CreateGoalData {
  title: string;
  description: string;
  amountSol: number;
  deadline: string;
  verificationType: VerificationType;
  verifierWallet?: string;
  failDestination: FailDestination;
}

export interface FeedItem {
  id: string;
  type: 'goal_created' | 'goal_completed' | 'goal_failed' | 'verification_requested';
  username: string;
  avatar: string;
  message: string;
  timestamp: string;
  goalId?: string;
}