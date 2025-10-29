import { PublicKey, clusterApiUrl, Connection } from '@solana/web3.js';

// ============================================================================
// NETWORK CONFIGURATION
// ============================================================================

/**
 * Current network - switch between 'localnet', 'devnet', 'mainnet-beta'
 */
export type NetworkType = 'localnet' | 'devnet' | 'mainnet-beta';

export const NETWORK: NetworkType = 'devnet';

/**
 * RPC Endpoint based on network
 */
export const getRpcEndpoint = (network: NetworkType = NETWORK): string => {
  switch (network) {
    case 'localnet':
      return 'http://127.0.0.1:8899';
    case 'devnet':
      return clusterApiUrl('devnet');
    case 'mainnet-beta':
      return clusterApiUrl('mainnet-beta');
    default:
      return 'http://127.0.0.1:8899';
  }
};

/**
 * Get Solana connection
 */
export const getConnection = (network: NetworkType = NETWORK): Connection => {
  return new Connection(getRpcEndpoint(network), 'confirmed');
};

// ============================================================================
// PROGRAM CONFIGURATION
// ============================================================================

/**
 * BullsEye Program ID
 * This is your deployed smart contract address
 */
export const PROGRAM_ID = new PublicKey(
  '8ubScEZp4RR513qc6pNYgfVbRjTPiAuhqJvN2h4ueaRU'
);

// ============================================================================
// VERIFIERS (UPDATED)
// ============================================================================

/**
 * Three verifier addresses for goal verification
 * These are the only addresses that can vote on goal completions
 * UPDATED: New verifier wallets (all controlled by you, but different addresses)
 */
export const VERIFIERS = [
  new PublicKey('Gi1kdfMhvLtjHLpLiWqQaM6AqveErQ8tXWdAanfEHSKH'),
  new PublicKey('FprggnEn9tfKh3JcgUjDCeFbMUyErAfmyKTJWDB61BpS'),
  new PublicKey('Bf5vWqozxKxNXgNem2P9KQCxqdB2Vfn11KLh5vSNH9yX'),
];

/**
 * Check if a wallet is a registered verifier
 */
export const isVerifier = (walletAddress: string): boolean => {
  try {
    const pubkey = new PublicKey(walletAddress);
    return VERIFIERS.some(v => v.equals(pubkey));
  } catch {
    return false;
  }
};

// ============================================================================
// SPECIAL ADDRESSES
// ============================================================================

/**
 * Company wallet - receives funds when goal fails (if user chose this option)
 */
export const COMPANY_WALLET = new PublicKey(
  'AR8rRkMAcYRpeFZLJeTz5vbGMFy5yrMqNEoEewoGW7hR'
);

/**
 * Burn address - destroys SOL permanently when goal fails (if user chose this option)
 */
export const BURN_ADDRESS = new PublicKey(
  '1nc1nerator11111111111111111111111111111111'
);

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Minimum amount that can be staked (0.1 SOL)
 */
export const MIN_STAKE_AMOUNT = 0.1;

/**
 * Maximum amount that can be staked (10 SOL)
 */
export const MAX_STAKE_AMOUNT = 10;

/**
 * Lamports per SOL (1 SOL = 1,000,000,000 lamports)
 */
export const LAMPORTS_PER_SOL = 1_000_000_000;

/**
 * Verification window in seconds (24 hours)
 */
export const VERIFICATION_WINDOW = 86400;

/**
 * Number of votes required for success (2 out of 3)
 */
export const REQUIRED_YES_VOTES = 2;

/**
 * Number of votes required for failure (2 out of 3)
 */
export const REQUIRED_NO_VOTES = 2;

// ============================================================================
// PDA SEEDS
// ============================================================================

/**
 * Seeds for deriving Program Derived Addresses (PDAs)
 */
export const SEEDS = {
  GOAL: 'goal',
  VERIFICATION: 'verification',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert SOL to lamports
 */
export const solToLamports = (sol: number): number => {
  return Math.floor(sol * LAMPORTS_PER_SOL);
};

/**
 * Convert lamports to SOL
 */
export const lamportsToSol = (lamports: number): number => {
  return lamports / LAMPORTS_PER_SOL;
};

/**
 * Format SOL amount for display (2 decimal places)
 */
export const formatSol = (amount: number): string => {
  return amount.toFixed(2);
};

/**
 * Format wallet address for display (shortened)
 */
export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

// ============================================================================
// EXPORT DEFAULT CONFIG
// ============================================================================

export const config = {
  network: NETWORK,
  rpcEndpoint: getRpcEndpoint(),
  programId: PROGRAM_ID,
  verifiers: VERIFIERS,
  companyWallet: COMPANY_WALLET,
  burnAddress: BURN_ADDRESS,
  minStake: MIN_STAKE_AMOUNT,
  maxStake: MAX_STAKE_AMOUNT,
  requiredYesVotes: REQUIRED_YES_VOTES,
  requiredNoVotes: REQUIRED_NO_VOTES,
  verificationWindow: VERIFICATION_WINDOW,
} as const;

export default config;