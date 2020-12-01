# Cross-contract calls

This repo is a collection of examples using cross-contract calls on the NEAR platform

## Getting started

1. clone this repo locally
2. `yarn` (or `npm install`)
3. yarn test:01 (or `npm run test:01`)
4. explore the contents of `/contracts/01.basic-calls`

See below for more convenience scripts ...

## Testing

### Unit Tests

**Run unit tests**

```sh
yarn test:unit                # asp --verbose --nologo -f unit.spec
```

**Run unit tests for individual examples**

```sh
yarn test:u:01                # run units tests for example 01
```

### Simulation Tests

**Run simulation tests**

```sh
yarn test:simulate            # jest --verbose -f simulate.spec --all
```

**Run simulation tests for individual examples**

```sh
yarn test:s:01                # run simulation tests for example 01
```

### All Tests

**Test all**

```sh
yarn test                     # yarn test:unit && test:simulate
```

Test individual example

```sh
yarn test:01                  # run unit and simulation tests for example 01
```
