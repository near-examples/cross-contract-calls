import { Worker, NearAccount } from 'near-workspaces';
import anyTest, { TestFn } from 'ava';
import { setDefaultResultOrder } from 'dns'; setDefaultResultOrder('ipv4first'); // temp fix for node >v17

// Global context
const test = anyTest as TestFn<{ worker: Worker, accounts: Record<string, NearAccount> }>;

type PremiumMessage = { premium: boolean; sender: string; text: string };

test.beforeEach(async (t) => {
  // Create sandbox, accounts, deploy contracts, etc.
  const worker = t.context.worker = await Worker.init();

  // Get root account
  const root = worker.rootAccount;

  // Create test accounts
  const alice = await root.createSubAccount("alice");
  const xcc = await root.createSubAccount("xcc");
  const helloNear = await root.createSubAccount("hello-near");
  const guestBook = await root.createSubAccount("guest-book");
  const counter = await root.createSubAccount("counter");

  // Deploy external contracts
  await helloNear.deploy("./sandbox-ts/external-contracts/hello-near.wasm");
  await guestBook.deploy("./sandbox-ts/external-contracts/guest-book.wasm");
  await counter.deploy("./sandbox-ts/external-contracts/counter.wasm");

  // Deploy the xcc contract
  await xcc.deploy(process.argv[2]);
  await xcc.call(xcc, "init", {
    hello_account: helloNear.accountId,
    counter_account: counter.accountId,
    guestbook_account: guestBook.accountId,
  });

  // Save state for test runs, it is unique for each test
  t.context.accounts = {
    xcc,
    alice,
    helloNear,
    counter,
    guestBook,
  };
});

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed tear down the worker:", error);
  });
});

test("multiple_contract", async (t) => {
  const { xcc, alice, helloNear, counter, guestBook } = t.context.accounts;

  await alice.call(counter, "decrement", {});
  await alice.call(helloNear, "set_greeting", { greeting: "Howdy" });
  await alice.call(
    guestBook,
    "add_message",
    { text: "my message" },
    { gas: "40000000000000" }
  );

  const results: [string, string, [PremiumMessage]] = await alice.call(
    xcc,
    "multiple_contracts",
    {},
    { gas: "300000000000000" }
  );

  const expected = {
    premium: false,
    sender: "alice.test.near",
    text: "my message",
  };

  t.is(results[0], '"Howdy"');
  t.is(results[1], '-1');
  t.deepEqual(results[2], JSON.stringify([expected]));
  t.pass();
});

test("similar_contracts", async (t) => {
  const { xcc, alice } = t.context.accounts;

  const results: [[string]] = await alice.call(
    xcc,
    "similar_contracts",
    {},
    { gas: "300000000000000" }
  );

  const expected = ['"hi"', '"howdy"', '"bye"'];

  t.deepEqual(results, expected);
});

test("batch_actions", async (t) => {
  const { xcc, alice } = t.context.accounts;

  const result: string = await alice.call(
    xcc,
    "batch_actions",
    {},
    { gas: "300000000000000" }
  );

  t.deepEqual(result, '"bye"');
});
