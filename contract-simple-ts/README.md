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
├── package.json
├── src # contract's code
│    └── contract.ts
├── package.json
├── README.md
└── tsconfig.json
```

## Smart Contract

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

## Deploying the Contract to the NEAR network

In order to deploy the contract you will need to [create a NEAR account](https://docs.near.org/develop/contracts/quickstart#create-a-testnet-account).

```bash
# Optional - create an account
near create-account <accountId> --useFaucet

# Deploy the contract
yarn build
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
