import { context, logging } from "near-sdk-as"

/**
 * This function is used by the orientation examples for cross-contract calls.
 */
export function do_some_work(): string {
  const message = '[REMOTE] do_some_work() was called ... ' + Environment.capture()
  logging.log(message)
  return 'some result'
}

/**
 * This class is used to capture and serialize interesting environment variables
 * for logging purposes
 */
class Environment {
  static epoch: u64 = context.epochHeight;
  static block: u64 = context.blockIndex;
  static timestamp: u64 = context.blockTimestamp;

  static contract: string = context.contractName;
  static sender: string = context.sender;
  static predecessor: string = context.predecessor;

  static toString(prefix: string): string {
    let message = prefix
    message += '[e:' + this.epoch.toString() + '|b:' + this.block.toString() + '|t:' + this.timestamp.toString() + '] '
    message += '[c:' + this.contract + '|s:' + this.sender + '|p:' + this.predecessor + '] '
    return message
  }

  static capture(prefix: string = ''): string {
    return Environment.toString(prefix)
  }
}
