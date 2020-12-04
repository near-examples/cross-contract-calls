const {
  Runtime
} = require("near-sdk-simulator")
const {
  setup,
  expectToFind,
  simulate,
  resolveError
} = require('../../simulation-helpers')
const path = require("path");

const WASM_FILE = path.join(__dirname, "/../../../build/debug/10.wasm");

describe("Linkdrop ", () => {
  const users = ["alice", "bob", "carol"];
  let accounts

  beforeAll(() => {
    accounts = setup(new Runtime(), [
      // user accounts are strings of the format 'name'
      'alice',
      'bob',
      'carol',
      // contract accounts are objects of the format { name: contract }
      {
        linkdrop: WASM_FILE
      },
    ])
  });

  afterEach(() => {
    accounts.linkdrop.state = {};
  });

  describe("create_account()", () => {
    it("allows the creation of a valid account", () => {
      let pk = "qSq3LoufLvTCTNGC3LJePMDGrok8dHMQ5A1YD9psbiz"
      let deposit = 1000000

      const transaction = {
        signer: accounts.alice,
        contract: accounts.linkdrop,
        method: {
          type: "call_",
          name: "create_account",
          params: {
            new_account_id: 'bob',
            new_public_key: pk
          }
        },
        attached_deposit: deposit
      };

      // @willem: this doesn't even begin to work bc of the ContractPromiseBatch stuff, right?
      //          that was your point the other day: why we need to use the new Rust simulator
      //
      // Error: reciept actions must have length 1
      simulate(transaction, true);

    })
  })
});
