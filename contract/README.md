# Complex Cross-Contract Calls Examples

This contract presents 3 examples on how to do complex cross-contract calls. Particularly, it shows:

1. How to batch method calls to a same contract.
2. How to call multiple contracts in parallel, each returning a different type.
3. Different ways of handling the responses in the callback.

<br />

## 1. Batch Actions

You can aggregate multiple actions directed towards one same contract into a batched transaction.
Methods called this way are executed sequentially, with the added benefit that, if one fails then
they **all get reverted**.

```rust
// Promise with batch actions
Promise::new(self.hello_account.clone())
  .function_call( ... )
  .function_call( ... )
  .function_call( ... )
  .function_call( ... )
  .then( Self::ext(env::current_account_id()).batch_actions_callback() )
```

In this case, the callback has access to the value returned by the **last
action** from the chain.

<br />

## 2. Calling Multiple Contracts

A contract can call multiple other contracts. This creates multiple transactions that execute
all in parallel. If one of them fails the rest **ARE NOT REVERTED**.

```rust
let hello_promise = Promise::new(self.hello_account).function_call( ... );
let counter_promise = Promise::new(self.counter_account).function_call( ... );
let guestbook_promise = Promise::new(self.guestbook_account).function_call( ... );

// Calling multiple contracts in parallel
hello_promise
  .and(counter_promise)
  .and(guestbook_promise)
  .then(
  Self::ext(env::current_account_id()).multiple_contracts_callback(),
  )
```

In this case, the callback has access to an **array of responses**, which have either the
value returned by each call, or an error message.

<br />

## 3. Calling Contracts With the Same Return Type

This example is a particular case of the previous one ([2. Calling Multiple Contracts](#2-calling-multiple-contracts)).
It simply showcases a different way to check the results by directly accessing the `promise_result` array.

```rust
for index in 0..3 {
  let result = env::promise_result(index);   // response of the i-th call

  match result {
    PromiseResult::Successful(value) => {
      if let Ok(message) = near_sdk::serde_json::from_slice::<String>(&value) {
        results.push(message.clone());
        log!(format!("Call {index} returned: {message}"));
      } else {
        log!(format!("Error deserializing call {index} result."));
      }
    }
    ...
  }
}
```
