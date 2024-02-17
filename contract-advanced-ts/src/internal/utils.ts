import { near } from "near-sdk-js";

export function promiseResult(index: number): { result: string, success: boolean } {
  let result, success;
  
  try {
    result = near.promiseResult(index);
    success = true;
  } catch (err){
    near.log(err.message);
    throw err;
    result = undefined;
    success = false;
  }
  
  return {
    result,
    success,
  }
}