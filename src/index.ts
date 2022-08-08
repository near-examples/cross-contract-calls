import { NearContract, NearBindgen, call, near, bytes } from "near-sdk-js";

const TGAS = 10000000000000;

@NearBindgen
class CrossContractCall extends NearContract {
  helloAccount: string;

  constructor({ helloAccount = "hello-nearverse.testnet" }: { helloAccount: string }) {
    super()
    this.helloAccount = helloAccount;
  }

  @call
  queryGreeting() {
    const call = near.promiseBatchCreate(this.helloAccount);
    near.promiseBatchActionFunctionCall(call, "get_greeting", bytes(JSON.stringify({})), 0, 5 * TGAS);
    const then =  near.promiseThen(call, near.currentAccountId(), "queryGreetingCallback", bytes(JSON.stringify({})), 0, 5 * TGAS);
    return near.promiseReturn(then);
  }

  @call
  queryGreetingCallback() {
    assert(near.currentAccountId() === near.predecessorAccountId(), "This is a private method");
    const greeting = near.promiseResult(0);
    return greeting;
  }

  @call
  changeGreeting({ newGreeting }: { newGreeting: string }) {
    const call = near.promiseBatchCreate(this.helloAccount);
    near.promiseBatchActionFunctionCall(call, "set_greeting", bytes(JSON.stringify({ message: newGreeting })), 0, 5 * TGAS);
    const then = near.promiseThen(call, near.currentAccountId(), "changeGreetingCallback", bytes(JSON.stringify({})), 0, 5 * TGAS);
    return near.promiseReturn(then);
  }

  @call
  changeGreetingCallback() {
    assert(near.currentAccountId() === near.predecessorAccountId(), "This is a private method");

    if (near.promiseResultsCount() == BigInt(1)) {
      near.log("Promise was successful!")
      return true
    } else {
      near.log("Promise failed...")
      return false
    }
  }

  default() {
    return new CrossContractCall({ helloAccount: "hello-nearverse.testnet" })
  }
}

function assert(condition, message) { if(!condition) near.panic(message); }