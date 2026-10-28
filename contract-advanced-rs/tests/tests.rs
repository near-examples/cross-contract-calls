#[path = "../../test-utils/mod.rs"]
mod common;

use common::{build_contract, TestResult, TestSandbox};
use serde_json::json;

#[tokio::test]
async fn parallel_calls_and_batched_actions() -> TestResult {
    let hello_wasm = build_contract("tests/contracts/hello-near/Cargo.toml")?;
    let contract_wasm = build_contract("Cargo.toml")?;
    let sandbox = TestSandbox::start().await?;
    let hello = sandbox.deploy("hello.sandbox", hello_wasm).await?;
    let guestbook = sandbox
        .deploy(
            "guestbook.sandbox",
            std::fs::read("tests/contracts/guest-book.wasm")?,
        )
        .await?;
    let counter = sandbox
        .deploy(
            "counter.sandbox",
            std::fs::read("tests/contracts/counter.wasm")?,
        )
        .await?;
    let contract = sandbox
        .deploy("cross-contract.sandbox", contract_wasm)
        .await?;
    let alice = sandbox.create_account("alice.sandbox").await?;
    sandbox
        .call(
            &contract,
            &contract,
            "init",
            json!({
                "hello_account": hello, "guestbook_account": guestbook, "counter_account": counter,
            }),
        )
        .await?;

    sandbox
        .call(
            &alice,
            &hello,
            "set_greeting",
            json!({ "greeting": "Howdy" }),
        )
        .await?;
    sandbox
        .call(
            &alice,
            &guestbook,
            "add_message",
            json!({ "text": "my message" }),
        )
        .await?;
    sandbox
        .call(&alice, &counter, "decrement", json!({}))
        .await?;
    let combined = sandbox
        .call(&alice, &contract, "multiple_contracts", json!({}))
        .await?;
    assert_eq!(
        combined,
        json!(["Howdy", -1, [{
            "premium": false, "sender": alice, "text": "my message",
        }]])
    );

    let greetings = sandbox
        .call(&alice, &contract, "similar_contracts", json!({}))
        .await?;
    assert_eq!(greetings, json!(["hi", "howdy", "bye"]));

    let last_greeting = sandbox
        .call(&alice, &contract, "batch_actions", json!({}))
        .await?;
    assert_eq!(last_greeting, json!("bye"));
    Ok(())
}
