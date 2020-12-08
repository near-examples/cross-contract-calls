// @nearfile out
import { env, base58, context, u128, PersistentMap, ContractPromise, ContractPromiseBatch, logging } from 'near-sdk-as'

type AccountId = string
type PublicKey = string // @willem: i haven't captured the difference between this type and the one below.  not sure if we need it
export type Base58PublicKey = string
type Balance = u128

export const accounts = new PersistentMap<PublicKey, Balance>("a")

function ACCESS_KEY_ALLOWANCE(): u128 { return u128.from("1000000000000000000000000")} // 1 NEAR
const ON_CREATE_ACCOUNT_CALLBACK_GAS: u64 = 200_000_000_000_000 // 20 Tgas ("teragas")
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
 * Takes ACCESS_KEY_ALLOWANCE() as fee from deposit to cover account creation via an access key.
 *
 * #[payable] -- note, AS contract methods don't control for attached deposit
 *
 * @param public_key_arr
 */
export function send(public_key: Base58PublicKey): void {
  let public_key_arr = decodePk(public_key);
  // logging.log("public_key: " + public_key);
  // logging.log('received call to send');
  const attached_deposit = context.attachedDeposit
  assert(attached_deposit > ACCESS_KEY_ALLOWANCE(), "Attached deposit must be greater than ACCESS_KEY_ALLOWANCE()")
  
  const value = accounts.get(base58.encode(public_key_arr), u128.Zero)!

  //                                value + env::attached_deposit() - ACCESS_KEY_ALLOWANCE()
  logging.log("VALUE " + value.toString());
  logging.log(ACCESS_KEY_ALLOWANCE().toString())
  logging.log("attached " + attached_deposit.toString());
  let amount = u128.add(value, u128.sub(attached_deposit, ACCESS_KEY_ALLOWANCE()));
  logging.log("INITIAL: " + amount.toString())
  accounts.set(base58.encode(public_key_arr), amount)

  const current_account_id = context.contractName

  logging.log('about to call xcc')
  ContractPromiseBatch
    .create(current_account_id)
    .add_access_key(
      public_key_arr,
      ACCESS_KEY_ALLOWANCE(),
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
  logging.log("new pk: " + new_public_key)

  assert(context.predecessor == current_account_id, "Claim only can come from this account")
  assert(env.isValidAccountID(new_account_id), "Invalid account id")

  const amount = accounts.getSome(signer_account_pk) // .expect("Unexpected public key"); @willem
  logging.log("AMOUNT: " + amount.toString())
  accounts.delete(signer_account_pk)
  const newKey = decodePk(new_public_key);
  logging.log("new Key: " + base58.encode(newKey));
  ContractPromiseBatch
    .create(new_account_id)
    .create_account()
    .add_full_access_key(newKey)
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

export function decodePk(key: PublicKey): Uint8Array {
  if (key.indexOf(':') > -1) {
    const keyParts = key.split(':')
    let prefix = keyParts[0]
    if (prefix == 'ed25519') {
      // prefix key with base58 0 -- yes, it's actually a decimal 1 :P
      return base58.decode('1' + keyParts[1])
    } else {
      assert(false, "Bad key")
      return new Uint8Array(0)
    }
  } else {
    let decodedKey = base58.decode(key)
    if (isValid(key, decodedKey)) {
      return base58.decode('1' + key)
    } else {
      assert(false, "invalid key: " + key)
      return new Uint8Array(0)
    }
  }
}

export function isValid(key: PublicKey, decodedKey: Uint8Array): boolean {
  // key cannot be blank
  if (key == '') {
    return false
  }
  // base58 encoded key must be 43-44 characters long (or 51 with prefix 'ed25519:')
  if (![43, 44, 51].includes(key.length)) {
    return false
  }
  // remove prefix if found
  key = key.indexOf(':') > -1 ? key.split(':')[1] : key
  // check decoded byte length
  if (![32, 33].includes(decodedKey.byteLength)) {
    return false
  }
  return true
}