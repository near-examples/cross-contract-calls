import { NearBindgen, initialize, call, near, NearPromise } from "near-sdk-js";
import { AccountId } from "near-sdk-js/lib/types";

import { internal_batch_actions } from "./internal/methods/internal_batch_actions";
import { internal_multiple_contracts } from "./internal/methods/internal_multiple_contracts";

import { internal_batch_actions_callback } from "./internal/callbacks/internal_batch_actions_callback";
import { internal_multiple_contracts_callback } from "./internal/callbacks/internal_multiple_contracts_callback";
import { FIVE_TGAS, NO_ARGS, NO_DEPOSIT, TEN_TGAS } from "./internal/constants";
import { promiseResult } from "./internal/utils";

@NearBindgen({})
export class CrossContractCall {
  hello_account: AccountId = "hello.near-examples.testnet";
  guestbook_account: AccountId = "guestbook.near-examples.testnet";
  counter_account: AccountId = "counter.near-examples.testnet";

  @initialize({})
  init({
    hello_account,
    guestbook_account,
    counter_account,
  }: {
    hello_account: AccountId;
    guestbook_account: AccountId;
    counter_account: AccountId;
  }) {
    this.hello_account = hello_account;
    this.guestbook_account = guestbook_account;
    this.counter_account = counter_account;
  }

  @call({})
  query_greeting(): NearPromise {
    const promise = NearPromise.new(this.hello_account)
    .functionCall("get_greeting", NO_ARGS, NO_DEPOSIT, FIVE_TGAS)
    .then(
      NearPromise.new(near.currentAccountId())
      .functionCall("query_greeting_callback", NO_ARGS, NO_DEPOSIT, TEN_TGAS)
    )
    
    return promise.asReturn();
  }

  @call({ privateFunction: true })
  query_greeting_callback(): String {
    let { result, success } = promiseResult(0);

    if (success) {
      return result.substring(1, result.length-1);
    } else {
      near.log("Promise failed...")
      return ""
    }
  }

  @call({})
  batch_actions(): NearPromise {
    return internal_batch_actions(this.hello_account);
  }

  @call({ privateFunction: true })
  batch_actions_callback(): string {
    return internal_batch_actions_callback();
  }

  @call({})
  multiple_contracts(): NearPromise {
    return internal_multiple_contracts(this);
  }

  @call({ privateFunction: true })
  multiple_contracts_callback({
    number_promises,
  }: {
    number_promises: number;
  }): string[] | string {
    return internal_multiple_contracts_callback(number_promises);
  }
}
