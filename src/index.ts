import { NearContract, NearBindgen, call, near, bytes } from "near-sdk-js";
import { assert } from "./utils/assert";

const TGAS = 10000000000000;

@NearBindgen
class CrossContractCall extends NearContract {
  hello_account: string;

  constructor({ hello_account = "hello-nearverse.testnet" }: { hello_account: string }) {
    super()
    assert(near.currentAccountId() === near.predecessorAccountId(), "Method new is private");
    this.hello_account = hello_account;
  }

  @call
  query_greeting() {
    const promiseIdx = near.promiseBatchCreate(this.hello_account);
    near.promiseBatchActionFunctionCall(promiseIdx, "get_greeting", bytes(JSON.stringify({})), 0, 5 * TGAS);
    near.promiseThen(promiseIdx, near.currentAccountId(), "query_greeting_callback", bytes(JSON.stringify({})), 0, 5 * TGAS);
    return near.promiseReturn(promiseIdx);
  }

  @call
  query_greeting_callback() {
    assert(near.currentAccountId() === near.predecessorAccountId(), "This is a private method");
    const greeting = near.promiseResult(0);
    // Check if the promise was successful and return the result. Otherwise, return an error.
    assert(typeof greeting === "string", "Promise failed...");
    return greeting;
  }

  @call
  change_greeting({ new_greeting }: { new_greeting: string }) {
    const promiseIdx = near.promiseBatchCreate(this.hello_account);
    near.promiseBatchActionFunctionCall(promiseIdx, "set_greeting", bytes(JSON.stringify({ message: new_greeting })), 0, 5 * TGAS);
    near.promiseThen(promiseIdx, near.currentAccountId(), "change_greeting_callback", bytes(JSON.stringify({})), 0, 5 * TGAS);
    return near.promiseReturn(promiseIdx);
  }

  @call
  change_greeting_callback() {
    assert(near.currentAccountId() === near.predecessorAccountId(), "This is a private method");

    const greeting = near.promiseResult(0);
    // Check if the promise was successful and return the result. Otherwise, return an error.
    assert(typeof greeting === "string", "Promise failed...");
    return true;
  }
}