import { Worker, NearAccount } from 'near-workspaces';
import anyTest, { TestFn } from 'ava';
import { setDefaultResultOrder } from 'dns'; setDefaultResultOrder('ipv4first'); // temp fix for node >v17

// Global context
let worker: Worker;
let accounts: Record<string, NearAccount>;

const test = anyTest as TestFn<{}>;

test.before(async (t) => {
  // Init the worker and start a Sandbox server
  worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;
  
  // Create test accounts
  const alice = await root.createSubAccount("alice");
  const xcc = await root.createSubAccount("xcc");
  const helloNear = await root.createSubAccount("hello-near");

  // Deploy the hello near contract
  await helloNear.deploy("./sandbox-ts/hello-near/hello-near.wasm")

  // Deploy the xcc contract
  await xcc.deploy(process.argv[2]);
  await xcc.call(xcc, "init", {hello_account: helloNear.accountId})

  // Save state for test runs, it is unique for each test
  accounts = { root, alice, xcc, helloNear };
});

test.after.always(async (t) => {
  // Stop Sandbox server
  await worker.tearDown().catch((error) => {
    console.log('Failed to stop the Sandbox:', error);
  });
});

test("returns the default greeting", async (t) => {
  const { xcc, alice } = accounts;

  const greeting = await alice.call(xcc, "query_greeting", {}, { gas: "200000000000000" });
  console.log('greeting: ', greeting);
  t.is(greeting, 'Hello');
});

test("change the greeting", async (t) => {
  const { xcc, alice } = accounts;

  const howdyChangingResult = await alice.call(xcc, "change_greeting", { new_greeting: "Howdy" }, { gas: "200000000000000" });
  t.is(howdyChangingResult, true);

  const howdyResult = await alice.call(xcc, "query_greeting", {}, { gas: "200000000000000" });
  t.is(howdyResult, 'Howdy');
  
  // const helloChangingResult = await alice.call(xcc, "change_greeting", { new_greeting: "Hello" }, { gas: "200000000000000" });
  // t.is(helloChangingResult, true);

  // const helloResult = await alice.call(xcc, "query_greeting", {}, { gas: "200000000000000" });
  // t.is(helloResult, 'Hello');
});