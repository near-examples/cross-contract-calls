# Cross-Contract Hello Contract

The smart contract implements the simplest form of cross-contract calls: it calls the [Hello NEAR example](https://docs.near.org/tutorials/examples/hello-near) to get and set a greeting.

```ts
@call
query_greeting() {
  const call = near.promiseBatchCreate(this.hello_account);
  near.promiseBatchActionFunctionCall(call, "get_greeting", bytes(JSON.stringify({})), 0, 5 * TGAS);
  const then = near.promiseThen(call, near.currentAccountId(), "query_greeting_callback", bytes(JSON.stringify({})), 0, 5 * TGAS);
  return near.promiseReturn(then);
}

@call
query_greeting_callback() {
  assert(near.currentAccountId() === near.predecessorAccountId(), "This is a private method");
  const greeting = near.promiseResult(0) as String;
  return greeting.substring(1, greeting.length-1);
}

@call
change_greeting({ new_greeting }: { new_greeting: string }) {
  const call = near.promiseBatchCreate(this.hello_account);
  near.promiseBatchActionFunctionCall(call, "set_greeting", bytes(JSON.stringify({ greeting: new_greeting })), 0, 5 * TGAS);
  const then = near.promiseThen(call, near.currentAccountId(), "change_greeting_callback", bytes(JSON.stringify({})), 0, 5 * TGAS);
  return near.promiseReturn(then);
}

@call
change_greeting_callback() {
  assert(near.currentAccountId() === near.predecessorAccountId(), "This is a private method");

  if (near.promiseResultsCount() == BigInt(1)) {
    near.log("Promise was successful!")
    return true
  } else {
    near.log("Promise failed...")
    return false
  }
}
```

<br />

# Quickstart

1. Make sure you have installed [node.js](https://nodejs.org/en/download/package-manager/) >= 16.
2. Install the [`NEAR CLI`](https://github.com/near/near-cli#setup)

<br />

## 1. Build and Deploy the Contract
You can automatically compile and deploy the contract in the NEAR testnet by running:

```bash
npm run deploy
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