#![allow(dead_code, unused_variables)]
mod linkdrop;
pub use linkdrop::*;

use near_sdk::json_types::{Base58PublicKey, U128};

#[cfg(test)]
mod test {
    use std::convert::TryInto;

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
        ContractAccount<LinkdropContract>,
    ) {
        let master_account = init_simulator(None);
        // uses default values for deposit and gas
        let linkdrop_contract = deploy!(
            // Contract Proxy
            contract: LinkdropContract,
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
        let pk: Base58PublicKey = "qSq3LoufLvTCTNGC3LJePMDGrok8dHMQ5A1YD9psbiz"
        .try_into()
        .unwrap();
        let res = call!(
            master_account,
            linkdrop.create_account("bob", "qSq3LoufLvTCTNGC3LJePMDGrok8dHMQ5A1YD9psbiz")
        );
        println!("{:#?}\n{:#?}\n{:#?}\n", res, res.promise_results(), res.unwrap_json::<String>());
    }

    #[test]
    fn test_drop_claim() {
        let initial_balance = to_yocto("100000");
        let (master_account, linkdrop) = init(initial_balance);

        let pk_str = "qSq3LoufLvTCTNGC3LJePMDGrok8dHMQ5A1YD9psbiz";
        let pk: Base58PublicKey = pk_str.try_into().unwrap();
        let ACCESS_KEY_ALLOWANCE: u128 = 10 ^ 24; // 1 NEAR
        let deposit = ACCESS_KEY_ALLOWANCE * 100;
        linkdrop.send(pk_str);

        // let context = VMContextBuilder::new()
        // .current_account_id(linkdrop())
        // .predecessor_account_id(linkdrop())
        // .signer_account_pk(pk.into())
        // .account_balance(deposit)
        // .finish();
        // testing_env!(context);
        // let pk2 = "2S87aQ1PM9o6eBcEXnTR5yBAVRTiNmvj8J8ngZ6FzSca"
        //     .try_into()
        //     .unwrap();
        // contract.create_account_and_claim(bob(), pk2);
        // // TODO: verify that proper promises were created.
    }

}
