# Cross-Contract Hello Contract

The smart contract implements the simplest form of cross-contract calls: it calls the [Hello NEAR example](https://docs.near.org/tutorials/examples/hello-near) to get and set a greeting.

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

# Quickstart

1. Make sure you have installed [rust](https://rust.org/).
2. Install the [`NEAR CLI`](https://github.com/near/near-cli#setup)

<br />

## 1. Build and Deploy the Contract
You can automatically compile and deploy the contract in the NEAR testnet by running:

```bash
./deploy.sh
```

Once finished, check the `neardev/dev-account` file to find the address in which the contract was deployed:

```bash
cat ./neardev/dev-account  # dev-1659899566943-21539992274727
```

<br />

## 2. Get the Greeting

`query_greeting` performs a cross-contract call, calling the `get_greeting()` method from `hello-nearverse.testnet`.

`Call` methods can only be invoked using a NEAR account, since the account needs to pay GAS for the transaction.

```bash
# Use near-cli to ask the contract to query the greeting
near call <dev-account> query_greeting --accountId <dev-account>
```

<br />

## 3. Set a New Greeting
`change_greeting` performs a cross-contract call, calling the `set_greeting({greeting:String})` method from `hello-nearverse.testnet`.

`Call` methods can only be invoked using a NEAR account, since the account needs to pay GAS for the transaction.

```bash
# Use near-cli to change the greeting
near call <dev-account> change_greeting '{"new_greeting":"XCC Hi"}' --accountId <dev-account>
```

**Tip:** If you would like to call `change_greeting` or `query_greeting` using your own account, first login into NEAR using:

```bash
# Use near-cli to login your NEAR account
near login
```

and then use the logged account to sign the transaction: `--accountId <your-account>`.