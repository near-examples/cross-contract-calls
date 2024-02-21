# Complex Cross-Contract Calls Examples

This contract presents 3 examples on how to do complex cross-contract calls. Particularly, it shows:

1. How to batch method calls to a same contract.
2. How to call multiple contracts in parallel, each returning a different type.
3. Different ways of handling the responses in the callback.



## Structure of the Example

```bash
┌── sandbox-ts # sandbox testing
│    ├── src
│    │    ├── external-contracts
│    │    │    ├── counter.wasm
│    │    │    ├── guest-book.wasm
│    │    │    └── hello-near.wasm
│    │    └── main.ava.ts
│    ├── ava.config.cjs
│    └── package.json
├── package.json
├── src # contract's code
│    ├── internal
│    │    ├── batch_actions.ts
│    │    ├── constants.ts
│    │    ├── multiple_contracts.ts
│    │    ├── similar_contracts.ts
│    │    └── utils.ts
│    └── contract.ts
├── package.json
├── README.md
└── tsconfig.json
```

## Smart Contract

### 1. Batch Actions

You can aggregate multiple actions directed towards one same contract into a batched transaction.
Methods called this way are executed sequentially, with the added benefit that, if one fails then
they **all get reverted**.

```ts
// Promise with batch actions
  const promise = NearPromise.new(accountId)
    .functionCall(...)
    .functionCall(...)
    .functionCall(...)
    .functionCall(...)
    .then(
      NearPromise.new(near.currentAccountId())
      .functionCall(...)
    )
```

In this case, the callback has access to the value returned by the **last
action** from the chain.

<br />

### 2. Calling Multiple Contracts

A contract can call multiple other contracts. This creates multiple transactions that execute
all in parallel. If one of them fails the rest **ARE NOT REVERTED**.

```ts
  const promise1 = NearPromise.new(contract.hello_account)
    .functionCall(...)
  const promise2 = NearPromise.new(contract.counter_account)
    .functionCall(...)
  const promise3 = NearPromise.new(contract.guestbook_account)
    .functionCall(...)

  return promise1
    .and(promise2)
    .and(promise3)
    .then(
      NearPromise.new(near.currentAccountId())
      .functionCall(...)
    )
```

In this case, the callback has access to an **array of responses**, which have either the
value returned by each call, or an error message.

<br />

### 3. Calling Contracts With the Same Return Type

This example is a particular case of the previous one ([2. Calling Multiple Contracts](#2-calling-multiple-contracts)).
It simply showcases a different way to check the results by directly accessing the `promise_result` array.

```ts
  for (let i = 0; i < number_promises; i++) {
      near.log(`Get index result: ${i}`);
      let { success, result } = promiseResult(i);
  
      if (success) {
        allResults.push(result);
        near.log(`Success! Index: ${i}, Result: ${result}`);
      } else {
        near.log("Promise failed...");
        return [];
      }
    }
  return allResults;
```
---
## Quickstart



1. Make sure you have installed [Node.s](https://nodejs.org/en/download)
2. Install the [`NEAR CLI`](https://github.com/near/near-cli#setup)


## Build and Test the Contract
The contract readily includes a set of unit and sandbox testing to validate its functionality. To execute the tests, run the following commands:



```bash
# To solely build the contract
yarn build

# To build and execute the contract's tests
yarn test
```
