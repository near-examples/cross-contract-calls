pub mod helpers;

use serde_json::json;

#[tokio::test]
async fn test_contract_is_operational() -> Result<(), Box<dyn std::error::Error>> {
    let sandbox = near_sandbox::Sandbox::start_sandbox().await?;
    let sandbox_network =
        near_api::NetworkConfig::from_rpc_url("sandbox", sandbox.rpc_addr.parse()?);
    let alice = helpers::init_accounts(&sandbox).await?;
    let (_, contract, signer) = helpers::init_contracts(&sandbox, &sandbox_network).await?;

    let res = contract
        .call_function("hl_query_greeting", ())
        .transaction()
        .with_signer(alice.account_id().clone(), signer.clone())
        .send_to(&sandbox_network)
        .await?
        .assert_success();

    assert_eq!(res.json::<String>()?, "Hello".to_string());

    contract
        .call_function("hl_change_greeting", json!({ "new_greeting": "Howdy" }))
        .transaction()
        .with_signer(alice.account_id().clone(), signer.clone())
        .send_to(&sandbox_network)
        .await?
        .assert_success();

    let res = contract
        .call_function("hl_query_greeting", ())
        .transaction()
        .with_signer(alice.account_id().clone(), signer.clone())
        .send_to(&sandbox_network)
        .await?
        .assert_success();

    assert_eq!(res.json::<String>()?, "Howdy".to_string());

    contract
        .call_function("ll_change_greeting", json!({ "new_greeting": "Hello" }))
        .transaction()
        .with_signer(alice.account_id().clone(), signer.clone())
        .send_to(&sandbox_network)
        .await?
        .assert_success();

    let res = contract
        .call_function("ll_query_greeting", ())
        .transaction()
        .with_signer(alice.account_id().clone(), signer.clone())
        .send_to(&sandbox_network)
        .await?
        .assert_success();

    assert_eq!(res.json::<String>()?, "Hello".to_string());

    Ok(())
}
