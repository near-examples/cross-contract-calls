import { env, base58, context, u128, PersistentMap, ContractPromise, ContractPromiseBatch } from 'near-sdk-as'

type AccountId = string
type PublicKey = string // @willem: i haven't captured the difference between this type and the one below.  not sure if we need it
export type Base58PublicKey = string
type Balance = u128

export const accounts = new PersistentMap<PublicKey, Balance>("a")

export const ACCESS_KEY_ALLOWANCE: u128 = u128.from(10 ^ 24) // 1 NEAR
const ON_CREATE_ACCOUNT_CALLBACK_GAS: u64 = 20_000_000_000_000 // 20 Tgas ("teragas")
const NO_DEPOSIT: u128 = u128.Zero


/**
 * https://github.com/near/near-linkdrop/blob/63a4d0c4acbc2ffcf865be2b270c900bea765782/src/lib.rs#L35-L45d
 *
 */
function is_promise_success(): bool { // @willem: not sure how to express this method exactly
  const results = ContractPromise.getResults()

  if (results.length > 0) {
    return results[0].status == 1
  } else {
    return false
  }
}


/**
 * https://github.com/near/near-linkdrop/blob/63a4d0c4acbc2ffcf865be2b270c900bea765782/src/lib.rs#L52-L69
 *
 * Allows given public key to claim sent balance.
 * Takes ACCESS_KEY_ALLOWANCE as fee from deposit to cover account creation via an access key.
 *
 * #[payable] -- note, AS contract methods don't control for attached deposit
 *
 * @param public_key
 */
export function send(public_key: Base58PublicKey): void {
  const attached_deposit = context.attachedDeposit
  assert(attached_deposit > ACCESS_KEY_ALLOWANCE, "Attached deposit must be greater than ACCESS_KEY_ALLOWANCE")

  const value = accounts.get(public_key, u128.Zero)!

  //                                value + env::attached_deposit() - ACCESS_KEY_ALLOWANCE
  accounts.set(public_key, u128.add(value, u128.sub(attached_deposit, ACCESS_KEY_ALLOWANCE)))

  const current_account_id = context.contractName

  ContractPromiseBatch
    .create(current_account_id)
    .add_access_key(
      base58.decode(public_key),
      ACCESS_KEY_ALLOWANCE,
      current_account_id,
      ["claim", "create_account_and_claim"]
    );
}


/**
 * https://github.com/near/near-linkdrop/blob/63a4d0c4acbc2ffcf865be2b270c900bea765782/src/lib.rs#L72-L88
 *
 * Claim tokens for specific account that are attached to the public key this tx is signed with.
 *
 * @param account_id
 */
export function claim(account_id: AccountId): void {
  const current_account_id = context.contractName
  const signer_account_pk = context.senderPublicKey

  assert(context.predecessor == current_account_id, "Claim only can come from this account")
  assert(env.isValidAccountID(account_id), "Invalid account id")

  const amount = accounts.getSome(signer_account_pk) // .expect("Unexpected public key"); @willem:
  accounts.delete(signer_account_pk)

  ContractPromiseBatch
    .create(current_account_id)
    .delete_key(base58.decode(signer_account_pk))

  ContractPromiseBatch
    .create(account_id)
    .transfer(amount)
}


/**
 * https://github.com/near/near-linkdrop/blob/63a4d0c4acbc2ffcf865be2b270c900bea765782/src/lib.rs#L91-L119
 *
 * Create new account and and claim tokens to it.
 *
 * @param new_account_id
 * @param new_public_key
 */
export function create_account_and_claim(new_account_id: AccountId, new_public_key: Base58PublicKey): void {
  const current_account_id = context.contractName
  const signer_account_pk = context.senderPublicKey

  assert(context.predecessor == current_account_id, "Claim only can come from this account")
  assert(env.isValidAccountID(new_account_id), "Invalid account id")

  const amount = accounts.getSome(signer_account_pk) // .expect("Unexpected public key"); @willem
  accounts.delete(signer_account_pk)

  ContractPromiseBatch
    .create(new_account_id)
    .add_full_access_key(base58.decode(new_public_key))
    .transfer(amount)
    .then(current_account_id)
    .function_call(
      "on_account_created_and_claimed",
      new OnAccountCreatedAndClaimedArgs(amount),
      NO_DEPOSIT,
      ON_CREATE_ACCOUNT_CALLBACK_GAS
    )
}


/**
 * https://github.com/near/near-linkdrop/blob/63a4d0c4acbc2ffcf865be2b270c900bea765782/src/lib.rs#L123-L144
 *
 * Create new account without linkdrop and deposit passed funds (used for creating sub accounts directly).
 *
 * #[payable] -- note, AS contract methods don't control for attached deposit
 *
 * @param new_account_id
 * @param new_public_key
 */
export function create_account(new_account_id: AccountId, new_public_key: Base58PublicKey): void {
  assert(env.isValidAccountID(new_account_id), "Invalid account id")
  let amount = context.attachedDeposit

  ContractPromiseBatch
    .create(new_account_id)
    .add_full_access_key(base58.decode(new_public_key))
    .transfer(amount)
    .then(context.contractName)
    .function_call(
      "on_account_created",
      new OnAccountCreatedArgs(context.predecessor, amount),
      NO_DEPOSIT,
      ON_CREATE_ACCOUNT_CALLBACK_GAS
    )
}


/**
 * https://github.com/near/near-linkdrop/blob/63a4d0c4acbc2ffcf865be2b270c900bea765782/src/lib.rs#L147-L159
 *
 * Callback after plain account creation.
 * @param predecessor_account_id
 * @param amount
 */
export function on_account_created(predecessor_account_id: AccountId, amount: u128): bool {
  assert(context.predecessor == context.contractName, "Callback can only be called from the contract")

  const creation_succeeded = is_promise_success();
  if (!creation_succeeded) {
    // In case of failure, send funds back.
    ContractPromiseBatch
      .create(predecessor_account_id)
      .transfer(amount)
  }
  return creation_succeeded
}

/**
 * Callback arguments for on_account_created
 */
@nearBindgen
class OnAccountCreatedArgs {
  constructor(public predecessor_account_id: AccountId, public amount: u128) { }
}


/**
 * https://github.com/near/near-linkdrop/blob/63a4d0c4acbc2ffcf865be2b270c900bea765782/src/lib.rs#L162-L177
 *
 * Callback after creating account and claiming linkdrop.
 * @param amount
 */
export function on_account_created_and_claimed(amount: u128): bool {
  const current_account_id = context.contractName
  const signer_account_pk = context.senderPublicKey

  assert(context.predecessor == current_account_id, "Callback can only be called from the contract")
  const creation_succeeded = is_promise_success();

  if (!creation_succeeded) {
    ContractPromiseBatch
      .create(current_account_id)
      .delete_key(base58.decode(signer_account_pk))
  } else {
    accounts.set(signer_account_pk, amount)
  }
  return creation_succeeded
}

/**
 * Callback arguments for on_account_created_and_claimed
 */
@nearBindgen
class OnAccountCreatedAndClaimedArgs {
  constructor(public amount: u128) { }
}


/**
 * https://github.com/near/near-linkdrop/blob/63a4d0c4acbc2ffcf865be2b270c900bea765782/src/lib.rs#L180-L182
 *
 * Returns the balance associated with given key.
 * @param key
 */
export function get_key_balance(key: Base58PublicKey): u128 {
  return accounts.getSome(key)
}
