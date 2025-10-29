import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';

// ============================================================================
// ENUMS (matching Rust enums from your smart contract)
// ============================================================================

/**
 * Goal status enum - matches GoalStatus in Rust
 */
export enum GoalStatus {
  Active = 'active',
  Submitted = 'submitted',
  Claimed = 'claimed',
  Failed = 'failed',
}

/**
 * Fail action enum - matches FailAction in Rust
 */
export enum FailAction {
  Burn = 'burn',
  CompanyWallet = 'companyWallet',
}

/**
 * Verification result enum - matches VerificationResult in Rust
 */
export enum VerificationResult {
  Success = 'success',
  Failure = 'failure',
}

// ============================================================================
// BLOCKCHAIN ACCOUNT STRUCTURES
// ============================================================================

/**
 * Goal account structure from blockchain
 * Matches the Goal struct in your Rust program
 */
export interface GoalAccount {
  user: PublicKey;
  title: string;
  description: string;
  amount: anchor.BN;
  deadline: anchor.BN;
  failAction: { burn: {} } | { companyWallet: {} };
  status: { active: {} } | { submitted: {} } | { claimed: {} } | { failed: {} };
  verification: PublicKey;
  createdAt: anchor.BN;
  bump: number;
}

/**
 * Verification account structure from blockchain
 * Matches the Verification struct in your Rust program
 */
export interface VerificationAccount {
  goal: PublicKey;
  verifiers: PublicKey[];
  yesVotes: number;
  noVotes: number;
  votesCast: boolean[];
  finalized: boolean;
  result: { success: {} } | { failure: {} } | null;
  verificationDeadline: anchor.BN;
  bump: number;
}

// ============================================================================
// FRONTEND DATA STRUCTURES
// ============================================================================

/**
 * Vote information
 */
export interface Vote {
  wallet: string;
  vote: 'yes' | 'no';
  timestamp: string;
}

/**
 * Goal data for frontend display
 * This is what we'll use in React components
 */
export interface Goal {
  // Blockchain data
  publicKey: string; // PDA address of the goal
  user: string; // Owner wallet address
  title: string;
  description: string;
  amountSol: number; // Amount in SOL (not lamports)
  deadline: string; // ISO string
  failAction: 'burn' | 'company';
  status: 'active' | 'pending' | 'submitted' | 'verified' | 'claimed' | 'failed';
  createdAt: string; // ISO string
  
  // Verification data
  votes: Vote[];
  yesVotes: number;
  noVotes: number;
  requiredVotes: number;
  verificationDeadline?: string; // ISO string
  finalized: boolean;
  
  // UI-specific (for backwards compatibility with mockApi)
  id: string; // Same as publicKey
  ownerWallet: string; // Same as user
  verificationType?: 'strangers' | 'friend'; // Derived from verifiers
  verifierWallet?: string; // For friend verification
  blinkLinks?: { verifier: string; link: string }[];
}

/**
 * Feed item for social feed
 */
export interface FeedItem {
  id: string;
  type: 'goal_created' | 'goal_completed' | 'goal_failed' | 'verification_requested' | 'vote_cast';
  username: string;
  avatar: string;
  message: string;
  timestamp: string;
  goalId: string;
}

/**
 * Data needed to create a new goal
 */
export interface CreateGoalData {
  title: string;
  description: string;
  amountSol: number;
  deadline: string; // ISO string
  verificationType: 'strangers' | 'friend';
  verifierWallet?: string;
  failDestination: 'burn' | 'company';
}

// ============================================================================
// HELPER TYPE GUARDS
// ============================================================================

/**
 * Check if status is Active
 */
export function isActive(status: GoalAccount['status']): boolean {
  return 'active' in status;
}

/**
 * Check if status is Submitted
 */
export function isSubmitted(status: GoalAccount['status']): boolean {
  return 'submitted' in status;
}

/**
 * Check if status is Claimed
 */
export function isClaimed(status: GoalAccount['status']): boolean {
  return 'claimed' in status;
}

/**
 * Check if status is Failed
 */
export function isFailed(status: GoalAccount['status']): boolean {
  return 'failed' in status;
}

/**
 * Check if fail action is Burn
 */
export function isBurn(failAction: GoalAccount['failAction']): boolean {
  return 'burn' in failAction;
}

/**
 * Check if fail action is CompanyWallet
 */
export function isCompanyWallet(failAction: GoalAccount['failAction']): boolean {
  return 'companyWallet' in failAction;
}

/**
 * Check if verification result is Success
 */
export function isSuccess(result: VerificationAccount['result']): boolean {
  return result !== null && 'success' in result;
}

/**
 * Check if verification result is Failure
 */
export function isFailure(result: VerificationAccount['result']): boolean {
  return result !== null && 'failure' in result;
}

// ============================================================================
// CONVERSION HELPERS
// ============================================================================

/**
 * Convert blockchain GoalStatus to frontend status string
 */
export function convertGoalStatus(status: GoalAccount['status']): Goal['status'] {
  if ('active' in status) return 'active';
  if ('submitted' in status) return 'submitted';
  if ('claimed' in status) return 'claimed';
  if ('failed' in status) return 'failed';
  return 'active';
}

/**
 * Convert blockchain FailAction to frontend string
 */
export function convertFailAction(failAction: GoalAccount['failAction']): 'burn' | 'company' {
  if ('burn' in failAction) return 'burn';
  if ('companyWallet' in failAction) return 'company';
  return 'burn';
}

/**
 * Convert frontend failDestination to blockchain FailAction
 */
export function toBlockchainFailAction(failDestination: 'burn' | 'company'): { burn: {} } | { companyWallet: {} } {
  return failDestination === 'burn' ? { burn: {} } : { companyWallet: {} };
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

/**
 * Transaction result
 */
export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

/**
 * Airdrop result (for testing on localnet)
 */
export interface AirdropResult {
  signature: string;
  amount: number;
  success: boolean;
}