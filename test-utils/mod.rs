use std::sync::Arc;

use near_api::{AccountId, Contract, NearGas, NearToken, NetworkConfig, Signer};
use near_sandbox::Sandbox;
use serde_json::Value;

pub type TestResult<T = ()> = Result<T, Box<dyn std::error::Error>>;

pub fn build_contract(manifest: &str) -> TestResult<Vec<u8>> {
    let artifact = cargo_near_build::build_with_cli(cargo_near_build::BuildOpts {
        manifest_path: Some(manifest.into()),
        no_abi: true,
        no_embed_abi: true,
        no_locked: true,
        ..Default::default()
    })?;
    Ok(std::fs::read(artifact)?)
}

pub struct TestSandbox {
    sandbox: Sandbox,
    network: NetworkConfig,
    signer: Arc<Signer>,
}

impl TestSandbox {
    pub async fn start() -> TestResult<Self> {
        let sandbox = Sandbox::start_sandbox().await?;
        let network = NetworkConfig::from_rpc_url("sandbox", sandbox.rpc_addr.parse()?);
        let signer = Signer::from_secret_key(
            near_sandbox::config::DEFAULT_GENESIS_ACCOUNT_PRIVATE_KEY.parse()?,
        )?;
        Ok(Self {
            sandbox,
            network,
            signer,
        })
    }

    pub async fn create_account(&self, name: &str) -> TestResult<AccountId> {
        let id: AccountId = name.parse()?;
        self.sandbox
            .create_account(id.clone())
            .initial_balance(NearToken::from_near(30))
            .send()
            .await?;
        Ok(id)
    }

    pub async fn deploy(&self, name: &str, wasm: Vec<u8>) -> TestResult<AccountId> {
        let id = self.create_account(name).await?;
        Contract::deploy(id.clone())
            .use_code(wasm)
            .without_init_call()
            .with_signer(self.signer.clone())
            .send_to(&self.network)
            .await?
            .into_result()?;
        Ok(id)
    }

    // Promise-returning methods need transactions even when their eventual result
    // is a greeting. Decode the final callback result and propagate execution failures.
    pub async fn call(
        &self,
        user: &AccountId,
        contract: &AccountId,
        method: &str,
        args: Value,
    ) -> TestResult<Value> {
        let result = Contract(contract.clone())
            .call_function(method, args)
            .transaction()
            .gas(NearGas::from_tgas(300))
            .with_signer(user.clone(), self.signer.clone())
            .send_to(&self.network)
            .await?
            .into_result()?;
        if result.raw_bytes()?.is_empty() {
            Ok(Value::Null)
        } else {
            Ok(result.json()?)
        }
    }
}
