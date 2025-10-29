import { getBullseyeClient } from './solana/bullseye-client';
import type { Goal, CreateGoalData, Vote, FeedItem } from '@/types/goal';
import { VERIFIERS } from './solana/config';

// Get the singleton client
const client = getBullseyeClient();

// In-memory feed for now (we'll enhance this later)
let mockFeed: FeedItem[] = [
  {
    id: 'f1',
    type: 'goal_completed',
    username: 'alice.sol',
    avatar: '🎯',
    message: 'successfully completed "Read 10 books" and claimed 0.3 SOL!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    goalId: '123',
  },
  {
    id: 'f2',
    type: 'goal_created',
    username: 'bob.crypto',
    avatar: '🚀',
    message: 'committed 0.5 SOL to "Learn Rust programming"',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    goalId: '124',
  },
];

// Simulated API delay for UX
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  /**
   * Create a new goal on blockchain
   */
  async createGoal(data: CreateGoalData, ownerWallet: string, wallet: any): Promise<Goal> {
    await delay(300);
    
    try {
      console.log('🚀 Creating goal on blockchain...', data);
      
      const { goal, signature } = await client.createGoal(data, wallet);
      
      console.log('✅ Goal created on blockchain!', { goal, signature });
      
      // Add to feed
      mockFeed.unshift({
        id: `feed-${Date.now()}`,
        type: 'goal_created',
        username: 'You',
        avatar: '🎯',
        message: `committed ${data.amountSol} SOL to "${data.title}"`,
        timestamp: new Date().toISOString(),
        goalId: goal.id,
      });
      
      return goal;
    } catch (error: any) {
      console.error('❌ Error creating goal:', error);
      
      // Re-throw with better error message
      if (error.message.includes('already been processed')) {
        throw new Error('Transaction already processed. Please check your wallet.');
      } else if (error.message.includes('insufficient funds')) {
        throw new Error('Insufficient SOL balance. Please fund your wallet.');
      } else if (error.message.includes('ActiveGoalExists')) {
        throw new Error('You already have an active goal. Complete it before creating a new one.');
      }
      throw error;
    }
  },

  /**
   * Get all goals for a specific wallet (or all goals if no wallet specified)
   */
  async getGoals(wallet?: string): Promise<Goal[]> {
    await delay(200);
    
    try {
      console.log('📊 Fetching goals from blockchain...', wallet);
      
      if (wallet) {
        // Fetch specific user's goal
        const goal = await client.getGoal(wallet);
        return goal ? [goal] : [];
      } else {
        // Fetch all goals
        const goals = await client.getAllGoals();
        console.log('✅ Fetched goals:', goals.length);
        return goals;
      }
    } catch (error) {
      console.error('❌ Error fetching goals:', error);
      return [];
    }
  },

  /**
   * Get a single goal by user wallet
   */
  async getGoal(userWallet: string): Promise<Goal | null> {
    await delay(100);
    
    try {
      console.log('📊 Fetching goal from blockchain...', userWallet);
      const goal = await client.getGoal(userWallet);
      return goal;
    } catch (error) {
      console.error('❌ Error fetching goal:', error);
      return null;
    }
  },

  /**
   * NEW: Check if user has goal counter initialized
   */
  async hasGoalCounter(userWallet: string): Promise<boolean> {
    try {
      const { PublicKey } = await import('@solana/web3.js');
      const pubkey = new PublicKey(userWallet);
      return client.hasGoalCounter(pubkey);
    } catch (error) {
      console.error('❌ Error checking goal counter:', error);
      return false;
    }
  },

  /**
   * NEW: Check if user has active goal
   */
  async hasActiveGoal(userWallet: string): Promise<boolean> {
    try {
      const { PublicKey } = await import('@solana/web3.js');
      const pubkey = new PublicKey(userWallet);
      return client.hasActiveGoal(pubkey);
    } catch (error) {
      console.error('❌ Error checking active goal:', error);
      return false;
    }
  },

  /**
   * NEW: Initialize goal counter for user
   */
  async initializeGoalCounter(wallet: any): Promise<string> {
    try {
      return await client.initializeGoalCounter(wallet);
    } catch (error) {
      console.error('❌ Error initializing goal counter:', error);
      throw error;
    }
  },

  /**
   * Submit goal for verification
   */
  async requestVerification(goalId: string, userWallet: string, wallet: any): Promise<{ blinkLinks: { verifier: string; link: string }[] }> {
    await delay(300);
    
    try {
      console.log('🔔 Submitting for verification...', { goalId, userWallet });
      
      const { signature, verificationDeadline } = await client.submitForVerification(
        userWallet,
        wallet
      );
      
      console.log('✅ Submitted for verification!', { signature, verificationDeadline });
      
      // Generate blink links for verifiers
      const blinkLinks = VERIFIERS.map((verifier, index) => ({
        verifier: verifier.toBase58(),
        link: `${window.location.origin}/verify?goal=${goalId}&verifier=${index}`
      }));
      
      // Add to feed
      const goal = await client.getGoal(userWallet);
      if (goal) {
        mockFeed.unshift({
          id: `feed-${Date.now()}`,
          type: 'verification_requested',
          username: 'You',
          avatar: '✨',
          message: `requested verification for "${goal.title}"`,
          timestamp: new Date().toISOString(),
          goalId: goal.id,
        });
      }
      
      return { blinkLinks };
    } catch (error) {
      console.error('❌ Error requesting verification:', error);
      throw error;
    }
  },

  /**
   * Cast vote (verifiers only)
   */
  async vote(
    goalId: string, 
    verifierWallet: string, 
    vote: 'yes' | 'no',
    userWallet: string,
    wallet: any
  ): Promise<{ votes: Vote[]; verified: boolean }> {
    await delay(300);
    
    try {
      console.log('🗳️ Casting vote...', { goalId, verifierWallet, vote });
      
      const voteBoolean = vote === 'yes';
      const result = await client.castVote(userWallet, voteBoolean, wallet);
      
      console.log('✅ Vote cast!', result);
      
      // Fetch updated goal
      const goal = await client.getGoal(userWallet);
      if (!goal) {
        throw new Error('Goal not found after voting');
      }
      
      const verified = result.finalized && result.yesVotes >= 2;
      
      return {
        votes: goal.votes,
        verified
      };
    } catch (error) {
      console.error('❌ Error casting vote:', error);
      throw error;
    }
  },

  /**
   * Claim funds after successful verification
   */
  async claimFunds(goalId: string, userWallet: string, wallet: any): Promise<{ txSig: string; success: boolean }> {
    await delay(400);
    
    try {
      console.log('💰 Claiming funds...', { goalId, userWallet });
      
      const { signature, success } = await client.claimOrDistribute(userWallet, wallet);
      
      console.log('✅ Funds claimed/distributed!', { signature, success });
      
      // Add to feed
      const goal = await client.getGoal(userWallet);
      if (goal) {
        mockFeed.unshift({
          id: `feed-${Date.now()}`,
          type: success ? 'goal_completed' : 'goal_failed',
          username: 'You',
          avatar: success ? '🎯' : '🔥',
          message: success 
            ? `successfully completed "${goal.title}" and claimed ${goal.amountSol} SOL!`
            : `failed "${goal.title}" - ${goal.amountSol} SOL ${goal.failAction === 'burn' ? 'sent to burn wallet' : 'sent to company'}`,
          timestamp: new Date().toISOString(),
          goalId: goal.id,
        });
      }
      
      return {
        txSig: signature,
        success
      };
    } catch (error) {
      console.error('❌ Error claiming funds:', error);
      throw error;
    }
  },

  /**
   * Get social feed
   */
  async getFeed(): Promise<FeedItem[]> {
    await delay(100);
    return mockFeed;
  },

  // ============================================================================
  // UTILITY FUNCTIONS (for testing/dev)
  // ============================================================================

  /**
   * Request airdrop (localnet/devnet only)
   */
  async requestAirdrop(publicKey: string, amount: number = 1): Promise<string> {
    try {
      const { PublicKey } = await import('@solana/web3.js');
      const pubkey = new PublicKey(publicKey);
      const signature = await client.airdrop(pubkey, amount);
      console.log('✅ Airdrop successful!', signature);
      return signature;
    } catch (error) {
      console.error('❌ Airdrop failed:', error);
      throw error;
    }
  },

  /**
   * Get wallet balance
   */
  async getBalance(publicKey: string): Promise<number> {
    try {
      const { PublicKey } = await import('@solana/web3.js');
      const pubkey = new PublicKey(publicKey);
      const balance = await client.getBalance(pubkey);
      return balance;
    } catch (error) {
      console.error('❌ Error fetching balance:', error);
      return 0;
    }
  },

  /**
   * Check if wallet is a verifier
   */
  isVerifier(publicKey: string): boolean {
    try {
      const { PublicKey } = require('@solana/web3.js');
      const pubkey = new PublicKey(publicKey);
      return client.isVerifier(pubkey);
    } catch (error) {
      return false;
    }
  }
};  