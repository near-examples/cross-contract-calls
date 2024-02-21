# Cross-Contract Hello Contract

The smart contract implements the simplest form of cross-contract calls: it calls the [Hello NEAR example](https://docs.near.org/tutorials/examples/hello-near) to get and set a greeting.

## Structure of the Example

```bash
┌── sandbox-ts # sandbox testing
│    ├── src
│    │    ├── hello-near
│    │    │    └── hello-near.wasm
│    │    └── main.ava.ts
│    ├── ava.config.cjs
│    └── package.json
├── src # contract's code
│    ├── external.rs
│    └── lib.rs
├── build.sh # build script
├── Cargo.toml # package manager
├── README.md
├── rust-toolchain.toml
└── test.sh # test script
```

## Smart Contract

```rust
// Public - query external greeting
pub fn query_greeting(&self) -> Promise {
  // Create a promise to call HelloNEAR.get_greeting()
  let promise = hello_near::ext(self.hello_account.clone())
    .with_static_gas(Gas(5*TGAS))
    .get_greeting();

  return promise.then( // Create a promise to callback query_greeting_callback
    Self::ext(env::current_account_id())
    .with_static_gas(Gas(5*TGAS))
    .query_greeting_callback()
  )
}

#[private] // Public - but only callable by env::current_account_id()
pub fn query_greeting_callback(&self, #[callback_result] call_result: Result<String, PromiseError>) -> String {
  // Check if the promise succeeded by calling the method outlined in external.rs
  if call_result.is_err() {
    log!("There was an error contacting Hello NEAR");
    return "".to_string();
  }

  // Return the greeting
  let greeting: String = call_result.unwrap();
  greeting
}

// Public - change external greeting
pub fn change_greeting(&mut self, new_greeting: String) -> Promise {
  // Create a promise to call HelloNEAR.set_greeting(message:string)
  hello_near::ext(self.hello_account.clone())
    .with_static_gas(Gas(5*TGAS))
    .set_greeting(new_greeting)
  .then( // Create a callback change_greeting_callback
    Self::ext(env::current_account_id())
    .with_static_gas(Gas(5*TGAS))
    .change_greeting_callback()
  )
}

#[private]
pub fn change_greeting_callback(&mut self, #[callback_result] call_result: Result<(), PromiseError>) -> bool {
  // Return whether or not the promise succeeded using the method outlined in external.rs
  if call_result.is_err() {
    env::log_str("set_greeting was successful!");
    return true;
  } else {
    env::log_str("set_greeting failed...");
    return false;
  }
}
```

<br />

---

## Quickstart



1. Make sure you have installed [Rust](https://www.rust-lang.org/tools/install)
2. Install the [`NEAR CLI`](https://github.com/near/near-cli#setup)


## Build and Test the Contract
The contract readily includes a set of unit and sandbox testing to validate its functionality. To execute the tests, run the following commands:



```bash
# To solely build the contract
./build.sh

# To build and execute the contract's tests
./test.sh
```

## Deploying the Contract to the NEAR network

In order to deploy the contract you will need to [create a NEAR account](https://docs.near.org/develop/contracts/quickstart#create-a-testnet-account).

```bash
# Optional - create an account
near create-account <accountId> --useFaucet

# Deploy the contract
./build.sh

near deploy <accountId> contract.wasm init '{"hello_account":"hello.near-example.testnet"}' 
```
### CLI: Interacting with the Contract

To interact with the contract through the console, you can use the following commands

```bash

# Get message from the hello-near contract
# Replace <accountId> with your account ID
near call <accountId> query_greeting --accountId <accountId>

# Set a new message for the hello-near contract
# Replace <accountId> with your account ID
near call <accountId> change_greeting '{"new_greeting":"XCC Hi"}' --accountId <accountId>
```
