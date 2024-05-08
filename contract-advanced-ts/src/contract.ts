// Find all our documentation at https://docs.near.org
import { call, initialize, near, NearBindgen, NearPromise } from "near-sdk-js";
import { AccountId } from "near-sdk-js/lib/types";
import {
  batch_actions as internal_batch_actions,
  batch_actions_callback as internal_batch_actions_callback,
} from "./internal/batch_actions";
import {
  multiple_contracts as internal_multiple_contracts,
  multiple_contracts_callback as internal_multiple_contracts_callback,
} from "./internal/multiple_contracts";
import {
  similar_contracts as internal_similar_contracts,
  similar_contracts_callback as internal_similar_contracts_callback,
} from "./internal/similar_contracts";

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
  multiple_contracts_callback(
    { number_promises }: { number_promises: number },
  ): string[] {
    return internal_multiple_contracts_callback(number_promises);
  }

  @call({})
  similar_contracts(): NearPromise {
    return internal_similar_contracts(this);
  }

  @call({ privateFunction: true })
  similar_contracts_callback(
    { number_promises }: { number_promises: number },
  ): string[] {
    return internal_similar_contracts_callback(number_promises);
  }
}
