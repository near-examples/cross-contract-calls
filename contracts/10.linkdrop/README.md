This is a sample contract to make it clear to new developers how each folder is organized without adding any confusing implementation details for a specific example

Each contract or set of contracts is in it's own, named folder including:

- a `README.md` file like this one
- a folder filled with simulation tests at the top level
- a folder with contract source and unit tests called `src`
- contract code is in the `assembly` folder

Note that you can add multiple contracts in the src folder just by copying the `sample` folder with everything inside it and editing the `*.ts` files with contract code and related unit tests.

```
contracts/00.sample
├── README.md
├── __tests__
│   └── index.simulate.spec.js
└── src
    └── sample
        ├── __tests__
        │   └── index.unit.spec.ts
        ├── asconfig.json
        └── assembly
            └── index.ts
```
