# Cross-Contract Hello Contract

The smart contract implements the simplest form of cross-contract calls: it calls the [Hello NEAR example](https://docs.near.org/tutorials/examples/hello-near) to get and set a greeting.

<br />

# Quickstart

1. Make sure you have installed [node.js](https://nodejs.org/en/download/package-manager/) >= 16.
2. Install the [`NEAR CLI`](https://github.com/near/near-cli#setup)


## 1. Build and Test the Contract
You can automatically compile and test the contract by running:

```bash
# To solely build the contract
npm run build

# To build and execute the contract's tests
npm run test
```

## 2. Create an Account and Deploy the Contract
You can create a new account and deploy the contract by running:

```bash
near create-account <your-account.testnet> --useFaucet

near deploy <your-account.testnet> ./build/cross_contract.wasm init '{"hello_account":"hello.near-example.testnet"}' 
```

<br />

## 3. CLI: Interacting with the Contract

To interact with the contract through the console, you can use the following commands

```bash
# Get message from the hello-near contract
# Replace <your-account.testnet> with your account ID
near call <your-account.testnet> query_greeting --accountId <your-account.testnet>

# Set a new message for the hello-near contract
# Replace <your-account.testnet> with your account ID
near call <your-account.testnet> change_greeting '{"new_greeting":"XCC Hi"}' --accountId <your-account.testnet>
```

# Useful Links

- [near CLI](https://near.cli.rs) - Interact with NEAR blockchain from command line
- [NEAR Documentation](https://docs.near.org)
- [NEAR StackOverflow](https://stackoverflow.com/questions/tagged/nearprotocol)
- [NEAR Discord](https://near.chat)
- [NEAR Telegram Developers Community Group](https://t.me/neardev)
- NEAR DevHub: [Telegram](https://t.me/neardevhub), [Twitter](https://twitter.com/neardevhub)