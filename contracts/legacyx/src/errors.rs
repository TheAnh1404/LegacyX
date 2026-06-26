use soroban_sdk::contracterror;

/// Custom contract errors for LegacyX.
#[contracterror]
#[derive(Copy, Clone, Debug, PartialEq)]
#[repr(u32)]
pub enum ContractError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    WillNotFound = 3,
    InvalidAmount = 4,
    InvalidUnlockTime = 5,
    InvalidHeartbeatInterval = 6,
    InvalidBeneficiary = 7,
    Unauthorized = 8,
    WillNotActive = 9,
    UnlockTimeNotReached = 10,
    AlreadyClaimed = 11,
    AlreadyCancelled = 12,
}
