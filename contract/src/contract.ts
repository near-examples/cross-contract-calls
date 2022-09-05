import { NearBindgen, initialize, call, near, bytes } from "near-sdk-js";

const TGAS = 10000000000000;

@NearBindgen({})
class CrossContractCall {
  hello_account: string = "hello-nearverse.testnet";

  @initialize
  init({ hello_account }: { hello_account: string }) {
    this.hello_account = hello_account
  }

  @call
  query_greeting() {
    const call = near.promiseBatchCreate(this.hello_account);
    near.promiseBatchActionFunctionCall(call, "get_greeting", bytes(JSON.stringify({})), 0, 5 * TGAS);
    const then = near.promiseThen(call, near.currentAccountId(), "query_greeting_callback", bytes(JSON.stringify({})), 0, 5 * TGAS);
    return near.promiseReturn(then);
  }

  @call
  query_greeting_callback() {
    assert(near.currentAccountId() === near.predecessorAccountId(), "This is a private method");
    const greeting = near.promiseResult(0) as String;
    return greeting.substring(1, greeting.length-1);
  }

  @call
  change_greeting({ new_greeting }: { new_greeting: string }) {
    const call = near.promiseBatchCreate(this.hello_account);
    near.promiseBatchActionFunctionCall(call, "set_greeting", bytes(JSON.stringify({ greeting: new_greeting })), 0, 5 * TGAS);
    const then = near.promiseThen(call, near.currentAccountId(), "change_greeting_callback", bytes(JSON.stringify({})), 0, 5 * TGAS);
    return near.promiseReturn(then);
  }

  @call
  change_greeting_callback() {
    assert(near.currentAccountId() === near.predecessorAccountId(), "This is a private method");

    if (near.promiseResultsCount() == BigInt(1)) {
      near.log("Promise was successful!")
      return true
    } else {
      near.log("Promise failed...")
      return false
    }
  }
}

function assert(condition, greeting) { if (!condition) throw Error(`Assertion failed: ${greeting}`); }