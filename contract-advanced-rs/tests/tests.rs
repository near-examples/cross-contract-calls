pub mod helpers;

use near_sdk::near;
use serde_json::json;
use std::string::String;

#[tokio::test]
async fn test_contract_is_operational() -> Result<(), Box<dyn std::error::Error>> {
    let sandbox = near_sandbox::Sandbox::start_sandbox().await?;
    let sandbox_network =
        near_api::NetworkConfig::from_rpc_url("sandbox", sandbox.rpc_addr.parse()?);

    let alice = helpers::init_accounts(&sandbox).await?;
    let (hello_contract, guest_book_contract, counter_contract, contract, signer) =
        helpers::init_contracts(&sandbox, &sandbox_network).await?;

    #[derive(Debug, PartialEq)]
    #[near(serializers = [json])]
    pub struct PostedMessage {
        pub premium: bool,
        pub sender: String,
        pub text: String,
    }

    let expected_messages = vec![PostedMessage {
        premium: false,
        sender: alice.account_id().to_string(),
        text: "my message".parse().unwrap(),
    }];

    hello_contract
        .call_function("set_greeting", json!({ "greeting": "Howdy" }))
        .transaction()
        .with_signer(alice.account_id().clone(), signer.clone())
        .send_to(&sandbox_network)
        .await?
        .assert_success();

    guest_book_contract
        .call_function("add_message", json!({ "text": "my message" }))
        .transaction()
        .with_signer(alice.account_id().clone(), signer.clone())
        .send_to(&sandbox_network)
        .await?
        .assert_success();

    counter_contract
        .call_function("decrement", ())
        .transaction()
        .with_signer(alice.account_id().clone(), signer.clone())
        .send_to(&sandbox_network)
        .await?
        .assert_success();

    contract
        .call_function("multiple_contracts", ())
        .transaction()
        .with_signer(alice.account_id().clone(), signer.clone())
        .send_to(&sandbox_network)
        .await?
        .assert_success();

    let result = contract
        .call_function("multiple_contracts", ())
        .transaction()
        .with_signer(alice.account_id().clone(), signer.clone())
        .send_to(&sandbox_network)
        .await?
        .assert_success();

    let data = result.json::<(String, i8, Vec<PostedMessage>)>()?;
    assert_eq!(data.0, "Howdy".to_string());
    assert_eq!(data.1, -1);
    assert_eq!(data.2, expected_messages);

    let expected: Vec<String> = vec![
        "hi".parse().unwrap(),
        "howdy".parse().unwrap(),
        "bye".parse().unwrap(),
    ];

    let result = contract
        .call_function("similar_contracts", ())
        .transaction()
        .with_signer(alice.account_id().clone(), signer.clone())
        .send_to(&sandbox_network)
        .await?
        .assert_success();

    assert_eq!(result.json::<Vec<String>>()?, expected);

    let expected: String = "bye".parse().unwrap();
    let result = contract
        .call_function("batch_actions", ())
        .transaction()
        .with_signer(alice.account_id().clone(), signer.clone())
        .send_to(&sandbox_network)
        .await?
        .assert_success();

    assert_eq!(result.json::<String>()?, expected);

    Ok(())
}
