use std::string::String;
use serde_json::json;
use near_workspaces::{types::NearToken, Account, Contract};
use near_sdk::serde::{Deserialize, Serialize};
 
#[tokio::test]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let worker = near_workspaces::sandbox().await?;
    // Deploy hello contract
    let hello_contract_wasm = std::fs::read("./tests/external-contracts/hello-near.wasm")?;
    let hello_contract = worker.dev_deploy(&hello_contract_wasm).await?;
    // Deploy guest-book contract
    let guest_book_contract_wasm = std::fs::read("./tests/external-contracts/guest-book.wasm")?;
    let guest_book_contract = worker.dev_deploy(&guest_book_contract_wasm).await?;
    // Deploy counter contract
    let counter_contract_wasm = std::fs::read("./tests/external-contracts/counter.wasm")?;
    let counter_contract = worker.dev_deploy(&counter_contract_wasm).await?;
    // Deploy contract for testing
    let contract_wasm = near_workspaces::compile_project("./").await?;
    let contract = worker.dev_deploy(&contract_wasm).await?;
 
    // Create accounts
    let account = worker.dev_create_account().await?;
    let alice = account
        .create_subaccount("alice")
        .initial_balance(NearToken::from_near(30))
        .transact()
        .await?
        .into_result()?;

    // Init contract
    let _ = contract
        .call("init")
        .args_json(json!({
          "hello_account": hello_contract.id(),
          "guestbook_account": guest_book_contract.id(),
          "counter_account": counter_contract.id(),
        }))
        .transact()
        .await?
        .into_result()?;
 
    // Begin tests
    test_multiple_contracts(&alice, &contract, &hello_contract, &guest_book_contract, &counter_contract).await?;
    test_similar_contracts(&alice, &contract).await?;
    test_batch_actions(&alice, &contract).await?;
    Ok(())
}

async fn test_multiple_contracts(
    user: &Account,
    contract: &Contract,
    hello_contract: &Contract,
    guest_book_contract: &Contract,
    counter_contract: &Contract
) -> Result<(), Box<dyn std::error::Error>> {
    #[derive(Deserialize, Serialize, Debug, PartialEq)]
    #[serde(crate = "near_sdk::serde")]
    pub struct PostedMessage {
        pub premium: bool,
        pub sender: String,
        pub text: String,
    }

    let expected_messages = vec![PostedMessage {
        premium: false,
        sender: user.id().to_string(),
        text: "my message".parse().unwrap(),
    }];

    let _ = user
        .call(hello_contract.id(), "set_greeting")
        .args_json(json!({ "greeting": "Howdy" }))
        .max_gas()
        .transact()
        .await?;

    let _ = user
        .call(guest_book_contract.id(), "add_message")
        .args_json(json!({ "text": "my message" }))
        .max_gas()
        .transact()
        .await?;

    let _ = user
        .call(counter_contract.id(), "decrement")
        .args_json(json!({}))
        .max_gas()
        .transact()
        .await?;

    let result: (String, i8, Vec<PostedMessage>) = user
        .call(contract.id(), "multiple_contracts")
        .args_json(json!({}))
        .max_gas()
        .transact()
        .await?
        .json()?;
 
    assert_eq!(result.0, "Howdy".to_string());
    assert_eq!(result.1, -1);
    assert_eq!(result.2, expected_messages);
    Ok(())
}

async fn test_similar_contracts(
  user: &Account,
  contract: &Contract
) -> Result<(), Box<dyn std::error::Error>> {
  let expected: Vec<String> = vec![
      "hi".parse().unwrap(),
      "howdy".parse().unwrap(),
      "bye".parse().unwrap()
  ];

  let result: Vec<String> = user
      .call(contract.id(), "similar_contracts")
      .args_json(json!({}))
      .max_gas()
      .transact()
      .await?
      .json()?;

  assert_eq!(result, expected);
  Ok(())
}

async fn test_batch_actions(
  user: &Account,
  contract: &Contract
) -> Result<(), Box<dyn std::error::Error>> {
  let expected: String = "bye".parse().unwrap();
  let result: String = user
      .call(contract.id(), "batch_actions")
      .args_json(json!({}))
      .max_gas()
      .transact()
      .await?
      .json()?;

  assert_eq!(result, expected);
  Ok(())
}