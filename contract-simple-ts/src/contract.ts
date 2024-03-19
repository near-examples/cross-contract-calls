import { NearBindgen, initialize, call, near, NearPromise, PromiseIndex } from "near-sdk-js";
import { AccountId } from "near-sdk-js/lib/types";

const FIVE_TGAS = BigInt("50000000000000");
const NO_DEPOSIT = BigInt(0);
const NO_ARGS = JSON.stringify({});

@NearBindgen({})
class CrossContractCall {
  hello_account: AccountId = "hello-nearverse.testnet";

  @initialize({})
  init({ hello_account }: { hello_account: AccountId }) {
    this.hello_account = hello_account
  }

  @call({})
  query_greeting(): NearPromise {
    const promise = NearPromise.new(this.hello_account)
    .functionCall("get_greeting", NO_ARGS, NO_DEPOSIT, FIVE_TGAS)
    .then(
      NearPromise.new(near.currentAccountId())
      .functionCall("query_greeting_callback", NO_ARGS, NO_DEPOSIT, FIVE_TGAS)
    )
    
    return promise.asReturn();
  }

  @call({privateFunction: true})
  query_greeting_callback(): String {
    let {result, success} = promiseResult()

    if (success) {
      return result.substring(1, result.length-1);
    } else {
      near.log("Promise failed...")
      return ""
    }
  }

  @call({})
  change_greeting({ new_greeting }: { new_greeting: string }): NearPromise {
    const promise = NearPromise.new(this.hello_account)
    .functionCall("set_greeting", JSON.stringify({ greeting: new_greeting }), NO_DEPOSIT, FIVE_TGAS)
    .then(
      NearPromise.new(near.currentAccountId())
      .functionCall("change_greeting_callback", NO_ARGS, NO_DEPOSIT, FIVE_TGAS)
    )

    return promise.asReturn();
  }

  @call({privateFunction: true})
  change_greeting_callback(): boolean {
    let { success } = promiseResult()

    if (success) {
      near.log(`Success!`)
      return true
    } else {
      near.log("Promise failed...")
      return false
    }
  }
}

function promiseResult(): {result: string, success: boolean}{
  let result, success;
  
  try{ result = near.promiseResult(0 as PromiseIndex); success = true }
  catch{ result = undefined; success = false }
  
  return {result, success}
}