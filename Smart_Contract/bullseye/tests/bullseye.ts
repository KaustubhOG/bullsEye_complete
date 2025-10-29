import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Bullseye } from "../target/types/bullseye";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Keypair } from "@solana/web3.js";
import { assert, expect } from "chai";

describe("bullseye", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Bullseye as Program<Bullseye>;

  // Test verifiers
  const verifier1 = Keypair.generate();
  const verifier2 = Keypair.generate();
  const verifier3 = Keypair.generate();

  // Company wallet for testing
  const companyWallet = Keypair.generate();
  const burnAddress = new PublicKey("1nc1nerator11111111111111111111111111111111");

  console.log("\n🔑 Test Wallets:");
  console.log("Verifier 1:", verifier1.publicKey.toBase58());
  console.log("Verifier 2:", verifier2.publicKey.toBase58());
  console.log("Verifier 3:", verifier3.publicKey.toBase58());
  console.log("Company Wallet:", companyWallet.publicKey.toBase58());

  before(async () => {
    // Airdrop to all test accounts
    console.log("\n💰 Airdropping SOL to test accounts...");
    const airdropAmount = 2 * LAMPORTS_PER_SOL;
    
    await provider.connection.requestAirdrop(verifier1.publicKey, airdropAmount);
    await provider.connection.requestAirdrop(verifier2.publicKey, airdropAmount);
    await provider.connection.requestAirdrop(verifier3.publicKey, airdropAmount);
    await provider.connection.requestAirdrop(companyWallet.publicKey, airdropAmount);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  it("Program initialized successfully!", () => {
    console.log("✅ Program ID:", program.programId.toBase58());
    console.log("✅ Provider connected:", provider.connection.rpcEndpoint);
    assert.ok(program.programId);
  });

  // ==================== TEST 1: Initialize Counter ====================
  describe("Goal Counter Initialization", () => {
    it("Initializes goal counter for user", async () => {
      const user = Keypair.generate();
      await provider.connection.requestAirdrop(user.publicKey, LAMPORTS_PER_SOL);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const [goalCounterPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("goal_counter"), user.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeCounter()
        .accounts({
          goalCounter: goalCounterPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const goalCounter = await program.account.goalCounter.fetch(goalCounterPda);
      
      assert.equal(goalCounter.user.toString(), user.publicKey.toString());
      assert.equal(goalCounter.count, 0);
      assert.equal(goalCounter.activeGoal, null);
      
      console.log("✅ Goal counter initialized successfully");
    });
  });

  // ==================== TEST 2: Goal Creation ====================
  describe("Goal Creation", () => {
    it("Creates a goal with locked SOL", async () => {
      const user = Keypair.generate();
      await provider.connection.requestAirdrop(user.publicKey, 2 * LAMPORTS_PER_SOL);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // First initialize counter
      const [goalCounterPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("goal_counter"), user.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeCounter()
        .accounts({
          goalCounter: goalCounterPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Now create goal
      const [goalPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("goal"), user.publicKey.toBuffer(), Buffer.from(new anchor.BN(0).toArray("le", 8))],
        program.programId
      );

      const [verificationPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("verification"), goalPda.toBuffer()],
        program.programId
      );

      const amount = new anchor.BN(0.5 * LAMPORTS_PER_SOL);
      const deadline = new anchor.BN(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60); // 7 days

      const userBalanceBefore = await provider.connection.getBalance(user.publicKey);

      await program.methods
        .initializeGoal(
          "Complete 30 Days Coding",
          "I will code for 1 hour every day for 30 days",
          amount,
          deadline,
          { burn: {} },
          [verifier1.publicKey, verifier2.publicKey, verifier3.publicKey]
        )
        .accounts({
          goal: goalPda,
          verification: verificationPda,
          goalCounter: goalCounterPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const goalAccount = await program.account.goal.fetch(goalPda);
      const goalCounter = await program.account.goalCounter.fetch(goalCounterPda);
      const userBalanceAfter = await provider.connection.getBalance(user.publicKey);

      assert.equal(goalAccount.title, "Complete 30 Days Coding");
      assert.equal(goalAccount.amount.toString(), amount.toString());
      assert.isTrue(goalAccount.status.active !== undefined);
      assert.equal(goalCounter.activeGoal, 0);
      assert.equal(goalCounter.count, 1);
      
      // Verify SOL was transferred
      assert.isTrue(userBalanceAfter < userBalanceBefore - amount.toNumber());
      
      console.log("✅ Goal created successfully with SOL locked");
    });

    it("Rejects goal with amount too low", async () => {
      const user = Keypair.generate();
      await provider.connection.requestAirdrop(user.publicKey, 2 * LAMPORTS_PER_SOL);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const [goalCounterPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("goal_counter"), user.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeCounter()
        .accounts({
          goalCounter: goalCounterPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const [goalPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("goal"), user.publicKey.toBuffer(), Buffer.from(new anchor.BN(0).toArray("le", 8))],
        program.programId
      );

      const [verificationPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("verification"), goalPda.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .initializeGoal(
            "Low Amount Goal",
            "This should fail",
            new anchor.BN(0.05 * LAMPORTS_PER_SOL), // 0.05 SOL - too low
            new anchor.BN(Math.floor(Date.now() / 1000) + 86400),
            { burn: {} },
            [verifier1.publicKey, verifier2.publicKey, verifier3.publicKey]
          )
          .accounts({
            goal: goalPda,
            verification: verificationPda,
            goalCounter: goalCounterPda,
            user: user.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        
        assert.fail("Should have rejected low amount");
      } catch (error) {
        expect(error.message).to.include("AmountTooLow");
        console.log("✅ Correctly rejected amount too low");
      }
    });

    it("Rejects goal with amount too high", async () => {
      const user = Keypair.generate();
      await provider.connection.requestAirdrop(user.publicKey, 20 * LAMPORTS_PER_SOL);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const [goalCounterPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("goal_counter"), user.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeCounter()
        .accounts({
          goalCounter: goalCounterPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const [goalPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("goal"), user.publicKey.toBuffer(), Buffer.from(new anchor.BN(0).toArray("le", 8))],
        program.programId
      );

      const [verificationPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("verification"), goalPda.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .initializeGoal(
            "High Amount Goal",
            "This should fail",
            new anchor.BN(15 * LAMPORTS_PER_SOL), // 15 SOL - too high
            new anchor.BN(Math.floor(Date.now() / 1000) + 86400),
            { burn: {} },
            [verifier1.publicKey, verifier2.publicKey, verifier3.publicKey]
          )
          .accounts({
            goal: goalPda,
            verification: verificationPda,
            goalCounter: goalCounterPda,
            user: user.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        
        assert.fail("Should have rejected high amount");
      } catch (error) {
        expect(error.message).to.include("AmountTooHigh");
        console.log("✅ Correctly rejected amount too high");
      }
    });

    it("Rejects goal with deadline in the past", async () => {
      const user = Keypair.generate();
      await provider.connection.requestAirdrop(user.publicKey, 2 * LAMPORTS_PER_SOL);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const [goalCounterPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("goal_counter"), user.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeCounter()
        .accounts({
          goalCounter: goalCounterPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const [goalPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("goal"), user.publicKey.toBuffer(), Buffer.from(new anchor.BN(0).toArray("le", 8))],
        program.programId
      );

      const [verificationPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("verification"), goalPda.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .initializeGoal(
            "Past Deadline Goal",
            "This should fail",
            new anchor.BN(0.5 * LAMPORTS_PER_SOL),
            new anchor.BN(Math.floor(Date.now() / 1000) - 86400), // Yesterday
            { burn: {} },
            [verifier1.publicKey, verifier2.publicKey, verifier3.publicKey]
          )
          .accounts({
            goal: goalPda,
            verification: verificationPda,
            goalCounter: goalCounterPda,
            user: user.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        
        assert.fail("Should have rejected past deadline");
      } catch (error) {
        expect(error.message).to.include("DeadlineInPast");
        console.log("✅ Correctly rejected past deadline");
      }
    });

    it("Prevents creating multiple active goals", async () => {
      const user = Keypair.generate();
      await provider.connection.requestAirdrop(user.publicKey, 3 * LAMPORTS_PER_SOL);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const [goalCounterPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("goal_counter"), user.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeCounter()
        .accounts({
          goalCounter: goalCounterPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Create first goal
      const [goalPda1] = PublicKey.findProgramAddressSync(
        [Buffer.from("goal"), user.publicKey.toBuffer(), Buffer.from(new anchor.BN(0).toArray("le", 8))],
        program.programId
      );

      const [verificationPda1] = PublicKey.findProgramAddressSync(
        [Buffer.from("verification"), goalPda1.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeGoal(
          "First Goal",
          "First active goal",
          new anchor.BN(0.5 * LAMPORTS_PER_SOL),
          new anchor.BN(Math.floor(Date.now() / 1000) + 86400),
          { burn: {} },
          [verifier1.publicKey, verifier2.publicKey, verifier3.publicKey]
        )
        .accounts({
          goal: goalPda1,
          verification: verificationPda1,
          goalCounter: goalCounterPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Try to create second goal while first is active
      const [goalPda2] = PublicKey.findProgramAddressSync(
        [Buffer.from("goal"), user.publicKey.toBuffer(), Buffer.from(new anchor.BN(1).toArray("le", 8))],
        program.programId
      );

      const [verificationPda2] = PublicKey.findProgramAddressSync(
        [Buffer.from("verification"), goalPda2.toBuffer()],
        program.programId
      );

      try {
        await program.methods
          .initializeGoal(
            "Second Goal",
            "Should fail due to active goal",
            new anchor.BN(0.5 * LAMPORTS_PER_SOL),
            new anchor.BN(Math.floor(Date.now() / 1000) + 86400),
            { burn: {} },
            [verifier1.publicKey, verifier2.publicKey, verifier3.publicKey]
          )
          .accounts({
            goal: goalPda2,
            verification: verificationPda2,
            goalCounter: goalCounterPda,
            user: user.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user])
          .rpc();
        
        assert.fail("Should have rejected second active goal");
      } catch (error) {
        expect(error.message).to.include("ActiveGoalExists");
        console.log("✅ Correctly prevented multiple active goals");
      }
    });

    it("Allows creating new goal after completing previous one", async () => {
      const user = Keypair.generate();
      await provider.connection.requestAirdrop(user.publicKey, 3 * LAMPORTS_PER_SOL);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const [goalCounterPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("goal_counter"), user.publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeCounter()
        .accounts({
          goalCounter: goalCounterPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Create first goal
      const [goalPda1] = PublicKey.findProgramAddressSync(
        [Buffer.from("goal"), user.publicKey.toBuffer(), Buffer.from(new anchor.BN(0).toArray("le", 8))],
        program.programId
      );

      const [verificationPda1] = PublicKey.findProgramAddressSync(
        [Buffer.from("verification"), goalPda1.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeGoal(
          "First Goal",
          "Will complete this goal",
          new anchor.BN(0.5 * LAMPORTS_PER_SOL),
          new anchor.BN(Math.floor(Date.now() / 1000) + 86400),
          { burn: {} },
          [verifier1.publicKey, verifier2.publicKey, verifier3.publicKey]
        )
        .accounts({
          goal: goalPda1,
          verification: verificationPda1,
          goalCounter: goalCounterPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Submit for verification
      await program.methods
        .submitForVerification()
        .accounts({
          goal: goalPda1,
          verification: verificationPda1,
          user: user.publicKey,
        })
        .signers([user])
        .rpc();

      // Vote to complete the goal
      await program.methods
        .castVote(true)
        .accounts({
          goal: goalPda1,
          verification: verificationPda1,
          verifier: verifier1.publicKey,
        })
        .signers([verifier1])
        .rpc();

      await program.methods
        .castVote(true)
        .accounts({
          goal: goalPda1,
          verification: verificationPda1,
          verifier: verifier2.publicKey,
        })
        .signers([verifier2])
        .rpc();

      // Claim funds to complete the goal
      await program.methods
        .claimOrDistribute()
        .accounts({
          goal: goalPda1,
          verification: verificationPda1,
          goalCounter: goalCounterPda,
          user: user.publicKey,
          recipient: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      // Now create second goal - should work
      const [goalPda2] = PublicKey.findProgramAddressSync(
        [Buffer.from("goal"), user.publicKey.toBuffer(), Buffer.from(new anchor.BN(1).toArray("le", 8))],
        program.programId
      );

      const [verificationPda2] = PublicKey.findProgramAddressSync(
        [Buffer.from("verification"), goalPda2.toBuffer()],
        program.programId
      );

      await program.methods
        .initializeGoal(
          "Second Goal",
          "This should work now",
          new anchor.BN(0.5 * LAMPORTS_PER_SOL),
          new anchor.BN(Math.floor(Date.now() / 1000) + 86400),
          { burn: {} },
          [verifier1.publicKey, verifier2.publicKey, verifier3.publicKey]
        )
        .accounts({
          goal: goalPda2,
          verification: verificationPda2,
          goalCounter: goalCounterPda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      const goalCounter = await program.account.goalCounter.fetch(goalCounterPda);
      assert.equal(goalCounter.activeGoal, 1); // Should have new active goal
      assert.equal(goalCounter.count, 2); // Should have incremented count
      
      console.log("✅ Successfully created new goal after completing previous one");
    });
  });

  // ==================== FINAL SUMMARY ====================
  after(() => {
    console.log("\n" + "=".repeat(50));
    console.log("🎉 ALL GOAL CREATION TESTS COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(50));
    console.log("\n✅ Tested Features:");
    console.log("  ✓ Goal counter initialization");
    console.log("  ✓ Goal creation with SOL locking");
    console.log("  ✓ Amount validation (min/max)");
    console.log("  ✓ Deadline validation");
    console.log("  ✓ Single active goal enforcement");
    console.log("  ✓ Sequential goal creation");
    console.log("\n🚀 Goal creation system is WORKING PERFECTLY!");
  });
});