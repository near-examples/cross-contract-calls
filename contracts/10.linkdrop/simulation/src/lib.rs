#![allow(dead_code, unused_variables)]
mod linkdrop;
pub use linkdrop::*;

#[cfg(test)]
mod test {
    use near_sdk::{serde_json::json, json_types::{Base58PublicKey}};//, U128};
    use near_sdk_sim::near_crypto::{InMemorySigner, KeyType};
    use std::convert::TryInto;

    use near_sdk_sim::{call, deploy, init_simulator, to_yocto, ContractAccount, UserAccount};
    use super::*;

    // Load in contract bytes
    near_sdk_sim::lazy_static! {
      static ref LINKDROP_WASM_BYTES: &'static [u8] = include_bytes!("../../../../build/debug/10.wasm").as_ref();
    }

    fn init() -> (
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
    // #[test]
    // fn test_create_account() {
    //     let initial_balance = to_yocto(STORAGE_AMOUNT);
    //     let (master_account, linkdrop) = init(initial_balance);
    //     let pk: Base58PublicKey = "qSq3LoufLvTCTNGC3LJePMDGrok8dHMQ5A1YD9psbiz"
    //     .try_into()
    //     .unwrap();
    //     let res = call!(
    //         master_account,
    //         linkdrop.create_account("bob", "qSq3LoufLvTCTNGC3LJePMDGrok8dHMQ5A1YD9psbiz")
    //     );
    //     println!("{:#?}\n{:#?}\n{:#?}\n", res, res.promise_results(), res.unwrap_json::<String>());
    // }

    #[test]
    fn test_drop_claim() {

        // some giver creates a keypair
        // giver calls linkdrop.send(public_key) and attaches 100 NEAR

        // later ...

        // private key signs a Tx ...
        // to call claim_and_create_account(new_account, new_key)

        let (master_account, linkdrop) = init();

        let sender = InMemorySigner::from_seed("linkdrop", KeyType::ED25519, "sender");
        let receiver_id = InMemorySigner::from_seed("bob", KeyType::ED25519, "receiver_id");
        let pk_str = sender.public_key.to_string();
        println!("Public Key: {}", pk_str);

        // Deposit money to linkdrop contract.
        let ACCESS_KEY_ALLOWANCE: u128 = to_yocto("1"); // 1 NEAR

        // 2_428_189_312_141

        let res = call!(
            master_account,
            linkdrop.send(&pk_str),
            deposit = ACCESS_KEY_ALLOWANCE * 1000
        );
        println!("{:#?}\n{:#?}\n", res, res.promise_results());


        let temp_linkdrop = linkdrop.user_account.switch_signer(sender);


        let res = call! (
          temp_linkdrop,
          linkdrop.create_account_and_claim(&"bob", &receiver_id.public_key.to_string())
        );
        res.assert_success();
        let bob = master_account.switch_signer(receiver_id);


        println!("{:#?}\n{:#?},\n{:#?}\n", res, bob.account(), res.promise_errors());

    }
}
