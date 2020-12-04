use near_sdk::near_bindgen;
#[allow(dead_code)]
#[near_bindgen]
pub struct Linkdrop {}

#[near_bindgen]
impl Linkdrop {
  #[allow(unused_variables, dead_code)]
  pub fn create_account(new_account_id: &str, new_public_key: &str){}

  #[allow(unused_variables, dead_code)]
  pub fn get_key_balance(public_key: &str){}

  #[allow(unused_variables, dead_code)]
  pub fn send(public_key: &str){}

  #[allow(unused_variables, dead_code)]
  pub fn create_account_and_claim(new_account_id: &str, new_public_key: &str){}

  #[allow(unused_variables, dead_code)]
  pub fn on_account_created(predecessor_account_id: &str, amount: &str){}

  #[allow(unused_variables, dead_code)]
  pub fn on_account_created_and_claimed(amount: &str){}

  #[allow(unused_variables, dead_code)]
  pub fn claim(account_id: &str){}
}
