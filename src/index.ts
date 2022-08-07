import { NearContract, NearBindgen, call, near, bytes } from "near-sdk-js";
import { assert } from "./utils/assert";

const TGAS = 10000000000000;

@NearBindgen
class CrossContractCall extends NearContract {
  helloAccount: string;

  constructor({ helloAccount = "hello-nearverse.testnet" }: { helloAccount: string }) {
    super()
    assert(near.currentAccountId() === near.predecessorAccountId(), "Method new is private");
    this.helloAccount = helloAccount;
  }

  default() {
    return new CrossContractCall({ helloAccount: "hello-nearverse.testnet" })
  }

  @call
  queryGreeting() {
    const promiseIdx = near.promiseBatchCreate(this.helloAccount);
    near.promiseBatchActionFunctionCall(promiseIdx, "get_greeting", bytes(JSON.stringify({})), 0, 5 * TGAS);
    near.promiseThen(promiseIdx, near.currentAccountId(), "queryGreetingCallback", bytes(JSON.stringify({})), 0, 5 * TGAS);
    return near.promiseReturn(promiseIdx);
  }

  @call
  queryGreetingCallback() {
    assert(near.currentAccountId() === near.predecessorAccountId(), "This is a private method");
    const greeting = near.promiseResult(0);
    // Check if the promise was successful and return the result. Otherwise, return an error.
    assert(typeof greeting === "string", "Promise failed...");
    return greeting;
  }

  @call
  changeGreeting({ newGreeting }: { newGreeting: string }) {
    const promiseIdx = near.promiseBatchCreate(this.helloAccount);
    near.promiseBatchActionFunctionCall(promiseIdx, "set_greeting", bytes(JSON.stringify({ message: newGreeting })), 0, 5 * TGAS);
    near.promiseThen(promiseIdx, near.currentAccountId(), "changeGreetingCallback", bytes(JSON.stringify({})), 0, 5 * TGAS);
    return near.promiseReturn(promiseIdx);
  }

  @call
  changeGreetingCallback() {
    assert(near.currentAccountId() === near.predecessorAccountId(), "This is a private method");

    const greeting = near.promiseResult(0);
    // Check if the promise was successful and return the result. Otherwise, return an error.
    assert(typeof greeting === "string", "Promise failed...");
    return true;
  }
}