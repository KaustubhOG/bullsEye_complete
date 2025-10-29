use anchor_lang::prelude::*;

// ============================================================================
// Errors
// ============================================================================

#[error_code]
pub enum ErrorCode {
    #[msg("Title must be 100 characters or less")]
    TitleTooLong,
    #[msg("Description must be 500 characters or less")]
    DescriptionTooLong,
    #[msg("Amount must be at least 0.1 SOL")]
    AmountTooLow,
    #[msg("Amount must be at most 10 SOL")]
    AmountTooHigh,
    #[msg("Deadline must be in the future")]
    DeadlineInPast,
    #[msg("Invalid goal status for this operation")]
    InvalidGoalStatus,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Not a registered verifier")]
    NotAVerifier,
    #[msg("Already voted")]
    AlreadyVoted,
    #[msg("Verification already finalized")]
    AlreadyFinalized,
    #[msg("Verification not complete yet")]
    VerificationNotComplete,
    #[msg("Verification not finalized")]
    VerificationNotFinalized,
    #[msg("No verification result available")]
    NoVerificationResult,
    #[msg("User already has an active goal. Complete it before creating a new one.")]
    ActiveGoalExists,
}