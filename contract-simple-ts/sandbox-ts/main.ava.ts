import { Worker, NearAccount } from 'near-workspaces';
import anyTest, { TestFn } from 'ava';
import { setDefaultResultOrder } from 'dns'; setDefaultResultOrder('ipv4first'); // temp fix for node >v17

// Global context
const test = anyTest as TestFn<{ worker: Worker, accounts: Record<string, NearAccount> }>;

test.beforeEach(async (t) => {
  // Create sandbox, accounts, deploy contracts, etc.
  const worker = t.context.worker = await Worker.init();
  
  // Get root account
  const root = worker.rootAccount;

  // Create test accounts
  const alice = await root.createSubAccount("alice");
  const xcc = await root.createSubAccount("xcc");
  const helloNear = await root.createSubAccount("hello-near");

  // Deploy the hello near contract
  await helloNear.deploy("./sandbox-ts/hello-near/hello-near.wasm");

  // Deploy the xcc contract
  await xcc.deploy(process.argv[2]);
  await xcc.call(xcc, "init", { hello_account: helloNear.accountId });

  // Save state for test runs, it is unique for each test
  t.context.accounts = { root, alice, xcc, helloNear };
});

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log('Failed to stop the Sandbox:', error);
  });
});

test("returns the default greeting", async (t) => {
  const { xcc, alice } = t.context.accounts;
  const greeting = await alice.call(xcc, "query_greeting", {}, { gas: "200000000000000" });
  t.is(greeting, 'Hello');
});

test("change the greeting", async (t) => {
  const { xcc, alice } = t.context.accounts;

  const howdyChangingResult = await alice.call(xcc, "change_greeting", { new_greeting: "Howdy" }, { gas: "200000000000000" });
  t.is(howdyChangingResult, true);

  const howdyResult = await alice.call(xcc, "query_greeting", {}, { gas: "200000000000000" });
  t.is(howdyResult, 'Howdy');
});