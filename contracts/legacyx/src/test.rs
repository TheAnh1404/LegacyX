#![cfg(test)]

use soroban_sdk::{
    testutils::{Address as _, Ledger, LedgerInfo},
    token::{StellarAssetClient, TokenClient},
    Address, Env,
};

use crate::contract::{LegacyXContract, LegacyXContractClient};
use crate::errors::ContractError;
use crate::types::WillStatus;

/// Helper to set up the test environment with a deployed contract and a SAC token.
fn setup_test() -> (Env, LegacyXContractClient<'static>, Address, Address, Address, Address) {
    let env = Env::default();
    env.mock_all_auths();

    // Set initial ledger timestamp
    env.ledger().set(LedgerInfo {
        timestamp: 1_000_000,
        protocol_version: 22,
        sequence_number: 100,
        network_id: Default::default(),
        base_reserve: 10,
        min_temp_entry_ttl: 100,
        min_persistent_entry_ttl: 100,
        max_entry_ttl: 10_000_000,
    });

    let contract_id = env.register(LegacyXContract, ());
    let client = LegacyXContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let owner = Address::generate(&env);
    let beneficiary = Address::generate(&env);

    // Create a Stellar Asset Contract token
    let token_admin = Address::generate(&env);
    let token_contract = env.register_stellar_asset_contract_v2(token_admin.clone());
    let token_address = token_contract.address();

    // Mint tokens to owner
    let sac_client = StellarAssetClient::new(&env, &token_address);
    sac_client.mint(&owner, &100_000_0000000); // 100,000 tokens (7 decimals)

    (env, client, admin, owner, beneficiary, token_address)
}

// ==================== TEST 1: Initialize works ====================
#[test]
fn test_initialize_works() {
    let (_, client, admin, _, _, _) = setup_test();
    let result = client.initialize(&admin);
    assert_eq!(result, ());
}

// ==================== TEST 2: Create will works ====================
#[test]
fn test_create_will_works() {
    let (env, client, admin, owner, beneficiary, token) = setup_test();
    client.initialize(&admin);

    let will_id = client.create_will(
        &owner,
        &beneficiary,
        &token,
        &1000_0000000, // 1000 tokens
        &2_000_000,    // unlock time in the future
        &86400,        // 1 day heartbeat interval
    );

    assert_eq!(will_id, 1);

    let will = client.get_will(&will_id);
    assert_eq!(will.owner, owner);
    assert_eq!(will.beneficiary, beneficiary);
    assert_eq!(will.amount, 1000_0000000);
    assert_eq!(will.status, WillStatus::Active);

    // Verify token was transferred to contract
    let token_client = TokenClient::new(&env, &token);
    let contract_balance = token_client.balance(&client.address);
    assert_eq!(contract_balance, 1000_0000000);
    let owner_balance = token_client.balance(&owner);
    assert_eq!(owner_balance, 99_000_0000000); // 100,000 - 1,000
}

// ==================== TEST 3: Create will fails if amount <= 0 ====================
#[test]
fn test_create_will_invalid_amount() {
    let (_, client, admin, owner, beneficiary, token) = setup_test();
    client.initialize(&admin);

    let result = client.try_create_will(
        &owner,
        &beneficiary,
        &token,
        &0,         // invalid amount
        &2_000_000,
        &86400,
    );

    assert_eq!(result, Err(Ok(ContractError::InvalidAmount)));
}

// ==================== TEST 4: Owner cannot set self as beneficiary ====================
#[test]
fn test_create_will_owner_is_beneficiary() {
    let (_, client, admin, owner, _, token) = setup_test();
    client.initialize(&admin);

    let result = client.try_create_will(
        &owner,
        &owner, // self as beneficiary
        &token,
        &1000_0000000,
        &2_000_000,
        &86400,
    );

    assert_eq!(result, Err(Ok(ContractError::InvalidBeneficiary)));
}

// ==================== TEST 5: Heartbeat extends unlock time ====================
#[test]
fn test_heartbeat_extends_unlock_time() {
    let (env, client, admin, owner, beneficiary, token) = setup_test();
    client.initialize(&admin);

    let will_id = client.create_will(
        &owner,
        &beneficiary,
        &token,
        &1000_0000000,
        &2_000_000,
        &500_000, // heartbeat interval
    );

    // Advance timestamp
    env.ledger().set(LedgerInfo {
        timestamp: 1_500_000,
        protocol_version: 22,
        sequence_number: 200,
        network_id: Default::default(),
        base_reserve: 10,
        min_temp_entry_ttl: 100,
        min_persistent_entry_ttl: 100,
        max_entry_ttl: 10_000_000,
    });

    client.heartbeat(&owner, &will_id);

    let will = client.get_will(&will_id);
    assert_eq!(will.last_heartbeat, 1_500_000);
    assert_eq!(will.unlock_time, 1_500_000 + 500_000); // new_time + interval
}

// ==================== TEST 6: Beneficiary cannot claim before unlock time ====================
#[test]
fn test_claim_before_unlock_time() {
    let (_, client, admin, owner, beneficiary, token) = setup_test();
    client.initialize(&admin);

    let will_id = client.create_will(
        &owner,
        &beneficiary,
        &token,
        &1000_0000000,
        &2_000_000,
        &86400,
    );

    // Try to claim at current time (1_000_000 < 2_000_000)
    let result = client.try_claim_inheritance(&beneficiary, &will_id);
    assert_eq!(result, Err(Ok(ContractError::UnlockTimeNotReached)));
}

// ==================== TEST 7: Beneficiary can claim after unlock time ====================
#[test]
fn test_claim_after_unlock_time() {
    let (env, client, admin, owner, beneficiary, token) = setup_test();
    client.initialize(&admin);

    let will_id = client.create_will(
        &owner,
        &beneficiary,
        &token,
        &1000_0000000,
        &2_000_000,
        &86400,
    );

    // Advance past unlock time
    env.ledger().set(LedgerInfo {
        timestamp: 2_500_000,
        protocol_version: 22,
        sequence_number: 300,
        network_id: Default::default(),
        base_reserve: 10,
        min_temp_entry_ttl: 100,
        min_persistent_entry_ttl: 100,
        max_entry_ttl: 10_000_000,
    });

    client.claim_inheritance(&beneficiary, &will_id);

    let will = client.get_will(&will_id);
    assert_eq!(will.status, WillStatus::Claimed);

    // Check beneficiary received tokens
    let token_client = TokenClient::new(&env, &token);
    let ben_balance = token_client.balance(&beneficiary);
    assert_eq!(ben_balance, 1000_0000000);
}

// ==================== TEST 8: Non-beneficiary cannot claim ====================
#[test]
fn test_non_beneficiary_cannot_claim() {
    let (env, client, admin, owner, beneficiary, token) = setup_test();
    client.initialize(&admin);

    let will_id = client.create_will(
        &owner,
        &beneficiary,
        &token,
        &1000_0000000,
        &2_000_000,
        &86400,
    );

    // Advance past unlock time
    env.ledger().set(LedgerInfo {
        timestamp: 2_500_000,
        protocol_version: 22,
        sequence_number: 300,
        network_id: Default::default(),
        base_reserve: 10,
        min_temp_entry_ttl: 100,
        min_persistent_entry_ttl: 100,
        max_entry_ttl: 10_000_000,
    });

    // Random address tries to claim
    let random_user = Address::generate(&env);
    let result = client.try_claim_inheritance(&random_user, &will_id);
    assert_eq!(result, Err(Ok(ContractError::Unauthorized)));
}

// ==================== TEST 9: Owner can cancel active will ====================
#[test]
fn test_owner_cancel_will() {
    let (env, client, admin, owner, beneficiary, token) = setup_test();
    client.initialize(&admin);

    let will_id = client.create_will(
        &owner,
        &beneficiary,
        &token,
        &1000_0000000,
        &2_000_000,
        &86400,
    );

    client.cancel_will(&owner, &will_id);

    let will = client.get_will(&will_id);
    assert_eq!(will.status, WillStatus::Cancelled);

    // Owner gets tokens back
    let token_client = TokenClient::new(&env, &token);
    let owner_balance = token_client.balance(&owner);
    assert_eq!(owner_balance, 100_000_0000000); // full balance restored
}

// ==================== TEST 10: Non-owner cannot cancel ====================
#[test]
fn test_non_owner_cannot_cancel() {
    let (env, client, admin, owner, beneficiary, token) = setup_test();
    client.initialize(&admin);

    let will_id = client.create_will(
        &owner,
        &beneficiary,
        &token,
        &1000_0000000,
        &2_000_000,
        &86400,
    );

    let random_user = Address::generate(&env);
    let result = client.try_cancel_will(&random_user, &will_id);
    assert_eq!(result, Err(Ok(ContractError::Unauthorized)));
}

// ==================== TEST 11: Owner can change beneficiary ====================
#[test]
fn test_change_beneficiary() {
    let (env, client, admin, owner, beneficiary, token) = setup_test();
    client.initialize(&admin);

    let will_id = client.create_will(
        &owner,
        &beneficiary,
        &token,
        &1000_0000000,
        &2_000_000,
        &86400,
    );

    let new_beneficiary = Address::generate(&env);
    client.change_beneficiary(&owner, &will_id, &new_beneficiary);

    let will = client.get_will(&will_id);
    assert_eq!(will.beneficiary, new_beneficiary);
}

// ==================== TEST 12: Cancelled will cannot be claimed ====================
#[test]
fn test_cancelled_will_cannot_be_claimed() {
    let (env, client, admin, owner, beneficiary, token) = setup_test();
    client.initialize(&admin);

    let will_id = client.create_will(
        &owner,
        &beneficiary,
        &token,
        &1000_0000000,
        &2_000_000,
        &86400,
    );

    // Cancel the will
    client.cancel_will(&owner, &will_id);

    // Advance past unlock time
    env.ledger().set(LedgerInfo {
        timestamp: 2_500_000,
        protocol_version: 22,
        sequence_number: 300,
        network_id: Default::default(),
        base_reserve: 10,
        min_temp_entry_ttl: 100,
        min_persistent_entry_ttl: 100,
        max_entry_ttl: 10_000_000,
    });

    // Try to claim cancelled will
    let result = client.try_claim_inheritance(&beneficiary, &will_id);
    assert_eq!(result, Err(Ok(ContractError::WillNotActive)));
}
