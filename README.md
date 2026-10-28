# Cross-Contract Call Examples 👋 

## Rust toolchain

The contracts use NEAR SDK 5.29.1 and the pinned Rust 1.97.1 toolchain. Install [rustup](https://rustup.rs/) and `cargo-near` before building or running the local sandbox integration tests:

```bash
cargo install cargo-near --version 0.21.1 --locked --no-default-features
```

Integration tests start `near-sandbox` directly and use `near-api` to create accounts, deploy contracts and verify cross-contract results. Contract builds and Hello NEAR fixtures compile from source using `cargo-near-build`; no live network account is required.

[![](https://img.shields.io/badge/⋈%20Examples-Basics-green)](https://docs.near.org/tutorials/welcome)
[![](https://img.shields.io/badge/Contract-Rust-red)](contract-simple-rs)
![example workflow](https://github.com/near-examples/cross-contract-calls/actions/workflows/tests-simple-rs.yml/badge.svg)
![example workflow](https://github.com/near-examples/cross-contract-calls/actions/workflows/tests-advanced-rs.yml/badge.svg)

This repository contains examples on how to perform cross-contract calls in Rust.

- [contract-simple-rs](contract-simple-rs) - Rust example
- [contract-advanced-rs](contract-advanced-rs) - Rust advanced example

<br />

# What These Examples Show

1. How to make a NEAR contract call another and handle its response
2. How to call multiple contracts at the same time and handle their responses
3. How to call multiple functions on a same contract and handle its reponse

<br />

# Learn More
1. Learn more about the contract through its [README](./contract-simple-rs/README.md).
2. Check [**our documentation**](https://docs.near.org/build/smart-contracts/anatomy/crosscontract).
