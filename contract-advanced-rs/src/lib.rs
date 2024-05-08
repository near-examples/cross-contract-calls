// Find all our documentation at https://docs.near.org
use near_sdk::{near, AccountId, Gas, NearToken};

mod batch_actions;
mod multiple_contracts;
mod similar_contracts;

const XCC_GAS: Gas = Gas::from_tgas(10);
const NO_DEPOSIT: NearToken = NearToken::from_near(0);
const NO_ARGS: Vec<u8> = vec![];
const HELLO_CONTRACT: &str = "hello.near-examples.testnet";
const COUNTER_CONTRACT: &str = "counter.near-examples.testnet";
const GUESTBOOK_CONTRACT: &str = "guestbook.near-examples.testnet";

// Define the contract structure
#[near(contract_state)]
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

#[near]
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
