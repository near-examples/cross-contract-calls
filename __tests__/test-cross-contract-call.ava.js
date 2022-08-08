import { Worker } from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
    // Init the worker and start a Sandbox server
    const worker = await Worker.init();

    // Prepare sandbox for tests, create accounts, deploy contracts, etx.
    const root = worker.rootAccount;

    // Deploy status-message the contract.
    const helloNear = await root.devDeploy("./extra/hello-near.wasm");

    // Deploy the onCall contract.
    const xcc = await root.devDeploy("./build/contract.wasm", { method: "init", args: {helloAccount: helloNear.accountId} });
    
    // Create test account alice
    const alice = await root.createSubAccount("alice");

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

    const message = await alice.call(xcc, "queryGreeting", {}, { gas: 200000000000000 });
    t.is(message, '"Hello"');
});

test("change the greeting", async (t) => {
    const { xcc, alice } = t.context.accounts;

    const result = await alice.call(xcc, "changeGreeting", { newGreeting: "Howdy" }, { gas: 200000000000000 });
    t.is(result, true);

    const howdy = await alice.call(xcc, "queryGreeting", {}, { gas: 200000000000000 });
    t.is(howdy, '"Howdy"');
});
