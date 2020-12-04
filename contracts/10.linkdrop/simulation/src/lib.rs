#![allow(dead_code, unused_variables)]
mod local;
mod remote;
pub use local::*;
pub use remote::*;

use near_sdk::json_types::{Base58PublicKey, U128};

#[cfg(test)]
mod test {
    use near_sdk_sim::{call, deploy, init_simulator, to_yocto, ContractAccount, UserAccount};
    use super::*;

    // Load in contract bytes
    near_sdk_sim::lazy_static! {
      static ref LINKDROP_WASM_BYTES: &'static [u8] = include_bytes!("../../../../build/debug/10.wasm").as_ref();
    }

    fn init(
        initial_balance: u128,
    ) -> (
        UserAccount,
        ContractAccount<LocalContract>,
        ContractAccount<RemoteContract>,
    ) {
        let master_account = init_simulator(None);
        // uses default values for deposit and gas
        let linkdrop_contract = deploy!(
            // Contract Proxy
            contract: LocalContract,
            // Contract account id
            contract_id: "linkdrop",
            // Bytes of contract
            bytes: &LINKDROP_WASM_BYTES,
            // User deploying the contract,
            signer_account: master_account
        );

        (master_account, linkdrop_contract)
    }
    #[test]
    fn test_create_account() {
        let initial_balance = to_yocto("100000");
        let (master_account, linkdrop) = init(initial_balance);
        let pk: Base58PublicKey = "qSq3LoufLvTCTNGC3LJePMDGrok8dHMQ5A1YD9psbiz";
        let res = call!(
            master_account,
            linkdrop.create_account("bob", pk)
        );
        println!("{:#?}\n{:#?}\n{:#?}\n", res, res.promise_results(), res.unwrap_json::<String>());
    }
}
