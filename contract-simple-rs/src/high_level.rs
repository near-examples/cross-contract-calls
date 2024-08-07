// Find all our documentation at https://docs.near.org
use near_sdk::ext_contract;
use near_sdk::{env, log, near, Promise, PromiseError};

use crate::{Contract, ContractExt, FIVE_TGAS};

// Validator interface, for cross-contract calls
#[ext_contract(hello_near)]
trait HelloNear {
    fn get_greeting(&self) -> String;
    fn set_greeting(&self, greeting: String);
}

#[near]
impl Contract {
    // Public - query external greeting
    pub fn hl_query_greeting(&self) -> Promise {
        // Create a promise to call HelloNEAR.get_greeting()
        let promise = hello_near::ext(self.hello_account.clone())
            .with_static_gas(FIVE_TGAS)
            .get_greeting();

        promise.then(
            // Create a promise to callback query_greeting_callback
            Self::ext(env::current_account_id())
                .with_static_gas(FIVE_TGAS)
                .hl_query_greeting_callback(),
        )
    }

    #[private] // Public - but only callable by env::current_account_id()
    pub fn hl_query_greeting_callback(
        &self,
        #[callback_result] call_result: Result<String, PromiseError>,
    ) -> String {
        // Check if the promise succeeded by calling the method outlined in external.rs
        if call_result.is_err() {
            log!("There was an error contacting Hello NEAR");
            return "".to_string();
        }

        // Return the greeting
        let greeting: String = call_result.unwrap();
        greeting
    }

    // Public - change external greeting
    pub fn hl_change_greeting(&mut self, new_greeting: String) -> Promise {
        // Create a promise to call HelloNEAR.set_greeting(message:string)
        hello_near::ext(self.hello_account.clone())
            .with_static_gas(FIVE_TGAS)
            .set_greeting(new_greeting)
            .then(
                // Create a callback change_greeting_callback
                Self::ext(env::current_account_id())
                    .with_static_gas(FIVE_TGAS)
                    .hl_change_greeting_callback(),
            )
    }

    #[private]
    pub fn hl_change_greeting_callback(
        &mut self,
        #[callback_result] call_result: Result<(), PromiseError>,
    ) -> bool {
        // Return whether or not the promise succeeded using the method outlined in external.rs
        if call_result.is_err() {
            env::log_str("set_greeting failed...");
            false
        } else {
            env::log_str("set_greeting was successful!");
            true
        }
    }
}