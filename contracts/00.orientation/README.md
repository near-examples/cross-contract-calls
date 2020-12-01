## Orientation to Cross-contract Calls

NEAR Protocol supports issuing unsigned transactions from within your contract code.  This covers the most common use cases like calling one contract from another as well as more advanced patterns like using one contract as a factory (to generate) or proxy (to relay calls) for other contracts.  The mechanism for this is referred to by several names which can be confusing at first until you realize that everyone is talking about different parts of the same elephant but from different perspectives.

### Receipts

All cross-contract calls (aka. "xcc") are based on the same underlying data structures: `ActionReceipts` and `DataReceipts`.

- `ActionReceipts` represent a *planned, guaranteed* transaction internal to the NEAR network
- `DataReceipts` represent the outcome of a completed transaction on its way to some final destination

You can read more about these artifacts in the [technical documentation here](https://nomicon.io/RuntimeSpec/Receipts.html).

### Levels of Abstraction

There are three (3) levels of abstraction in the NEAR SDKs for AssemblyScript and Rust.  The lowest level is not recommended for use by developers new to the platform but the two higher levels are both developer friendly.  The files included in this module provide examples of each of these 3 levels of abstraction with enough context to make their use clear.

- **High Level API**:  \
  Recommended for use when making single or multiple cross-contract function calls.  This API is fairly similar across both AssemblyScript and Rust with a few minor differences.

- **Mid Level API**:  \
  Recommended for use when applying any type of [`Action`]() from within your contract code.  This API is fairly similar across both AssemblyScript and Rust with a few minor differences.

- **Low Level API**:  \
  NOT recommended for general use but instructive since it exposes the raw API of the NEAR virtual machine for anyone interested in understanding how NEAR SDKs work under the hood.  This API is common to both AssemblyScript and Rust.

### Files in this Module

```
contracts
├── 00.orientation
    ├── README.md                                          <-- this file
    ├── __tests__                                          <-- SIMULATION tests and related artifacts
    │   ├── fixtures
    │   │   ├── vm-response
    │   │   │   ├── diff                                   <-- useful diffs comparing various calls in the vm
    │   │   │   │   ├── high-vs-low.diff
    │   │   │   │   ├── high-vs-mid.diff
    │   │   │   │   └── mid-vs-low.diff
    │   │   │   └── raw                                    <-- raw responses from the simulation vm
    │   │   │       ├── high-level.json
    │   │   │       ├── low-level.json
    │   │   │       └── mid-level.json
    │   │   └── wrapped-contract
    │   │       └── index.ts
    │   └── index.simulate.spec.js                         <-- simulation
    └── src
        ├── 00-local
        │   ├── __tests__
        │   │   └── index.unit.spec.ts                     <-- UNIT tests for the contract called "00-local"
        │   ├── asconfig.json                              <-- compiler configuration helper
        │   └── assembly
        │       └── index.ts                               <-- the contract itself
        └── 00-remote
            ├── __tests__
            │   └── index.unit.spec.ts
            ├── asconfig.json
            └── assembly
                └── index.ts
```

### Key Questions

There are a few key questions raised by the content in this module including:

- What are the tradeoffs between these different levels of abstractions, if any?
  - There's a difference in storage cost induced by the high level API vs. the mid and low level APIs
  - There's a difference in burnt_gas costs associated with each of these calls

- How are promises actually being reconciled on chain?
  - "Promises" on the NEAR platform are the developer-friendly name for `ActionReceipt` and `DataReceipt`
  - Promises resolve on function boundaries and there is currently no support for anything like `await` within the scope of a contract function
  - The return value of a promise is made available at some future block and there are exactly two ways to capture this value:
    1. As the return value of the exported function which eventually initiates the promise call, although it is said to return `void`
    2. As the "promise results" captured by a callback function (not covered here)

- Every public interface increases the size of the contract and therefore the cost of storage of the contract.
  - Notice the generated "wrapped contract" in the `fixtures/` folder.  Try exporting other functions in the contract and add the line  \
    `// @nearfile out`  \
    as the first line of the AssemblyScript contract to regenerate the wrapped contract.  It should appear at the top level of this project when you rebuild the contract in new folder called `out/`
