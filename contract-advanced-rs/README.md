# Complex Cross-Contract Calls Examples

This contract presents 3 examples on how to do complex cross-contract calls. Particularly, it shows:

1. How to batch method calls to a same contract.
2. How to call multiple contracts in parallel, each returning a different type.
3. Different ways of handling the responses in the callback.

## How to Build Locally?

Install [`cargo-near`](https://github.com/near/cargo-near) and run:

```bash
cargo near build
```

## How to Test Locally?

```bash
cargo test
```

## How to Deploy?

To deploy manually, install [`cargo-near`](https://github.com/near/cargo-near) and run:

```bash
# Create a new account
cargo near create-dev-account

# Deploy the contract on it
cargo near deploy <account-id>
```

## CLI: Interacting with the Contract

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

# Useful Links

- [cargo-near](https://github.com/near/cargo-near) - NEAR smart contract development toolkit for Rust
- [near CLI](https://near.cli.rs) - Interact with NEAR blockchain from command line
- [NEAR Rust SDK Documentation](https://docs.near.org/sdk/rust/introduction)
- [NEAR Documentation](https://docs.near.org)
- [NEAR StackOverflow](https://stackoverflow.com/questions/tagged/nearprotocol)
- [NEAR Discord](https://near.chat)
- [NEAR Telegram Developers Community Group](https://t.me/neardev)
- NEAR DevHub: [Telegram](https://t.me/neardevhub), [Twitter](https://twitter.com/neardevhub)