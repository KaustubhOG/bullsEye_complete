use anchor_lang::prelude::*;

// ============================================================================
// Data Structures
// ============================================================================

#[account]
#[derive(InitSpace)]
pub struct Goal {
    pub user: Pubkey,
    #[max_len(100)]
    pub title: String,
    #[max_len(500)]
    pub description: String,
    pub amount: u64,
    pub deadline: i64,
    pub fail_action: FailAction,
    pub status: GoalStatus,
    pub verification: Pubkey,
    pub created_at: i64,
    pub goal_number: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct GoalCounter {
    pub user: Pubkey,
    pub count: u64,              // Total goals created (increments forever)
    pub active_goal: Option<u64>, 
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Verification {
    pub goal: Pubkey,
    pub verifiers: [Pubkey; 3],
    pub yes_votes: u8,
    pub no_votes: u8,
    pub votes_cast: [bool; 3],
    pub finalized: bool,
    pub result: Option<VerificationResult>,
    pub verification_deadline: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum FailAction {
    Burn,
    CompanyWallet,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum GoalStatus {
    Active,
    Submitted,
    Claimed,
    Failed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum VerificationResult {
    Success,
    Failure,
}

// ============================================================================
// Events
// ============================================================================

#[event]
pub struct GoalCreated {
    pub goal: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub deadline: i64,
    pub goal_number: u64,
}

#[event]
pub struct GoalSubmitted {
    pub goal: Pubkey,
    pub verification_deadline: i64,
}

#[event]
pub struct VoteCast {
    pub goal: Pubkey,
    pub verifier: Pubkey,
    pub vote: bool,
    pub yes_votes: u8,
    pub no_votes: u8,
}

#[event]
pub struct VerificationFinalized {
    pub goal: Pubkey,
    pub result: VerificationResult,
}

#[event]
pub struct FundsClaimed {
    pub goal: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
}

#[event]
pub struct FundsBurned {
    pub goal: Pubkey,
    pub amount: u64,
}

#[event]
pub struct FundsSentToCompany {
    pub goal: Pubkey,
    pub amount: u64,
    pub recipient: Pubkey,
}