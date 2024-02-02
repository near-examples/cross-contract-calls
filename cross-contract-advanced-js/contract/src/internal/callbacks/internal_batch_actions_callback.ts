import { near } from "near-sdk-js";
import { promiseResult } from "../utils";

export function internal_batch_actions_callback() {
  let { success, result } = promiseResult(0);

  if (success) {
    near.log(`Success! Result: ${result}`);
    return result;
  } else {
    near.log("Promise failed...");
    return "";
  }
};
