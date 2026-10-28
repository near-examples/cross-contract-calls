#[path = "../../test-utils/mod.rs"]
mod common;

use common::{build_contract, TestResult, TestSandbox};
use serde_json::json;

#[tokio::test]
async fn high_and_low_level_cross_contract_calls() -> TestResult {
    let hello_wasm = build_contract("tests/hello-near/Cargo.toml")?;
    let contract_wasm = build_contract("Cargo.toml")?;
    let sandbox = TestSandbox::start().await?;
    let hello = sandbox.deploy("hello.sandbox", hello_wasm).await?;
    let contract = sandbox
        .deploy("cross-contract.sandbox", contract_wasm)
        .await?;
    let alice = sandbox.create_account("alice.sandbox").await?;
    sandbox
        .call(
            &contract,
            &contract,
            "init",
            json!({ "hello_account": hello }),
        )
        .await?;

    let greeting = sandbox
        .call(&alice, &contract, "hl_query_greeting", json!({}))
        .await?;
    assert_eq!(greeting, json!("Hello"));

    let changed = sandbox
        .call(
            &alice,
            &contract,
            "hl_change_greeting",
            json!({ "new_greeting": "Howdy" }),
        )
        .await?;
    assert_eq!(changed, json!(true));
    let greeting = sandbox
        .call(&alice, &contract, "hl_query_greeting", json!({}))
        .await?;
    assert_eq!(greeting, json!("Howdy"));

    let changed = sandbox
        .call(
            &alice,
            &contract,
            "ll_change_greeting",
            json!({ "new_greeting": "Hello" }),
        )
        .await?;
    assert_eq!(changed, json!(true));
    let greeting = sandbox
        .call(&alice, &contract, "ll_query_greeting", json!({}))
        .await?;
    assert_eq!(greeting, json!("Hello"));
    Ok(())
}
