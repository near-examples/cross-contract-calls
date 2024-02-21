import { near, NearPromise } from "near-sdk-js";
import { CrossContractCall } from "../contract";
import { NO_ARGS, NO_DEPOSIT, TEN_TGAS } from "./constants";
import { promiseResult } from "./utils";

export function multiple_contracts(contract: CrossContractCall) {
  const promise1 = NearPromise.new(contract.hello_account)
    .functionCall("get_greeting", NO_ARGS, NO_DEPOSIT, TEN_TGAS)
  const promise2 = NearPromise.new(contract.counter_account)
    .functionCall("get_num", NO_ARGS, NO_DEPOSIT, TEN_TGAS)
  const promise3 = NearPromise.new(contract.guestbook_account)
    .functionCall("get_messages", NO_ARGS, NO_DEPOSIT, TEN_TGAS)

  return promise1
    .and(promise2)
    .and(promise3)
    .then(
      NearPromise.new(near.currentAccountId())
      .functionCall("multiple_contracts_callback", JSON.stringify({ number_promises: 3 }), NO_DEPOSIT, TEN_TGAS)
    )
};


export function multiple_contracts_callback(number_promises: number): string[] {
  const allResults = [];
    
  for (let i = 0; i < number_promises; i++) {
    near.log(`Get index result: ${i}`);
    let { success, result } = promiseResult(i);

    if (success) {
      allResults.push(result);
      near.log(`Success! Index: ${i}, Result: ${result}`);
    } else {
      near.log("Promise failed...");
      return [];
    }
  }

  return allResults;
};
