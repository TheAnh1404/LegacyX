use soroban_sdk::{Address, Env, Symbol};

/// Emit a will_created event.
pub fn will_created(
    env: &Env,
    will_id: u64,
    owner: &Address,
    beneficiary: &Address,
    amount: i128,
    unlock_time: u64,
) {
    let topics = (Symbol::new(env, "will_created"), owner.clone());
    env.events().publish(
        topics,
        (will_id, beneficiary.clone(), amount, unlock_time),
    );
}

/// Emit a heartbeat_sent event.
pub fn heartbeat_sent(
    env: &Env,
    will_id: u64,
    owner: &Address,
    new_unlock_time: u64,
) {
    let topics = (Symbol::new(env, "heartbeat_sent"), owner.clone());
    env.events().publish(topics, (will_id, new_unlock_time));
}

/// Emit an inheritance_claimed event.
pub fn inheritance_claimed(
    env: &Env,
    will_id: u64,
    beneficiary: &Address,
    amount: i128,
) {
    let topics = (Symbol::new(env, "inheritance_claimed"), beneficiary.clone());
    env.events().publish(topics, (will_id, amount));
}

/// Emit a will_cancelled event.
pub fn will_cancelled(
    env: &Env,
    will_id: u64,
    owner: &Address,
    amount: i128,
) {
    let topics = (Symbol::new(env, "will_cancelled"), owner.clone());
    env.events().publish(topics, (will_id, amount));
}

/// Emit a beneficiary_changed event.
pub fn beneficiary_changed(
    env: &Env,
    will_id: u64,
    old_beneficiary: &Address,
    new_beneficiary: &Address,
) {
    let topics = (Symbol::new(env, "beneficiary_changed"),);
    env.events().publish(
        topics,
        (will_id, old_beneficiary.clone(), new_beneficiary.clone()),
    );
}
