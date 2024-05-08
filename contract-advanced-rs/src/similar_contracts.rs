// Find all our documentation at https://docs.near.org
use near_sdk::{env, log, near, serde_json::json, Promise, PromiseResult};

use crate::{Contract, ContractExt, NO_ARGS, NO_DEPOSIT, XCC_GAS};

#[near]
impl Contract {
    fn promise_set_get(&self, message: &str) -> Promise {
        // Aux method to create a batch transaction calling
        // set_message and get_message in the HELLO CONTRACT
        let args = json!({ "greeting": message }).to_string().into_bytes();

        Promise::new(self.hello_account.clone())
            .function_call("set_greeting".to_owned(), args, NO_DEPOSIT, XCC_GAS)
            .function_call("get_greeting".to_owned(), NO_ARGS, NO_DEPOSIT, XCC_GAS)
    }

    pub fn similar_contracts(&mut self) -> Promise {
        // Create promises to call 3 contracts that return the same type
        // For simplicity here we call the same contract
        let hello_one = self.promise_set_get("hi");
        let hello_two = self.promise_set_get("howdy");
        let hello_three = self.promise_set_get("bye");

        // Join all promises and chain a callback to collect their results.
        hello_one.and(hello_two).and(hello_three).then(
            Self::ext(env::current_account_id())
                .with_static_gas(XCC_GAS)
                .similar_contracts_callback(3),
        )
    }

    #[private]
    pub fn similar_contracts_callback(&self, number_promises: u64) -> Vec<String> {
        (0..number_promises)
            .filter_map(|index| {
                // env::promise_result(i) has the result of the i-th call
                let result = env::promise_result(index);

                match result {
                    PromiseResult::Failed => {
                        log!(format!("Promise number {index} failed."));
                        None
                    }
                    PromiseResult::Successful(value) => {
                        if let Ok(message) = near_sdk::serde_json::from_slice::<String>(&value) {
                            log!(format!("Call {index} returned: {message}"));
                            Some(message)
                        } else {
                            log!(format!("Error deserializing call {index} result."));
                            None
                        }
                    }
                }
            })
            .collect()
    }
}
