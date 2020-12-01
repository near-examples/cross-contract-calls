const {
  Runtime
} = require("near-sdk-simulator")
const {
  setup,
  simulate,
} = require('../../simulation-helpers')
const path = require("path");

const LOCAL_CONTRACT = path.join(__dirname, "/../../../build/release/00-local.wasm");
const REMOTE_CONTRACT = path.join(__dirname, "/../../../build/release/00-remote.wasm");

describe("00.orientation", () => {
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
        local: LOCAL_CONTRACT
      },
      {
        remote: REMOTE_CONTRACT
      },
    ])
  });

  afterEach(() => {
    accounts.local.state = {};
    accounts.remote.state = {};
  });

  ['high', 'mid', 'low'].map(level => {
    describe(`xcc__${level}_level()`, () => {
      it("makes remote call and captures return value of remote method", () => {

        const local_method = 'xcc'
        const remote_account = 'remote'
        const remote_method = 'do_some_work'

        const transaction = {
          signer: accounts.alice,
          contract: accounts.local,
          method: {
            type: 'call',
            name: local_method,
            params: {
              level,
              account: remote_account,
              method: remote_method,
            },
          },
        };

        const {
          data,
          calls,
          // } = simulate(transaction);
        } = simulate(transaction, true); // adding a truthy second parameter prints out the state of the virtual machine

        // we expect to see the result from the remote call captured as the return value of this call
        expect(data).toBe('some result') // whatever the return of the remote method is

        // we expect two method calls to be recorded:
        // - one to the initial method
        // - and one to the remote method
        expect(calls.length).toBe(2)

        // we can check for a series of ordered cross-contract calls
        // 'index.account_id.signer_account_id.predecessor_account_id.method_name'
        ;
        [
          `0.local.alice..${local_method}`,
          `1.remote.alice.local.${remote_method}`,
        ].map(call => {
          const [step, account, signer, predecessor, method] = call.split('.')

          expect(calls[step]).toHaveProperty('account_id', account)
          expect(calls[step]).toHaveProperty('signer_account_id', signer)
          expect(calls[step]).toHaveProperty('method_name', method)

          if (parseInt(step) > 0) {
            expect(calls[step]).toHaveProperty('predecessor_account_id', predecessor)
          }
        })
      });
    });
  })
});
