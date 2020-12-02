#![allow(dead_code, unused_variables)]
mod local;
mod remote;
pub use local::*;
pub use remote::*;

#[cfg(test)]
mod test {
    use near_sdk_sim::{call, deploy, init_simulator, to_yocto, ContractAccount, UserAccount};
    use super::*;

    // Load in contract bytes
    near_sdk_sim::lazy_static! {
      static ref LOCAL_WASM_BYTES: &'static [u8] = include_bytes!("../../../../build/release/00-local.wasm").as_ref();
      static ref REMOTE_WASM_BYTES: &'static [u8] = include_bytes!("../../../../build/release/00-remote.wasm").as_ref();
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
        let local_contract = deploy!(
            // Contract Proxy
            contract: LocalContract,
            // Contract account id
            contract_id: "local",
            // Bytes of contract
            bytes: &LOCAL_WASM_BYTES,
            // User deploying the contract,
            signer_account: master_account
        );
        let remote_contract = deploy!(
            // Contract Proxy
            contract: RemoteContract,
            // Contract account id
            contract_id: "remote",
            // Bytes of contract
            bytes: &REMOTE_WASM_BYTES,
            // User deploying the contract,
            signer_account: master_account
        );

        (master_account, local_contract, remote_contract)
    }
    #[test]
    fn low_level() {
        let initial_balance = to_yocto("100000");
        let (master_account, local, _remote) = init(initial_balance);
        let res = call!(
            master_account,
            local.xcc("low", "remote", "do_some_work", "")
        );
        println!("{:#?}\n{:#?}\n{:#?}\n", res, res.promise_results(), res.unwrap_json::<String>());
        let res = call!(
            master_account,
            local.xcc("low", "remote", "do_some_work", "")
        );
        println!("{:#?}\n{:#?}\n{:#?}\n", res, res.promise_results(), res.unwrap_json::<String>());
    }

    #[test]
    fn high_level() {
        let initial_balance = to_yocto("100000");
        let (master_account, local, _remote) = init(initial_balance);
        let res = call!(
            master_account,
            local.xcc("high", "remote", "do_some_work", "")
        );
        println!("{:#?}\n{:#?}\n{:#?}\n", res, res.promise_results(), res.unwrap_json::<String>());
        let res = call!(
            master_account,
            local.xcc("high", "remote", "do_some_work", "")
        );
        println!("{:#?}\n{:#?}\n{:#?}\n", res, res.promise_results(), res.unwrap_json::<String>());
    }

    #[test]
    fn mid_level() {
        let initial_balance = to_yocto("100000");
        let (master_account, local, _remote) = init(initial_balance);
        let res = call!(
            master_account,
            local.xcc("mid", "remote", "do_some_work", "")
        );
        println!("{:#?}\n{:#?}\n{:#?}\n", res, res.promise_results(), res.unwrap_json::<String>());
        let res = call!(
            master_account,
            local.xcc("mid", "remote", "do_some_work", "")
        );
        println!("{:#?}\n{:#?}\n{:#?}\n", res, res.promise_results(), res.unwrap_json::<String>());
    }
}
