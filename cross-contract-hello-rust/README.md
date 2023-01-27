# 📞 Cross-Contract Hello 
[![](https://img.shields.io/badge/⋈%20Examples-Basics-green)](https://docs.near.org/tutorials/welcome)
[![](https://img.shields.io/badge/Gitpod-Ready-orange)](https://gitpod.io/#/https://github.com/near-examples/xcc-rust)
[![](https://img.shields.io/badge/Contract-rust-red)](https://docs.near.org/develop/contracts/anatomy)
[![](https://img.shields.io/badge/Frontend-none-inactive)](#)
[![](https://img.shields.io/badge/Testing-passing-green)](https://docs.near.org/develop/integrate/frontend)


The smart contract implements the simplest form of cross-contract calls: it calls the [Hello NEAR example](https://docs.near.org/tutorials/examples/hello-near) to get and set a greeting.

![](https://docs.near.org/assets/images/hello-near-banner-af016d03e81a65653c9230b95a05fe4a.png)


# What This Example Shows

1. How to query information from an external contract.
2. How to interact with an external contract.

<br />

# Quickstart

Clone this repository locally or [**open it in gitpod**](https://gitpod.io/#/https://github.com/near-examples/xcc-rust). Then follow these steps:

### 1. Install Dependencies
```bash
npm install
```

### 2. Test the Contract
Deploy your contract in a sandbox and simulate interactions from users.

```bash
npm test
```

### 3. Deploy the Contract
Build the contract and deploy it in a testnet account
```bash
npm run deploy
```

### 4. Interact With the Contract
Ask the contract to perform a cross-contract call to query or change the greeting in Hello NEAR.

```bash
# Use near-cli to ask the contract to query te greeting
near call <dev-account> query_greeting --accountId <dev-account>

# Use near-cli to set increment the counter
near call <dev-account> change_greeting '{"new_greeting":"XCC Hi"}' --accountId <dev-account>
```
---

# Learn More
1. Learn more about the contract through its [README](./contract/README.md).
2. Check [**our documentation**](https://docs.near.org/develop/welcome).