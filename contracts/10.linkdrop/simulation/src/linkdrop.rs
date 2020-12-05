use near_sdk::near_bindgen;
#[near_bindgen]
pub struct Linkdrop {}

#[near_bindgen]
impl Linkdrop {
  pub fn create_account(new_account_id: &str, new_public_key: &str){}

  pub fn get_key_balance(public_key: &str){}

  pub fn send(public_key: &str){}

  pub fn create_account_and_claim(new_account_id: &str, new_public_key: &str){}

  pub fn on_account_created(predecessor_account_id: &str, amount: &str){}

  pub fn on_account_created_and_claimed(amount: &str){}

  pub fn claim(account_id: &str){}
}
