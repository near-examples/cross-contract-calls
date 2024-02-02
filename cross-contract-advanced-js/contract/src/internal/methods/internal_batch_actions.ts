import { near, NearPromise } from "near-sdk-js";
import { CrossContractCall } from '../../contract';
import { FIVE_TGAS, TEN_TGAS, NO_DEPOSIT, NO_ARGS } from '../constants';

export function internal_batch_actions(contract: CrossContractCall, new_greeting: string) {
  const promise = NearPromise.new(contract.hello_account)
    .functionCall("set_greeting", JSON.stringify({ message: new_greeting }), NO_DEPOSIT, FIVE_TGAS)
    .functionCall("get_greeting", NO_ARGS, NO_DEPOSIT, FIVE_TGAS)
    .functionCall("set_greeting", JSON.stringify({ message: 'Hi' }), NO_DEPOSIT, FIVE_TGAS)
    .functionCall("get_greeting", NO_ARGS, NO_DEPOSIT, FIVE_TGAS)
    .then(
      NearPromise.new(near.currentAccountId())
      .functionCall("batch_actions_callback", NO_ARGS, NO_DEPOSIT, TEN_TGAS)
    )

    return promise.asReturn();
};