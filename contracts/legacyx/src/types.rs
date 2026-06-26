use soroban_sdk::{contracttype, Address};

/// Status of a smart will.
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum WillStatus {
    Active,
    Claimed,
    Cancelled,
}

/// On-chain representation of a digital inheritance will.
#[contracttype]
#[derive(Clone, Debug)]
pub struct Will {
    pub id: u64,
    pub owner: Address,
    pub beneficiary: Address,
    pub asset: Address,
    pub amount: i128,
    pub unlock_time: u64,
    pub heartbeat_interval: u64,
    pub last_heartbeat: u64,
    pub status: WillStatus,
}

/// Storage keys for the contract.
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    WillCounter,
    Will(u64),
}
