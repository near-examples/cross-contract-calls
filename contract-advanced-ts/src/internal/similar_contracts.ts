import { near, NearPromise } from "near-sdk-js";
import { CrossContractCall } from "../contract";
import { NO_ARGS, NO_DEPOSIT, TEN_TGAS } from "./constants";
import { promiseResult } from "./utils";

function promise_set_get(contract: CrossContractCall, message: string) {
  return NearPromise.new(contract.hello_account)
    .functionCall(
      "set_greeting",
      JSON.stringify({ greeting: message }),
      NO_DEPOSIT,
      TEN_TGAS
    )
    .functionCall("get_greeting", NO_ARGS, NO_DEPOSIT, TEN_TGAS);
}



export function similar_contracts(contract: CrossContractCall) {
  const hello_one = promise_set_get(contract,"hi");
  const hello_two = promise_set_get(contract,"howdy");
  const hello_three = promise_set_get(contract,"bye");

  return hello_one
    .and(hello_two)
    .and(hello_three)
    .then(
      NearPromise.new(near.currentAccountId()).functionCall(
        "multiple_contracts_callback",
        JSON.stringify({ number_promises: 3 }),
        NO_DEPOSIT,
        TEN_TGAS
      )
    );
}

export function similar_contracts_callback(number_promises: number): string[] {
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
  