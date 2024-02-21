import { AccountId, near, NearPromise } from "near-sdk-js";
import { NO_ARGS, NO_DEPOSIT, TEN_TGAS } from "./constants";
import { promiseResult } from "./utils";

export function batch_actions(accountId: AccountId) {

  const promise = NearPromise.new(accountId)
    .functionCall("set_greeting", JSON.stringify({ greeting: 'hi' }), NO_DEPOSIT, TEN_TGAS)
    .functionCall("get_greeting", NO_ARGS, NO_DEPOSIT, TEN_TGAS)
    .functionCall("set_greeting", JSON.stringify({ greeting: 'bye' }), NO_DEPOSIT, TEN_TGAS)
    .functionCall("get_greeting", NO_ARGS, NO_DEPOSIT, TEN_TGAS)
    .then(
      NearPromise.new(near.currentAccountId())
      .functionCall("batch_actions_callback", NO_ARGS, NO_DEPOSIT, TEN_TGAS)
    )
    return promise.asReturn();
};

export function batch_actions_callback() {
  let { success, result } = promiseResult(0);

  if (success) {
    near.log(`Success! Result: ${result}`);
    return result;
  } else {
    near.log("Promise failed...");
    return "";
  }
};
