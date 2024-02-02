import { Worker, NearAccount } from 'near-workspaces';
import anyTest, { TestFn } from 'ava';

const test = anyTest as TestFn<{
  worker: Worker;
  accounts: Record<string, NearAccount>;
}>;

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Prepare sandbox for tests, create accounts, deploy contracts, etx.
  const root = worker.rootAccount;
  
  // Create test account alice
  const alice = await root.createSubAccount("alice");
  const xcc = await root.createSubAccount("xcc");
  const helloNear = await root.createSubAccount("hello-near");

  // Deploy the hello near contract
  await helloNear.deploy("./src/hello-near/hello-near.wasm")

  // Deploy the xcc contract.
  await xcc.deploy(process.argv[2]);
  await xcc.call(xcc, "init", {hello_account: helloNear.accountId})

  // Save state for test runs, it is unique for each test
  t.context.worker = worker;
  t.context.accounts = {
    root,
    helloNear,
    xcc,
    alice,
  };
});

test.afterEach(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed tear down the worker:", error);
  });
});

test("returns the default greeting", async (t) => {
  const { xcc, alice } = t.context.accounts;

  const greeting = await alice.call(xcc, "query_greeting", {}, { gas: "200000000000000" });
  t.is(greeting, 'Hello');
});

test("change the greeting", async (t) => {
  const { xcc, alice } = t.context.accounts;

  const result = await alice.call(xcc, "change_greeting", { new_greeting: "Howdy" }, { gas: "200000000000000" });
  t.is(result, true);

  const howdy = await alice.call(xcc, "query_greeting", {}, { gas: "200000000000000" });
  t.is(howdy, 'Howdy');
});