import { AccountId, near, NearPromise } from "near-sdk-js";
import { CrossContractCall } from '../../contract';
import { FIVE_TGAS, TEN_TGAS, NO_DEPOSIT, NO_ARGS } from '../constants';

export function internal_batch_actions(accountId: AccountId) {

  const promise = NearPromise.new(accountId)
    .functionCall("set_greeting", JSON.stringify({ message: 'hi' }), NO_DEPOSIT, FIVE_TGAS)
    .functionCall("get_greeting", NO_ARGS, NO_DEPOSIT, FIVE_TGAS)
    .functionCall("set_greeting", JSON.stringify({ message: 'bye' }), NO_DEPOSIT, FIVE_TGAS)
    .functionCall("get_greeting", NO_ARGS, NO_DEPOSIT, FIVE_TGAS)
    .then(
      NearPromise.new(near.currentAccountId())
      .functionCall("batch_actions_callback", NO_ARGS, NO_DEPOSIT, TEN_TGAS)
    )
    return promise.asReturn();
};