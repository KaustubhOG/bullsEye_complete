import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { PROGRAM_ID, SEEDS, lamportsToSol } from './config';
import type { 
  Goal, 
  GoalAccount, 
  VerificationAccount, 
  Vote,
  convertGoalStatus,
  convertFailAction 
} from './types';

// ============================================================================
// PDA DERIVATION
// ============================================================================

/**
 * Derive Goal Counter PDA for a user
 * @param userPublicKey - User's wallet public key
 * @returns [PDA PublicKey, bump seed]
 */
export function deriveGoalCounterPda(userPublicKey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("goal_counter"), userPublicKey.toBuffer()],
    PROGRAM_ID
  );
}

/**
 * Derive Goal PDA for a user
 * @param userPublicKey - User's wallet public key
 * @param goalNumber - Goal number from goal counter
 * @returns [PDA PublicKey, bump seed]
 */
export function deriveGoalPda(userPublicKey: PublicKey, goalNumber: number = 0): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.GOAL), userPublicKey.toBuffer(), Buffer.from(new anchor.BN(goalNumber).toArray("le", 8))],
    PROGRAM_ID
  );
}

/**
 * Derive Verification PDA for a goal
 * @param goalPublicKey - Goal PDA public key
 * @returns [PDA PublicKey, bump seed]
 */
export function deriveVerificationPda(goalPublicKey: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.VERIFICATION), goalPublicKey.toBuffer()],
    PROGRAM_ID
  );
}

// ============================================================================
// DATA CONVERSION
// ============================================================================

/**
 * Convert blockchain GoalAccount to frontend Goal format
 */
export function convertGoalAccountToGoal(
  goalAccount: GoalAccount,
  verificationAccount: VerificationAccount,
  goalPda: PublicKey
): Goal {
  // Import conversion functions
  const { convertGoalStatus, convertFailAction } = require('./types');
  
  // Convert status
  const status = convertGoalStatus(goalAccount.status);
  
  // Convert fail action
  const failAction = convertFailAction(goalAccount.failAction);
  
  // Convert votes from verification account
  const votes: Vote[] = verificationAccount.verifiers
    .map((verifier, index) => {
      if (!verificationAccount.votesCast[index]) return null;
      
      // Determine vote based on counts (simplified)
      // In reality, you'd need to track individual votes differently
      // This is a limitation - the contract doesn't store individual vote types
      const vote = index < verificationAccount.yesVotes ? 'yes' : 'no';
      
      return {
        wallet: verifier.toBase58(),
        vote: vote as 'yes' | 'no',
        timestamp: new Date().toISOString(), // Contract doesn't store timestamps per vote
      };
    })
    .filter((v): v is Vote => v !== null);
  
  // Convert timestamps
  const deadline = new Date(goalAccount.deadline.toNumber() * 1000).toISOString();
  const createdAt = new Date(goalAccount.createdAt.toNumber() * 1000).toISOString();
  const verificationDeadline = verificationAccount.verificationDeadline.toNumber() > 0
    ? new Date(verificationAccount.verificationDeadline.toNumber() * 1000).toISOString()
    : undefined;
  
  return {
    // Blockchain data
    publicKey: goalPda.toBase58(),
    user: goalAccount.user.toBase58(),
    title: goalAccount.title,
    description: goalAccount.description,
    amountSol: lamportsToSol(goalAccount.amount.toNumber()),
    deadline,
    failAction,
    status: status === 'submitted' && verificationAccount.finalized 
      ? 'verified' 
      : status === 'active' && 'submitted' in goalAccount.status
      ? 'pending'
      : status,
    createdAt,
    
    // Verification data
    votes,
    yesVotes: verificationAccount.yesVotes,
    noVotes: verificationAccount.noVotes,
    requiredVotes: 2, // 2 out of 3
    verificationDeadline,
    finalized: verificationAccount.finalized,
    
    // UI compatibility
    id: goalPda.toBase58(),
    ownerWallet: goalAccount.user.toBase58(),
    verificationType: 'strangers', // Always strangers with 3 verifiers
  };
}

/**
 * Parse goal status from enum
 */
export function parseGoalStatus(status: GoalAccount['status']): string {
  if ('active' in status) return 'active';
  if ('submitted' in status) return 'submitted';
  if ('claimed' in status) return 'claimed';
  if ('failed' in status) return 'failed';
  return 'unknown';
}

/**
 * Parse fail action from enum
 */
export function parseFailAction(failAction: GoalAccount['failAction']): 'burn' | 'company' {
  if ('burn' in failAction) return 'burn';
  if ('companyWallet' in failAction) return 'company';
  return 'burn';
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate goal creation data
 */
export function validateGoalData(data: {
  title: string;
  description: string;
  amountSol: number;
  deadline: string;
}): { valid: boolean; error?: string } {
  if (!data.title || data.title.length === 0) {
    return { valid: false, error: 'Title is required' };
  }
  
  if (data.title.length > 100) {
    return { valid: false, error: 'Title must be 100 characters or less' };
  }
  
  if (!data.description || data.description.length === 0) {
    return { valid: false, error: 'Description is required' };
  }
  
  if (data.description.length > 500) {
    return { valid: false, error: 'Description must be 500 characters or less' };
  }
  
  if (data.amountSol < 0.1) {
    return { valid: false, error: 'Amount must be at least 0.1 SOL' };
  }
  
  if (data.amountSol > 10) {
    return { valid: false, error: 'Amount must be at most 10 SOL' };
  }
  
  const deadlineDate = new Date(data.deadline);
  if (deadlineDate <= new Date()) {
    return { valid: false, error: 'Deadline must be in the future' };
  }
  
  return { valid: true };
}

// ============================================================================
// FORMATTERS
// ============================================================================

/**
 * Format transaction signature for display
 */
export function formatTxSignature(signature: string, chars = 8): string {
  return `${signature.slice(0, chars)}...${signature.slice(-chars)}`;
}

/**
 * Get Solana Explorer URL for transaction
 */
export function getExplorerUrl(signature: string, network: 'localnet' | 'devnet' | 'mainnet-beta' = 'localnet'): string {
  if (network === 'localnet') {
    return `https://explorer.solana.com/tx/${signature}?cluster=custom&customUrl=http://localhost:8899`;
  }
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
}

/**
 * Get Solana Explorer URL for account
 */
export function getAccountExplorerUrl(address: string, network: 'localnet' | 'devnet' | 'mainnet-beta' = 'localnet'): string {
  if (network === 'localnet') {
    return `https://explorer.solana.com/address/${address}?cluster=custom&customUrl=http://localhost:8899`;
  }
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`;
  return `https://explorer.solana.com/address/${address}${cluster}`;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Parse Anchor error to user-friendly message
 */
export function parseAnchorError(error: any): string {
  if (!error) return 'Unknown error occurred';
  
  const errorString = error.toString();
  
  // Map of contract errors to user-friendly messages
  const errorMap: Record<string, string> = {
    'TitleTooLong': 'Goal title is too long (max 100 characters)',
    'DescriptionTooLong': 'Goal description is too long (max 500 characters)',
    'AmountTooLow': 'Amount must be at least 0.1 SOL',
    'AmountTooHigh': 'Amount must be at most 10 SOL',
    'DeadlineInPast': 'Deadline must be in the future',
    'InvalidGoalStatus': 'Cannot perform this action on goal in current status',
    'Unauthorized': 'You are not authorized to perform this action',
    'NotAVerifier': 'Only registered verifiers can vote',
    'AlreadyVoted': 'You have already voted on this goal',
    'AlreadyFinalized': 'Verification has already been finalized',
    'VerificationNotComplete': 'Verification period has not ended yet',
    'VerificationNotFinalized': 'Verification must be finalized before claiming',
    'NoVerificationResult': 'No verification result available',
    'ActiveGoalExists': 'You already have an active goal. Complete it before creating a new one.',
    'insufficient funds': 'Insufficient SOL balance',
    'User rejected': 'Transaction was rejected',
  };
  
  // Find matching error
  for (const [key, message] of Object.entries(errorMap)) {
    if (errorString.includes(key)) {
      return message;
    }
  }
  
  // Return original error if no match
  return errorString;
}

// ============================================================================
// TIME HELPERS
// ============================================================================

/**
 * Check if deadline has passed
 */
export function isDeadlinePassed(deadline: string): boolean {
  return new Date(deadline) < new Date();
}

/**
 * Get time remaining until deadline
 */
export function getTimeRemaining(deadline: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const now = new Date().getTime();
  const end = new Date(deadline).getTime();
  const diff = end - now;
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, expired: false };
}

/**
 * Format time remaining as human readable string
 */
export function formatTimeRemaining(deadline: string): string {
  const { days, hours, minutes, expired } = getTimeRemaining(deadline);
  
  if (expired) return 'Expired';
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}