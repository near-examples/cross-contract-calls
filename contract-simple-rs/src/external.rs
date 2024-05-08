// Find all our documentation at https://docs.near.org
use near_sdk::ext_contract;

pub const NO_DEPOSIT: u128 = 0;
pub const XCC_SUCCESS: u64 = 1;

// Validator interface, for cross-contract calls
#[ext_contract(hello_near)]
trait HelloNear {
    fn get_greeting(&self) -> String;
    fn set_greeting(&self, greeting: String);
}
