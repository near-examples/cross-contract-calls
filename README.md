# NEAR Cross Contract Call JS Example

## Overview

This example performs the simplest cross-contract call possible: it calls our Hello NEAR example to set and retrieve a greeting message. It is one of the simplest examples on making a cross-contract call, and the perfect gateway to the world of interoperative contracts.

## Installation & Setup

To clone run:

```bash
git clone https://github.com/near-examples/cross-contract-hello-js.git
```

enter the folder with:

```bash
cd cross-contract-hello-js/
```

To download dependencies run:

```bash
yarn
```

or

```bash
npm i
```

## Building Your Smart Contract

The contract exposes methods to query the greeting and change it. These methods do nothing but calling `get_greeting` and `set_greeting` in the `hello-near` example.

```javascript @call

// Calls an external contract to receive a greeting message
  @call
  queryGreeting() {
    const call = near.promiseBatchCreate(this.helloAccount);
    near.promiseBatchActionFunctionCall(call, "get_greeting", bytes(JSON.stringify({})), 0, 5 * TGAS);
    const then =  near.promiseThen(call, near.currentAccountId(), "queryGreetingCallback", bytes(JSON.stringify({})), 0, 5 * TGAS);
    return near.promiseReturn(then);
  }

//Private method designed to handle the promise returned from the cross contract call. Not available for the user to call.
  @call
  queryGreetingCallback() {
    assert(near.currentAccountId() === near.predecessorAccountId(), "This is a private method");
    const greeting = near.promiseResult(0);
    return greeting;
  }

// calls an external contract to change the greeting message.
  @call
  changeGreeting({ newGreeting }: { newGreeting: string }) {
    const call = near.promiseBatchCreate(this.helloAccount);
    near.promiseBatchActionFunctionCall(call, "set_greeting", bytes(JSON.stringify({ message: newGreeting })), 0, 5 * TGAS);
    const then = near.promiseThen(call, near.currentAccountId(), "changeGreetingCallback", bytes(JSON.stringify({})), 0, 5 * TGAS);
    return near.promiseReturn(then);
  }

//Private method designed to handle the promise returned from the cross contract call. Not available for the user to call.
  @call
  changeGreetingCallback() {
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

A `call` method stores or modifies information that exists in state on the NEAR blockchain. Call methods do incur a gas fee. `Call` methods return no values

A `view` method retrieves information stored on the blockchain. No fee is charged for a view method. View methods always return a value. In this example we use the `@call` decorator for both change and view methods since we are making a call to an external contract.

`NearBindgen` is a decorator that exposes the state and methods to the user.

To build your smart contract run

```bash
yarn build
```

or

```bash
npm run build
```

This build script will build your smart contract and compile it down to a `.wasm` file, in this case named `contract.wasm`.

Once you have built out your smart contract you can deploy it to a NEAR account using:

```bash
near dev-deploy build/contract.wasm
```

`dev-deploy` will create a new dev account on NEAR's testnet, and deploy the selected `.wasm` file onto it.

The output should display the dev account name as follows.

example:

```
dev-1659920584637-66821958258766
```

Once a smart contract has been deployed it must be initialized.

Initialize This contract by running the following

```bash
near call <dev-account> init --accountId <your-account.testnet>
```

## Calling methods from terminal

Let's receive the default greeting using this call:

```bash
near call <dev-account> queryGreeting '{}' --accountId <your-account.testnet> --gas 300000000000000
```

This will make a call to the dev account's contract method `queryGreeting`, and attach 300TGas to the call.

This makes a call to an external view method which should allow you to receive a message that says "goteam".

Now let's change the message.

```bash
near call <dev-account> changeGreeting '{"newGreeting":"Yay Cross Contracts Calls!"}' --accountId <your-account.testnet> --gas 300000000000000
```

Now call `queryGreeting` again and see if your message has successfully changed!

## Run Tests

This example repo comes with integration tests written in rust and assembly type script.

To run tests run the following in your terminal:

```bash
yarn test
```

or

```bash
npm run test
```

Integration tests are generally written in javascript. They automatically deploy your contract and execute methods on it. In this way, integration tests simulate interactions from users in a realistic scenario. You will find the integration tests for hello-near in integration-tests/.
