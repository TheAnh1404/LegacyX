use soroban_sdk::{contract, contractimpl, Address, Env};
use soroban_sdk::token::TokenClient;

use crate::errors::ContractError;
use crate::events;
use crate::storage;
use crate::types::{Will, WillStatus};

#[contract]
pub struct LegacyXContract;

#[contractimpl]
impl LegacyXContract {
    /// Initialize the contract with an admin. Can only be called once.
    pub fn initialize(env: Env, admin: Address) -> Result<(), ContractError> {
        if storage::has_admin(&env) {
            return Err(ContractError::AlreadyInitialized);
        }

        admin.require_auth();
        storage::set_admin(&env, &admin);
        storage::extend_instance_ttl(&env);

        Ok(())
    }

    /// Create a new inheritance will, transferring tokens from owner to this contract.
    pub fn create_will(
        env: Env,
        owner: Address,
        beneficiary: Address,
        asset: Address,
        amount: i128,
        unlock_time: u64,
        heartbeat_interval: u64,
    ) -> Result<u64, ContractError> {
        if !storage::has_admin(&env) {
            return Err(ContractError::NotInitialized);
        }

        owner.require_auth();

        if amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }

        if beneficiary == owner {
            return Err(ContractError::InvalidBeneficiary);
        }

        let current_time = env.ledger().timestamp();

        if unlock_time <= current_time {
            return Err(ContractError::InvalidUnlockTime);
        }

        if heartbeat_interval == 0 {
            return Err(ContractError::InvalidHeartbeatInterval);
        }

        // Transfer tokens from owner to this contract
        let contract_address = env.current_contract_address();
        let token = TokenClient::new(&env, &asset);
        token.transfer(&owner, &contract_address, &amount);

        // Create the will
        let will_id = storage::increment_will_counter(&env);

        let will = Will {
            id: will_id,
            owner: owner.clone(),
            beneficiary: beneficiary.clone(),
            asset: asset.clone(),
            amount,
            unlock_time,
            heartbeat_interval,
            last_heartbeat: current_time,
            status: WillStatus::Active,
        };

        storage::set_will(&env, &will);
        storage::extend_instance_ttl(&env);

        events::will_created(&env, will_id, &owner, &beneficiary, amount, unlock_time);

        Ok(will_id)
    }

    /// Owner confirms they are alive, extending the unlock time.
    pub fn heartbeat(
        env: Env,
        owner: Address,
        will_id: u64,
    ) -> Result<(), ContractError> {
        owner.require_auth();

        let mut will = storage::get_will(&env, will_id)
            .ok_or(ContractError::WillNotFound)?;

        if will.owner != owner {
            return Err(ContractError::Unauthorized);
        }

        if will.status != WillStatus::Active {
            return Err(ContractError::WillNotActive);
        }

        let current_time = env.ledger().timestamp();
        will.last_heartbeat = current_time;
        will.unlock_time = current_time + will.heartbeat_interval;

        storage::set_will(&env, &will);
        storage::extend_instance_ttl(&env);

        events::heartbeat_sent(&env, will_id, &owner, will.unlock_time);

        Ok(())
    }

    /// Beneficiary claims inheritance after unlock time has passed.
    pub fn claim_inheritance(
        env: Env,
        beneficiary: Address,
        will_id: u64,
    ) -> Result<(), ContractError> {
        beneficiary.require_auth();

        let mut will = storage::get_will(&env, will_id)
            .ok_or(ContractError::WillNotFound)?;

        if will.beneficiary != beneficiary {
            return Err(ContractError::Unauthorized);
        }

        if will.status != WillStatus::Active {
            if will.status == WillStatus::Claimed {
                return Err(ContractError::AlreadyClaimed);
            }
            return Err(ContractError::WillNotActive);
        }

        let current_time = env.ledger().timestamp();
        if current_time < will.unlock_time {
            return Err(ContractError::UnlockTimeNotReached);
        }

        // Transfer tokens from contract to beneficiary
        let contract_address = env.current_contract_address();
        let token = TokenClient::new(&env, &will.asset);
        token.transfer(&contract_address, &beneficiary, &will.amount);

        will.status = WillStatus::Claimed;
        storage::set_will(&env, &will);
        storage::extend_instance_ttl(&env);

        events::inheritance_claimed(&env, will_id, &beneficiary, will.amount);

        Ok(())
    }

    /// Owner cancels an active will, returning locked tokens.
    pub fn cancel_will(
        env: Env,
        owner: Address,
        will_id: u64,
    ) -> Result<(), ContractError> {
        owner.require_auth();

        let mut will = storage::get_will(&env, will_id)
            .ok_or(ContractError::WillNotFound)?;

        if will.owner != owner {
            return Err(ContractError::Unauthorized);
        }

        if will.status != WillStatus::Active {
            if will.status == WillStatus::Cancelled {
                return Err(ContractError::AlreadyCancelled);
            }
            return Err(ContractError::WillNotActive);
        }

        // Transfer tokens from contract back to owner
        let contract_address = env.current_contract_address();
        let token = TokenClient::new(&env, &will.asset);
        token.transfer(&contract_address, &owner, &will.amount);

        will.status = WillStatus::Cancelled;
        storage::set_will(&env, &will);
        storage::extend_instance_ttl(&env);

        events::will_cancelled(&env, will_id, &owner, will.amount);

        Ok(())
    }

    /// Owner changes the beneficiary of an active will.
    pub fn change_beneficiary(
        env: Env,
        owner: Address,
        will_id: u64,
        new_beneficiary: Address,
    ) -> Result<(), ContractError> {
        owner.require_auth();

        let mut will = storage::get_will(&env, will_id)
            .ok_or(ContractError::WillNotFound)?;

        if will.owner != owner {
            return Err(ContractError::Unauthorized);
        }

        if will.status != WillStatus::Active {
            return Err(ContractError::WillNotActive);
        }

        if new_beneficiary == owner {
            return Err(ContractError::InvalidBeneficiary);
        }

        let old_beneficiary = will.beneficiary.clone();
        will.beneficiary = new_beneficiary.clone();

        storage::set_will(&env, &will);
        storage::extend_instance_ttl(&env);

        events::beneficiary_changed(&env, will_id, &old_beneficiary, &new_beneficiary);

        Ok(())
    }

    /// Read a will by ID.
    pub fn get_will(env: Env, will_id: u64) -> Result<Will, ContractError> {
        storage::get_will(&env, will_id).ok_or(ContractError::WillNotFound)
    }

    /// Get the total number of wills created.
    pub fn get_will_count(env: Env) -> u64 {
        storage::get_will_counter(&env)
    }
}
