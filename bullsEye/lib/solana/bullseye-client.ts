import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  SendTransactionError,
} from "@solana/web3.js";
import IDL from "./idl/bullseye.json";
import {
  PROGRAM_ID,
  VERIFIERS,
  BURN_ADDRESS,
  COMPANY_WALLET,
  getConnection,
  solToLamports,
  lamportsToSol,
  NETWORK,
} from "./config";
import {
  deriveGoalPda,
  deriveVerificationPda,
  deriveGoalCounterPda,
  convertGoalAccountToGoal,
  validateGoalData,
  parseAnchorError,
} from "./utils";
import type {
  Goal,
  GoalAccount,
  VerificationAccount,
  CreateGoalData,
  TransactionResult,
  Vote,
} from "./types";

/**
 * BullseyeClient - Main client for interacting with BullsEye smart contract
 */
export class BullseyeClient {
  private connection: Connection;
  private program: Program<Bullseye> | null = null;
  private provider: AnchorProvider | null = null;
  private recentTransactions = new Set<string>();

  constructor(connection?: Connection) {
    this.connection = connection || getConnection();
  }

  /**
   * Initialize the Anchor program with wallet
   */
  private async initializeProgram(wallet: any): Promise<Program<Bullseye>> {
    if (this.program && this.provider?.wallet === wallet) {
      return this.program;
    }

    this.provider = new AnchorProvider(this.connection, wallet, {
      commitment: "confirmed",
    });

    this.program = new Program(IDL as any, this.provider) as Program<any>;

    return this.program;
  }

  /**
   * Send transaction with retry and deduplication logic
   */
  private async sendTransactionWithRetry(
    method: any,
    maxRetries: number = 3
  ): Promise<string> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const tx = await method.rpc({ skipPreflight: true });
        
        // Check if this is a duplicate
        if (this.recentTransactions.has(tx)) {
          console.warn('⚠️ Duplicate transaction detected:', tx);
          throw new Error('Transaction already processed');
        }
        
        this.recentTransactions.add(tx);
        // Clean up old transactions after 30 seconds
        setTimeout(() => {
          this.recentTransactions.delete(tx);
        }, 30000);
        
        return tx;
      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ Transaction attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    throw lastError;
  }

  // ============================================================================
  // GOAL COUNTER MANAGEMENT (NEW)
  // ============================================================================

  /**
   * Initialize goal counter for user (must be called before first goal)
   */
  async initializeGoalCounter(wallet: any): Promise<string> {
    try {
      const program = await this.initializeProgram(wallet);
      const userPubkey = wallet.publicKey;

      const [goalCounterPda] = deriveGoalCounterPda(userPubkey);

      const tx = await this.sendTransactionWithRetry(
        program.methods
          .initializeCounter()
          .accounts({
            goalCounter: goalCounterPda,
            user: userPubkey,
            systemProgram: SystemProgram.programId,
          })
      );

      console.log("✅ Goal counter initialized! TX:", tx);
      return tx;
    } catch (error) {
      console.error("❌ Error initializing goal counter:", error);
      throw new Error(parseAnchorError(error));
    }
  }

  /**
   * Check if user has goal counter initialized
   */
  async hasGoalCounter(userPubkey: PublicKey): Promise<boolean> {
    try {
      const [goalCounterPda] = deriveGoalCounterPda(userPubkey);
      
      // Create dummy wallet for read-only
      const dummyWallet = {
        publicKey: userPubkey,
        signTransaction: async (tx: Transaction) => tx,
        signAllTransactions: async (txs: Transaction[]) => txs,
      };

      const program = await this.initializeProgram(dummyWallet);
      const goalCounter = await program.account.goalCounter.fetchNullable(goalCounterPda);
      
      return goalCounter !== null;
    } catch (error) {
      console.error("Error checking goal counter:", error);
      return false;
    }
  }

  /**
   * Check if user has active goal
   */
  async hasActiveGoal(userPubkey: PublicKey): Promise<boolean> {
    try {
      const [goalCounterPda] = deriveGoalCounterPda(userPubkey);
      
      const dummyWallet = {
        publicKey: userPubkey,
        signTransaction: async (tx: Transaction) => tx,
        signAllTransactions: async (txs: Transaction[]) => txs,
      };

      const program = await this.initializeProgram(dummyWallet);
      const goalCounter = await program.account.goalCounter.fetchNullable(goalCounterPda);
      
      if (!goalCounter) return false;
      
      // Check if there's an active goal
      return goalCounter.activeGoal !== null;
    } catch (error) {
      console.error("Error checking active goal:", error);
      return false;
    }
  }

  /**
   * Get user's goal counter data
   */
  async getGoalCounter(userPubkey: PublicKey): Promise<{ count: number; activeGoal: number | null } | null> {
    try {
      const [goalCounterPda] = deriveGoalCounterPda(userPubkey);
      
      const dummyWallet = {
        publicKey: userPubkey,
        signTransaction: async (tx: Transaction) => tx,
        signAllTransactions: async (txs: Transaction[]) => txs,
      };

      const program = await this.initializeProgram(dummyWallet);
      const goalCounter = await program.account.goalCounter.fetchNullable(goalCounterPda);
      
      if (!goalCounter) return null;
      
      return {
        count: goalCounter.count.toNumber(),
        activeGoal: goalCounter.activeGoal ? goalCounter.activeGoal.toNumber() : null
      };
    } catch (error) {
      console.error("Error fetching goal counter:", error);
      return null;
    }
  }

  // ============================================================================
  // GOAL MANAGEMENT
  // ============================================================================

  /**
   * Create a new goal and lock SOL
   */
  async createGoal(
    data: CreateGoalData,
    wallet: any
  ): Promise<{ goal: Goal; signature: string }> {
    try {
      // Validate data
      const validation = validateGoalData(data);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const program = await this.initializeProgram(wallet);
      const userPubkey = wallet.publicKey;

      // Check if goal counter exists, if not initialize it
      const hasCounter = await this.hasGoalCounter(userPubkey);
      if (!hasCounter) {
        console.log("🆕 Initializing goal counter for new user...");
        await this.initializeGoalCounter(wallet);
      }

      // Check if user already has active goal
      const hasActive = await this.hasActiveGoal(userPubkey);
      if (hasActive) {
        throw new Error("You already have an active goal. Complete it before creating a new one.");
      }

      // Get goal counter to determine goal number
      const goalCounter = await this.getGoalCounter(userPubkey);
      if (!goalCounter) {
        throw new Error("Failed to initialize goal counter");
      }

      const goalNumber = goalCounter.count;

      // Derive PDAs (NOW INCLUDES GOAL COUNTER)
      const [goalCounterPda] = deriveGoalCounterPda(userPubkey);
      const [goalPda] = deriveGoalPda(userPubkey, goalNumber);
      const [verificationPda] = deriveVerificationPda(goalPda);

      // Convert data
      const amount = new BN(solToLamports(data.amountSol));
      const deadline = new BN(
        Math.floor(new Date(data.deadline).getTime() / 1000)
      );
      const failAction =
        data.failDestination === "burn" ? { burn: {} } : { companyWallet: {} };

      console.log("🚀 Creating goal with:", {
        goalNumber,
        amount: data.amountSol,
        deadline: data.deadline,
        goalPda: goalPda.toBase58()
      });

      // Send transaction with retry logic
      let tx: string;
      try {
        tx = await this.sendTransactionWithRetry(
          program.methods
            .initializeGoal(
              data.title,
              data.description,
              amount,
              deadline,
              failAction,
              VERIFIERS
            )
            .accounts({
              goal: goalPda,
              verification: verificationPda,
              goalCounter: goalCounterPda,
              user: userPubkey,
              systemProgram: SystemProgram.programId,
            })
        );
      } catch (txError: any) {
        console.error("❌ Transaction error:", txError);
        
        // Handle specific transaction errors
        if (txError instanceof SendTransactionError) {
          const logs = txError.logs || [];
          console.error("Transaction logs:", logs);
          
          if (txError.message.includes("already been processed")) {
            throw new Error("Transaction already processed. Please check your wallet for confirmation.");
          }
          
          if (logs.some(log => log.includes("insufficient funds"))) {
            throw new Error("Insufficient SOL balance for transaction");
          }
          
          if (logs.some(log => log.includes("ActiveGoalExists"))) {
            throw new Error("You already have an active goal. Complete it before creating a new one.");
          }
        }
        
        throw txError;
      }

      console.log("✅ Goal created! TX:", tx);

      // Wait a moment for the transaction to be confirmed
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fetch the created goal with retry logic
      let goal: Goal | null = null;
      let retries = 0;
      const maxRetries = 5;
      
      while (!goal && retries < maxRetries) {
        try {
          goal = await this.getGoal(userPubkey.toBase58());
          if (!goal) {
            console.log(`🔄 Goal not found yet, retrying... (${retries + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries++;
          }
        } catch (fetchError) {
          console.error(`❌ Error fetching goal (attempt ${retries + 1}):`, fetchError);
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!goal) {
        console.warn("⚠️ Goal not found after creation, but transaction succeeded. TX:", tx);
        // Create a temporary goal object with basic info
        goal = {
          id: goalPda.toBase58(),
          publicKey: goalPda.toBase58(),
          user: userPubkey.toBase58(),
          title: data.title,
          description: data.description,
          amountSol: data.amountSol,
          deadline: data.deadline,
          failAction: data.failDestination === 'burn' ? 'burn' : 'company',
          status: 'active',
          createdAt: new Date().toISOString(),
          votes: [],
          yesVotes: 0,
          noVotes: 0,
          requiredVotes: 2,
          finalized: false,
          ownerWallet: userPubkey.toBase58(),
          verificationType: 'strangers'
        } as Goal;
      }

      return { goal, signature: tx };
    } catch (error) {
      console.error("❌ Error creating goal:", error);
      throw new Error(parseAnchorError(error));
    }
  }

  /**
   * Get a specific goal by user's wallet address
   * UPDATED: Now uses goal counter to find active goal
   */
  async getGoal(userWallet: string): Promise<Goal | null> {
    try {
      const userPubkey = new PublicKey(userWallet);
      
      // Get goal counter to find active goal number
      const goalCounter = await this.getGoalCounter(userPubkey);
      if (!goalCounter || goalCounter.activeGoal === null) {
        console.log(`ℹ️ No active goal found for wallet: ${userWallet}`);
        return null;
      }

      const goalNumber = goalCounter.activeGoal;
      const [goalPda] = deriveGoalPda(userPubkey, goalNumber);
      const [verificationPda] = deriveVerificationPda(goalPda);

      // Create a dummy wallet for read-only operations
      const dummyWallet = {
        publicKey: userPubkey,
        signTransaction: async (tx: Transaction) => tx,
        signAllTransactions: async (txs: Transaction[]) => txs,
      };

      const program = await this.initializeProgram(dummyWallet);

      // Fetch accounts - use fetchNullable to handle non-existent accounts
      const goalAccount = await program.account.goal.fetchNullable(goalPda);
      
      if (!goalAccount) {
        console.log(`ℹ️ Goal account not found for PDA: ${goalPda.toBase58()}`);
        return null;
      }

      const verificationAccount = await program.account.verification.fetchNullable(
        verificationPda
      );

      if (!verificationAccount) {
        console.log(`⚠️ Goal exists but verification account missing for: ${goalPda.toBase58()}`);
        return null;
      }

      // Convert to frontend format
      const goal = convertGoalAccountToGoal(
        goalAccount as unknown as GoalAccount,
        verificationAccount as unknown as VerificationAccount,
        goalPda
      );

      return goal;
    } catch (error) {
      console.error("Error fetching goal:", error);
      return null;
    }
  }

  /**
   * Get all goals (for feed/discovery)
   * UPDATED: Now iterates through all possible goal numbers
   */
  async getAllGoals(): Promise<Goal[]> {
    try {
      // Create a dummy wallet for read-only operations
      const dummyKeypair = anchor.web3.Keypair.generate();
      const dummyWallet = {
        publicKey: dummyKeypair.publicKey,
        signTransaction: async (tx: Transaction) => tx,
        signAllTransactions: async (txs: Transaction[]) => txs,
      };

      const program = await this.initializeProgram(dummyWallet);

      // Fetch all goal accounts (this will get all goals across all users)
      const goalAccounts = await program.account.goal.all();

      const goals: Goal[] = [];

      for (const accountInfo of goalAccounts) {
        try {
          const goalPda = accountInfo.publicKey;
          const goalAccount = accountInfo.account as unknown as GoalAccount;
          const [verificationPda] = deriveVerificationPda(goalPda);

          // Use fetchNullable here too for safety
          const verificationAccount = await program.account.verification.fetchNullable(
            verificationPda
          );

          if (!verificationAccount) {
            console.log(`⚠️ Skipping goal ${goalPda.toBase58()} - missing verification account`);
            continue;
          }

          const goal = convertGoalAccountToGoal(
            goalAccount,
            verificationAccount as unknown as VerificationAccount,
            goalPda
          );
          goals.push(goal);
        } catch (error) {
          console.error("Error processing goal:", error);
        }
      }

      return goals;
    } catch (error) {
      console.error("Error fetching all goals:", error);
      return [];
    }
  }

  // ============================================================================
  // VERIFICATION
  // ============================================================================

  /**
   * Submit goal for verification
   */
  async submitForVerification(
    userWallet: string,
    wallet: any
  ): Promise<{ signature: string; verificationDeadline: Date }> {
    try {
      const program = await this.initializeProgram(wallet);
      const userPubkey = new PublicKey(userWallet);

      // Get active goal PDA
      const goalCounter = await this.getGoalCounter(userPubkey);
      if (!goalCounter || goalCounter.activeGoal === null) {
        throw new Error("No active goal found");
      }

      const [goalPda] = deriveGoalPda(userPubkey, goalCounter.activeGoal);
      const [verificationPda] = deriveVerificationPda(goalPda);

      const tx = await this.sendTransactionWithRetry(
        program.methods
          .submitForVerification()
          .accounts({
            goal: goalPda,
            verification: verificationPda,
            user: wallet.publicKey,
          })
      );

      console.log("✅ Submitted for verification! TX:", tx);

      // Calculate verification deadline (24 hours from now)
      const verificationDeadline = new Date(Date.now() + 86400 * 1000);

      return { signature: tx, verificationDeadline };
    } catch (error) {
      console.error("❌ Error submitting for verification:", error);
      throw new Error(parseAnchorError(error));
    }
  }

  /**
   * Cast vote (verifiers only)
   */
  async castVote(
    userWallet: string,
    vote: boolean,
    wallet: any
  ): Promise<{
    signature: string;
    yesVotes: number;
    noVotes: number;
    finalized: boolean;
  }> {
    try {
      const program = await this.initializeProgram(wallet);
      const userPubkey = new PublicKey(userWallet);

      // Get active goal PDA
      const goalCounter = await this.getGoalCounter(userPubkey);
      if (!goalCounter || goalCounter.activeGoal === null) {
        throw new Error("No active goal found");
      }

      const [goalPda] = deriveGoalPda(userPubkey, goalCounter.activeGoal);
      const [verificationPda] = deriveVerificationPda(goalPda);

      const tx = await this.sendTransactionWithRetry(
        program.methods
          .castVote(vote)
          .accounts({
            goal: goalPda,
            verification: verificationPda,
            verifier: wallet.publicKey,
          })
      );

      console.log("✅ Vote cast! TX:", tx);

      // Fetch updated verification
      const verificationAccount = (await program.account.verification.fetch(
        verificationPda
      )) as unknown as VerificationAccount;

      return {
        signature: tx,
        yesVotes: verificationAccount.yesVotes,
        noVotes: verificationAccount.noVotes,
        finalized: verificationAccount.finalized,
      };
    } catch (error) {
      console.error("❌ Error casting vote:", error);
      throw new Error(parseAnchorError(error));
    }
  }

  // ============================================================================
  // CLAIM/DISTRIBUTE
  // ============================================================================

  /**
   * Claim funds (on success) or distribute (on failure)
   */
  async claimOrDistribute(
    userWallet: string,
    wallet: any
  ): Promise<{ signature: string; success: boolean }> {
    try {
      const program = await this.initializeProgram(wallet);
      const userPubkey = new PublicKey(userWallet);

      // Get active goal PDA
      const goalCounter = await this.getGoalCounter(userPubkey);
      if (!goalCounter || goalCounter.activeGoal === null) {
        throw new Error("No active goal found");
      }

      const [goalPda] = deriveGoalPda(userPubkey, goalCounter.activeGoal);
      const [verificationPda] = deriveVerificationPda(goalPda);
      const [goalCounterPda] = deriveGoalCounterPda(userPubkey);

      // Fetch goal to determine recipient
      const goalAccount = (await program.account.goal.fetch(
        goalPda
      )) as unknown as GoalAccount;
      const verificationAccount = (await program.account.verification.fetch(
        verificationPda
      )) as unknown as VerificationAccount;

      // Determine recipient based on verification result and fail action
      let recipient: PublicKey;
      const isSuccess =
        verificationAccount.result && "success" in verificationAccount.result;

      if (isSuccess) {
        recipient = userPubkey; // User gets funds back
      } else {
        // Failure - check fail action
        if ("burn" in goalAccount.failAction) {
          recipient = BURN_ADDRESS;
        } else {
          recipient = COMPANY_WALLET;
        }
      }

      const tx = await this.sendTransactionWithRetry(
        program.methods
          .claimOrDistribute()
          .accounts({
            goal: goalPda,
            verification: verificationPda,
            goalCounter: goalCounterPda,
            user: wallet.publicKey,
            recipient: recipient,
            systemProgram: SystemProgram.programId,
          })
      );

      console.log("✅ Funds distributed! TX:", tx);

      return { signature: tx, success: isSuccess || false };
    } catch (error) {
      console.error("❌ Error claiming/distributing:", error);
      throw new Error(parseAnchorError(error));
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Airdrop SOL (for testing on localnet/devnet)
   */
  async airdrop(publicKey: PublicKey, amount: number = 1): Promise<string> {
    try {
      if (NETWORK === "mainnet-beta") {
        throw new Error("Airdrop not available on mainnet");
      }

      const signature = await this.connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );

      await this.connection.confirmTransaction(signature);
      console.log("✅ Airdrop successful!", signature);

      return signature;
    } catch (error) {
      console.error("❌ Airdrop failed:", error);
      throw error;
    }
  }

  /**
   * Get SOL balance
   */
  async getBalance(publicKey: PublicKey): Promise<number> {
    const balance = await this.connection.getBalance(publicKey);
    return lamportsToSol(balance);
  }

  /**
   * Check if wallet is a verifier
   */
  isVerifier(publicKey: PublicKey): boolean {
    return VERIFIERS.some((v) => v.equals(publicKey));
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let clientInstance: BullseyeClient | null = null;

/**
 * Get singleton instance of BullseyeClient
 */
export function getBullseyeClient(): BullseyeClient {
  if (!clientInstance) {
    clientInstance = new BullseyeClient();
  }
  return clientInstance;
}

export default BullseyeClient;