use soroban_sdk::Env;

use crate::types::{DataKey, Will};

const LEDGER_BUMP_INSTANCE: u32 = 518_400; // ~30 days
const LEDGER_THRESHOLD_INSTANCE: u32 = 120_960; // ~7 days

const LEDGER_BUMP_PERSISTENT: u32 = 3_110_400; // ~180 days
const LEDGER_THRESHOLD_PERSISTENT: u32 = 518_400; // ~30 days

/// Extend the instance storage TTL.
pub fn extend_instance_ttl(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(LEDGER_THRESHOLD_INSTANCE, LEDGER_BUMP_INSTANCE);
}

/// Check if admin has been set (contract initialized).
pub fn has_admin(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Admin)
}

/// Get the admin address.
pub fn get_admin(env: &Env) -> soroban_sdk::Address {
    env.storage()
        .instance()
        .get(&DataKey::Admin)
        .unwrap()
}

/// Set the admin address.
pub fn set_admin(env: &Env, admin: &soroban_sdk::Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
}

/// Get the current will counter.
pub fn get_will_counter(env: &Env) -> u64 {
    env.storage()
        .instance()
        .get(&DataKey::WillCounter)
        .unwrap_or(0)
}

/// Increment and return the new will counter.
pub fn increment_will_counter(env: &Env) -> u64 {
    let count = get_will_counter(env) + 1;
    env.storage().instance().set(&DataKey::WillCounter, &count);
    count
}

/// Store a will in persistent storage.
pub fn set_will(env: &Env, will: &Will) {
    let key = DataKey::Will(will.id);
    env.storage().persistent().set(&key, will);
    env.storage()
        .persistent()
        .extend_ttl(&key, LEDGER_THRESHOLD_PERSISTENT, LEDGER_BUMP_PERSISTENT);
}

/// Get a will from persistent storage.
pub fn get_will(env: &Env, will_id: u64) -> Option<Will> {
    let key = DataKey::Will(will_id);
    let result: Option<Will> = env.storage().persistent().get(&key);
    if result.is_some() {
        env.storage()
            .persistent()
            .extend_ttl(&key, LEDGER_THRESHOLD_PERSISTENT, LEDGER_BUMP_PERSISTENT);
    }
    result
}
