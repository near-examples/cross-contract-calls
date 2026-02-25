use near_api::{Account, AccountId, Contract, NearToken, NetworkConfig, Signer};
use near_sandbox::Sandbox;
use near_sdk::serde_json::json;
use std::sync::Arc;

pub async fn init_sandbox() -> anyhow::Result<(Sandbox, NetworkConfig)> {
    // Initialize the sandbox
    let sandbox = near_sandbox::Sandbox::start_sandbox().await?;
    let sandbox_network =
        near_api::NetworkConfig::from_rpc_url("sandbox", sandbox.rpc_addr.parse()?);

    Ok((sandbox, sandbox_network))
}

pub async fn init_accounts(sandbox: &Sandbox) -> anyhow::Result<Account> {
    // create accounts
    let alice = create_subaccount(&sandbox, "alice.sandbox").await.unwrap();

    return Ok(alice);
}

pub async fn init_contracts(
    sandbox: &Sandbox,
    sandbox_network: &NetworkConfig,
) -> anyhow::Result<(Contract, Contract, Contract, Contract, Arc<Signer>)> {
    let hello_contract = create_subaccount(&sandbox, "hello.sandbox")
        .await
        .unwrap()
        .as_contract();
    let guest_book_contract = create_subaccount(&sandbox, "guest-bookhello.sandbox")
        .await
        .unwrap()
        .as_contract();
    let counter_contract = create_subaccount(&sandbox, "counter.sandbox")
        .await
        .unwrap()
        .as_contract();
    let contract = create_subaccount(&sandbox, "contract.sandbox")
        .await
        .unwrap()
        .as_contract();

    // Build hello contract
    let hello_contract_wasm_path = cargo_near_build::build_with_cli(
        cargo_near_build::BuildOpts::builder()
            .manifest_path("./tests/contracts/hello-near/Cargo.toml")
            .build(),
    )
    .unwrap();
    let hello_contract_wasm = std::fs::read(hello_contract_wasm_path)?;

    // Build guest-book contract
    let guest_book_contract_wasm_path = "./tests/contracts/guest-book.wasm";
    let guest_book_contract_wasm = std::fs::read(guest_book_contract_wasm_path)?;

    // Build counter contract
    let counter_contract_wasm_path = "./tests/contracts/counter.wasm";
    let counter_contract_wasm = std::fs::read(counter_contract_wasm_path)?;

    // Build contract
    let contract_wasm_path = cargo_near_build::build_with_cli(Default::default()).unwrap();
    let contract_wasm = std::fs::read(contract_wasm_path)?;

    // Initialize signer for the contract deployment
    let signer = near_api::Signer::from_secret_key(
        near_sandbox::config::DEFAULT_GENESIS_ACCOUNT_PRIVATE_KEY
            .parse()
            .unwrap(),
    )?;

    // Deploy contracts
    near_api::Contract::deploy(hello_contract.account_id().clone())
        .use_code(hello_contract_wasm)
        .without_init_call()
        .with_signer(signer.clone())
        .send_to(&sandbox_network)
        .await?
        .assert_success();
    near_api::Contract::deploy(guest_book_contract.account_id().clone())
        .use_code(guest_book_contract_wasm)
        .without_init_call()
        .with_signer(signer.clone())
        .send_to(&sandbox_network)
        .await?
        .assert_success();
    near_api::Contract::deploy(counter_contract.account_id().clone())
        .use_code(counter_contract_wasm)
        .without_init_call()
        .with_signer(signer.clone())
        .send_to(&sandbox_network)
        .await?
        .assert_success();
    near_api::Contract::deploy(contract.account_id().clone())
      .use_code(contract_wasm)
      .with_init_call("init", json!({ "hello_account": hello_contract.account_id(), "guestbook_account": guest_book_contract.account_id(), "counter_account": counter_contract.account_id() }))?
      .with_signer(signer.clone())
      .send_to(&sandbox_network)
      .await?
      .assert_success();
    return Ok((
        hello_contract,
        guest_book_contract,
        counter_contract,
        contract,
        signer,
    ));
}

async fn create_subaccount(
    sandbox: &near_sandbox::Sandbox,
    name: &str,
) -> testresult::TestResult<near_api::Account> {
    let account_id: AccountId = name.parse().unwrap();
    sandbox
        .create_account(account_id.clone())
        .initial_balance(NearToken::from_near(10))
        .send()
        .await?;
    Ok(near_api::Account(account_id))
}
