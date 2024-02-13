use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{near_bindgen, AccountId, Balance, Gas};

mod batch_actions;
mod multiple_contracts;
mod similar_contracts;

const XCC_GAS: Gas = Gas(10u64.pow(13));
const NO_DEPOSIT: Balance = 0;
const NO_ARGS: Vec<u8> = vec![];
const HELLO_CONTRACT: &str = "hello.near-examples.testnet";
const COUNTER_CONTRACT: &str = "counter.near-examples.testnet";
const GUESTBOOK_CONTRACT: &str = "guestbook.near-examples.testnet";

// Define the contract structure
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Contract {
    pub hello_account: AccountId,
    pub counter_account: AccountId,
    pub guestbook_account: AccountId,
}

impl Default for Contract {
    fn default() -> Self {
        Self {
            hello_account: HELLO_CONTRACT.parse().unwrap(),
            counter_account: COUNTER_CONTRACT.parse().unwrap(),
            guestbook_account: GUESTBOOK_CONTRACT.parse().unwrap(),
        }
    }
}

#[near_bindgen]
impl Contract {
    #[init]
    #[private]
    pub fn init(
        hello_account: AccountId,
        counter_account: AccountId,
        guestbook_account: AccountId,
    ) -> Self {
        Self {
            hello_account,
            counter_account,
            guestbook_account,
        }
    }
}
