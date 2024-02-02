import { near } from "near-sdk-js";
import { promiseResult } from "../utils";

export function internal_multiple_contracts_callback(number_promises: number): string[] | string {
  const allResults = [];
    
  for (let i = 0; i < number_promises; i++) {
    near.log(`Get index result: ${i}`);
    let { success, result } = promiseResult(i);

    if (success) {
      allResults.push(result);
      near.log(`Success! Index: ${i}, Result: ${result}`);
    } else {
      near.log("Promise failed...");
      return "";
    }
  }

  return allResults;
};
