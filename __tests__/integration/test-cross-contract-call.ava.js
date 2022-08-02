import { Worker } from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy the onCall contract.
    const xcc = await root.devDeploy("./build/xcc.wasm");

    // Deploy status-message the contract.
    const helloNear = await root.createSubAccount("hello-near");
    helloNear.deploy("./extra/hello-near.wasm");

    // Create test account alice
    const alice = await root.createSubAccount("alice");

    // Initialize xcc
    xcc.call(xcc, "init", { hello_account: helloNear.accountId });

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

    const message = await alice.call(xcc, "query_greeting", {}, { gas: 200000000000000 });
    t.is(message, '"Hello"');
});

test("change the greeting", async (t) => {
    const { xcc, alice } = t.context.accounts;

    const result = await alice.call(xcc, "change_greeting", { new_greeting: "Howdy" }, { gas: 200000000000000 });
    t.is(result, true);

    const howdy = await alice.call(xcc, "query_greeting", {}, { gas: 200000000000000 });
    t.is(howdy, '"Howdy"');
});
