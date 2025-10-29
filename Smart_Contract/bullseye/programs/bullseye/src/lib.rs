use anchor_lang::prelude::*;

mod instructions;
mod state;
mod errors;

use instructions::*;
use state::*;

declare_id!("8ubScEZp4RR513qc6pNYgfVbRjTPiAuhqJvN2h4ueaRU");

#[program]
pub mod bullseye {
    use super::*;

    /// Initialize the goal counter for a user (one-time setup)
    pub fn initialize_counter(ctx: Context<InitializeCounter>) -> Result<()> {
        instructions::initialize_counter(ctx)
    }

    /// Initialize a new goal with locked SOL
    pub fn initialize_goal(
        ctx: Context<InitializeGoal>,
        title: String,
        description: String,
        amount: u64,
        deadline: i64,
        fail_action: FailAction,
        verifiers: [Pubkey; 3],
    ) -> Result<()> {
        instructions::initialize_goal(ctx, title, description, amount, deadline, fail_action, verifiers)
    }

    /// Submit goal for verification
    pub fn submit_for_verification(ctx: Context<SubmitForVerification>) -> Result<()> {
        instructions::submit_for_verification(ctx)
    }

    /// Cast vote (only callable by verifiers)
    pub fn cast_vote(ctx: Context<CastVote>, vote: bool) -> Result<()> {
        instructions::cast_vote(ctx, vote)
    }

    /// Finalize verification after deadline
    pub fn finalize_verification(ctx: Context<FinalizeVerification>) -> Result<()> {
        instructions::finalize_verification(ctx)
    }

    /// Claim funds or distribute based on result
    pub fn claim_or_distribute(ctx: Context<ClaimOrDistribute>) -> Result<()> {
        instructions::claim_or_distribute(ctx)
    }
}