# Complex Cross-Contract Calls Examples

This contract presents 3 examples on how to do complex cross-contract calls. Particularly, it shows:

1. How to batch method calls to a same contract.
2. How to call multiple contracts in parallel, each returning a different type.
3. Different ways of handling the responses in the callback.

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

near deploy <your-account.testnet> ./build/cross_contract.wasm init '{"hello_account":"hello.near-example.testnet", "counter_account":"counter.near-example.testnet", "guestbook_account":"guestbook.near-example.testnet"}' 
```

<br />

## 3. CLI: Interacting with the Contract

To interact with the contract through the console, you can use the following commands

```bash
# Replace <your-account.testnet> with your account ID
# Call batch_actions method
near call <your-account.testnet> batch_actions --gas 300000000000000 --accountId <your-account.testnet>

# Call multiple_contracts method
near call <your-account.testnet> multiple_contracts --gas 300000000000000 --accountId <your-account.testnet>

# Call similar_contracts method
near call <your-account.testnet> similar_contracts --gas 300000000000000 --accountId <your-account.testnet>
```

<br />

# Useful Links

- [near CLI](https://near.cli.rs) - Interact with NEAR blockchain from command line
- [NEAR Documentation](https://docs.near.org)
- [NEAR StackOverflow](https://stackoverflow.com/questions/tagged/nearprotocol)
- [NEAR Discord](https://near.chat)
- [NEAR Telegram Developers Community Group](https://t.me/neardev)
- NEAR DevHub: [Telegram](https://t.me/neardevhub), [Twitter](https://twitter.com/neardevhub)