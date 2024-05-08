// Find all our documentation at https://docs.near.org
use near_sdk::{env, log, near, serde_json::json, Promise, PromiseError};

use crate::{Contract, ContractExt, NO_ARGS, NO_DEPOSIT, XCC_GAS};

#[near(serializers=[borsh, json])]
#[derive(Debug)]
pub struct PostedMessage {
    pub premium: bool,
    pub sender: String,
    pub text: String,
}

#[near]
impl Contract {
    /// A method which calls different contracts via cross contract function calls.
    pub fn multiple_contracts(&mut self) -> Promise {
        // We create a promise that calls the `get_greeting` function on the HELLO_CONTRACT
        let hello_promise = Promise::new(self.hello_account.clone()).function_call(
            "get_greeting".to_owned(),
            NO_ARGS,
            NO_DEPOSIT,
            XCC_GAS,
        );

        // We create a promise that calls the `get_num` function on the COUNTER_CONTRACT
        let counter_promise = Promise::new(self.counter_account.clone()).function_call(
            "get_num".to_owned(),
            NO_ARGS,
            NO_DEPOSIT,
            XCC_GAS,
        );

        // We create a promise that calls the `get_messages` function on the GUESTBOOK_CONTRACT
        let args = json!({ "from_index": "0", "limit": 2 })
            .to_string()
            .into_bytes();

        let guestbook_promise = Promise::new(self.guestbook_account.clone()).function_call(
            "get_messages".to_owned(),
            args,
            NO_DEPOSIT,
            XCC_GAS,
        );

        // We join all promises and chain a callback to collect their results.
        hello_promise
            .and(counter_promise)
            .and(guestbook_promise)
            .then(
                Self::ext(env::current_account_id())
                    .with_static_gas(XCC_GAS)
                    .multiple_contracts_callback(),
            )
    }

    #[private]
    pub fn multiple_contracts_callback(
        &self,
        #[callback_result] hello_result: Result<String, PromiseError>,
        #[callback_result] counter_result: Result<i8, PromiseError>,
        #[callback_result] guestbook_result: Result<Vec<PostedMessage>, PromiseError>,
    ) -> (String, i8, Vec<PostedMessage>) {
        // The callback has access to the result of the 3 calls
        let greeting = if let Ok(result) = hello_result {
            log!(format!("HelloNear says {result}"));
            result
        } else {
            log!("The call to HelloNear failed");
            "".to_string()
        };

        let counter = if let Ok(result) = counter_result {
            log!(format!("Counter is {result}"));
            result
        } else {
            log!("The call to Counter failed");
            0
        };

        let messages = if let Ok(result) = guestbook_result {
            log!(format!("The messages are {result:?}"));
            result
        } else {
            log!("The call to GuestBook failed");
            vec![]
        };

        (greeting, counter, messages)
    }
}
