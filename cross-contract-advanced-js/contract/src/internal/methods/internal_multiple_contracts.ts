import { near, NearPromise } from "near-sdk-js";
import { CrossContractCall } from '../../contract';
import { FIVE_TGAS, TEN_TGAS, NO_DEPOSIT, NO_ARGS } from '../constants';

export function internal_multiple_contracts(contract: CrossContractCall) {
  const promise1 = NearPromise.new(contract.hello_account)
    .functionCall("get_greeting", NO_ARGS, NO_DEPOSIT, FIVE_TGAS)
    const promise2 = NearPromise.new(contract.hello_account)
    .functionCall("get_greeting", NO_ARGS, NO_DEPOSIT, FIVE_TGAS)
    const promise3 = NearPromise.new(contract.hello_account)
    .functionCall("get_greeting", NO_ARGS, NO_DEPOSIT, FIVE_TGAS)

  return promise1
    .and(promise2)
    .and(promise3)
    .then(
      NearPromise.new(near.currentAccountId())
      .functionCall("multiple_contracts_callback", JSON.stringify({ number_promises: 3 }), NO_DEPOSIT, TEN_TGAS)
    )
};