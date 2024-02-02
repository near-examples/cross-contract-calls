import { NearBindgen, initialize, call, near, NearPromise } from "near-sdk-js";
import { AccountId } from "near-sdk-js/lib/types";

import { internal_batch_actions } from "./internal/methods/internal_batch_actions";
import { internal_multiple_contracts } from "./internal/methods/internal_multiple_contracts";

import { internal_batch_actions_callback } from "./internal/callbacks/internal_batch_actions_callback";
import { internal_multiple_contracts_callback } from "./internal/callbacks/internal_multiple_contracts_callback";

@NearBindgen({})
export class CrossContractCall {
  hello_account: AccountId = "hello-nearverse.testnet";

  @initialize({})
  init({ hello_account }: { hello_account: AccountId }) {
    this.hello_account = hello_account
  }

  @call({})
  batch_actions({ new_greeting }: { new_greeting: string }): NearPromise {
    return internal_batch_actions(this, new_greeting);
  }

  @call({privateFunction: true})
  batch_actions_callback(): string {
    return internal_batch_actions_callback();
  }

  @call({})
  multiple_contracts(): NearPromise {
    return internal_multiple_contracts(this);
  }

  @call({privateFunction: true})
  multiple_contracts_callback({ number_promises }: { number_promises: number }): string[] | string {
    return internal_multiple_contracts_callback(number_promises);
  }
}