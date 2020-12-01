import {
  util,
  env,
  u128,
  logging,
  ContractPromise,
  ContractPromiseBatch
} from "near-sdk-as"

// the simplest promise calls should not cost more than about 5 Tgas
const BASIC_GAS = 5_000_000_000_000 // 5 * 10 ^ 12 // 5 Tgas // "five teragas"

export function xcc(level: string, account: string, method: string, args: string = '{}'): void {
  // logs something like "[HIGH LEVEL] preparing to call [ <account>.do_some_work() ]"
  logging.log('[' + level.toUpperCase() + ' LEVEL] preparing to call [ ' + account + '.' + method + '() ]')

  if (level == 'high') {
    xcc__high_level(account, method, args)
  } else if (level == 'mid') {
    xcc__mid_level(account, method, args)
  } else if (level == 'low') {
    xcc__low_level(account, method, args)
  } else {
    assert(false, 'Unsupported level of abstraction: [' + level + ']')
  }
}

/**
 * Make a cross-contract call ("xcc" for short) using the high-level API
 *
 * The high level API supports
 * - invoking functions on a remote account (or the same, local account like recursion actually)
 * - chaining function calls with then() similar to the JavaScript Promises API
 * - collecting function calls as they resolve using and()
 *
 * NEAR recommends using the high level API for most use cases where one or more function calls are being made
 * to remote contracts (or locally as with recursive calls).  This level of abstraction burns slightly more gas
 * than the other two levels due to additional compute in traversing the layers of abstraction but is the most
 * ergonomic (ie. simple, clear and developer friendly) than the others for most use cases.
 *
 * ContractPromise.create()            create the most common type of xcc: a FunctionCall
 * ContractPromise.all()               coordinate the return of multiple promises -- similar to Promise.all() in JavaScript
 * ContractPromise.getResults()        capture the results of the most recently resolved promise -- used in callback functions
 *
 * promise.then()                      chain multiple promises so they they depend on one another -- similar to Promise.then()
 * promise.returnAsResult()            capture the value of the promise as the return value of the function (which must itself return void)
 * promise.id                          locally unique identifier for the promise (ActionReceipts are given globally unique IDs)
 *
 * @param remote_account
 * @param remote_method
 * @param args
 */
function xcc__high_level(remote_account: string, remote_method: string, remote_method_args: string): void {
  const promise = ContractPromise.create(
    remote_account,                    // target contract account name
    remote_method,                     // target contract method name
    remote_method_args,                // target contract method arguments
    BASIC_GAS,                         // gas attached to the call
    u128.Zero                          // deposit attached to the call
  )

  promise.returnAsResult()             // return the value of the DataReceipt the client
}

/**
 * Make a cross-contract call ("xcc" for short) using the mid-level API
 *
 * The mid-level API supports
 * - all 9 primitive Actions allowed by the NEAR platform
 * - chaining function calls with then() similar to JavaScript Promises API
 *
 * ContractPromiseBatch.create()       begin the creation of a new promise whose recipient will be the parameter of this method
 * ContractPromiseBatch.all()          coordinate the return of multiple promises -- similar to Promise.all() in JavaScript
 *
 * promise.function_call               include a FunctionCall action with relevant parameters to invoke the remote function
 * promise.deploy_contract             include a DeployContract action including the new contract bytecode to deploy as UInt8Array
 *
 * promise.transfer                    include a Transfer action with the amount to transfer as u128
 * promise.stake                       include a Stake action with the amount to stake as u128 and public key as UInt8Array
 *
 * promise.create_account              include a CreateAccount action which will attempt to create a new account whose name matches the parameter passed to ContractPromiseBatch.create(account)
 * promise.delete_account              include a DeleteAccount action with beneficiaryId (account name of the beneficiary) as string
 *
 * promise.add_access_key              include an AddAccessKey action with all relevant access key configuration
 * promise.add_full_access_key         include a FullAccess key action with relevant configuration
 * promise.delete_key                  include a DeleteKey action specifying the key to delete
 *
 * @param remote_account
 * @param remote_method
 * @param remote_method_args
 */
function xcc__mid_level(remote_account: string, remote_method: string, remote_method_args: string): void {
  // first we create a promise (internally referred to as an "ActionReceipt") whose receiver is set to the remote account
  const promise = ContractPromiseBatch.create(remote_account)

  // then we add the FunctionCall action to this promise (we could add any one of the other 8 supported actions here, by the way)
  promise.function_call(
    remote_method,                     // target contract method name
    remote_method_args,                // target contract method arguments
    u128.Zero,                         // deposit attached to the call
    BASIC_GAS                          // gas attached to the call
  )

  env.promise_return(promise.id)       // return the value of the DataReceipt the client
}

/**
 * Make a cross-contract call ("xcc" for short) using the low-level API
 *
 * NEAR recommends against using this API.  This interface is included here for completeness.
 *
 * The low level API is a "c-style API" where we use pointers to memory in the virtual machine.
 * For anyone unfamiliar with programming in C, all parameters and return types must be arrays of bytes
 * with which we get the pointer to the "data start" as well as the length of the data array.
 *
 * @param account the remote account to call
 * @param method the specific method on the remote account to call
 * @param args the arguments to pass to the remote method during the call
 */
function xcc__low_level(remote_account: string, remote_method: string, remote_method_args: string): void {
  const remote_account_as_array = util.stringToBytes(remote_account);

  const promise: u64 = env.promise_batch_create(
    remote_account_as_array.byteLength,
    remote_account_as_array.dataStart
  );

  const remote_method_name_as_array = util.stringToBytes(remote_method);
  const attached_deposit_as_array = u128.Zero.toUint8Array();
  const remote_method_args_as_array = encodeArgs<string>(remote_method_args);

  env.promise_batch_action_function_call(
    promise,
    remote_method_name_as_array.byteLength,
    remote_method_name_as_array.dataStart,
    remote_method_args_as_array.byteLength,
    remote_method_args_as_array.dataStart,
    attached_deposit_as_array.dataStart,
    BASIC_GAS
  );

  env.promise_return(promise)
}

/**
 * This helper function encodes any arbitrary argument type into an array of bytes
 *
 * It is used by the low level API to encode arbitrary types into a byte array
 *
 * @param t the type to be encoded (string in all examples above)
 */
function encodeArgs<T>(t: T): Uint8Array {
  if (t instanceof Uint8Array) {
    return t;
  }
  return encode<T>(t);
}
