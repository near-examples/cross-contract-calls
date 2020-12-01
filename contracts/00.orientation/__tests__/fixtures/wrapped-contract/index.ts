import {
  util,
  env,
  u128,
  logging,
  ContractPromise,
  ContractPromiseBatch
} from "near-sdk-as"
const BASIC_GAS = 5000000000000
function xcc(level: string, account: string, method: string, args: string = "{}"): void {
  logging.log("[" + level.toUpperCase() + " LEVEL] preparing to call [ " + account + "." + method + "() ]");
  if (level == "high") {
    xcc__high_level(account, method, args);
  } else if (level == "mid") {
    xcc__mid_level(account, method, args);
  } else if (level == "low") {
    xcc__low_level(account, method, args);
  } else {
    assert(false, "Unsupported level of abstraction: [" + level + "]");
  }
}
function xcc__high_level(remote_account: string, remote_method: string, remote_method_args: string): void {
  const promise = ContractPromise.create(remote_account, remote_method, remote_method_args, BASIC_GAS, u128.Zero);
  promise.returnAsResult();
}
function xcc__mid_level(remote_account: string, remote_method: string, remote_method_args: string): void {
  const promise = ContractPromiseBatch.create(remote_account);
  promise.function_call(remote_method, remote_method_args, u128.Zero, BASIC_GAS);
  env.promise_return(promise.id);
}
function xcc__low_level(remote_account: string, remote_method: string, remote_method_args: string): void {
  const remote_account_as_array = util.stringToBytes(remote_account);
  const promise: u64 = env.promise_batch_create(remote_account_as_array.byteLength, remote_account_as_array.dataStart);
  const remote_method_name_as_array = util.stringToBytes(remote_method);
  const attached_deposit_as_array = u128.Zero.toUint8Array();
  const remote_method_args_as_array = encodeArgs<string>(remote_method_args);
  env.promise_batch_action_function_call(promise, remote_method_name_as_array.byteLength, remote_method_name_as_array.dataStart, remote_method_args_as_array.byteLength, remote_method_args_as_array.dataStart, attached_deposit_as_array.dataStart, BASIC_GAS);
  env.promise_return(promise);
}
function encodeArgs<T>(t: T): Uint8Array {
  if (t instanceof Uint8Array) {
    return t;
  }
  return encode<T>(t);
}
function __wrapper_xcc(): void {
  const obj = getInput();
  xcc(obj.has('level') ? 
             decode<string, JSON.Obj>(obj, "level") : 
             assertNonNull<string>('level', changetype<string>(0)), obj.has('account') ? 
             decode<string, JSON.Obj>(obj, "account") : 
             assertNonNull<string>('account', changetype<string>(0)), obj.has('method') ? 
             decode<string, JSON.Obj>(obj, "method") : 
             assertNonNull<string>('method', changetype<string>(0)), obj.has('args') ? 
             decode<string, JSON.Obj>(obj, "args") : 
             assertNonNull<string>('args', changetype<string>("{}")));
}
export { __wrapper_xcc as xcc }