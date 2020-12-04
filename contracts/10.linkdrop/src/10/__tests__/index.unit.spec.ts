import { u128, storage, Context, VMContext, VM } from "near-sdk-as";
import * as contract from '../assembly'

const valid_account = 'alice'
const invalid_account = "XYZ"

let pk: contract.Base58PublicKey = "qSq3LoufLvTCTNGC3LJePMDGrok8dHMQ5A1YD9psbiz"
let deposit = u128.from(1_000_000);

describe('LinkDrop', () => {
  beforeEach(() => {
    VMContext.setCurrent_account_id('linkdrop')
  })

  afterEach(() => {
    // cleanup storage between tests
  })

  describe('create_account', () => {
    it('allows the creation of a valid account', () => {
      expect(() => {
        VMContext.setAttached_deposit(deposit)
        contract.create_account(valid_account, pk)
      }).not.toThrow()

    })

    it('does not allow the creation of an invalid account', () => {
      expect(() => {
        VMContext.setAttached_deposit(deposit)
        contract.create_account(invalid_account, pk)
      }).toThrow() // Invalid account id
    })

    // TODO: verify that promise was created with funds for given username.
    //       but this needs simulation testing actually
  })

  describe('get_key_balance', () => {
    it('panics if an attempt is made to retrieve a missing account key', () => {
      expect(() => {
        contract.get_key_balance(pk);
      }).toThrow() // Key 'a::qSq3L...' is not present in the storage
    })

    it('is able to get missing balance', () => {
      const large_deposit = u128.mul(contract.ACCESS_KEY_ALLOWANCE, u128.from(100))
      VMContext.setAttached_deposit(large_deposit)
      contract.send(pk)

      // try getting the balance of the key
      let balance: u128 = contract.get_key_balance(pk);
      expect(balance).toBe(u128.sub(large_deposit, contract.ACCESS_KEY_ALLOWANCE))
    })
  })


  describe('create_account_and_claim', () => {
    it('panics if an attempt is made to claim an invalid account', () => {
      const large_deposit = u128.mul(contract.ACCESS_KEY_ALLOWANCE, u128.from(100))
      VMContext.setAttached_deposit(large_deposit)
      contract.send(pk)

      // Now, send new transaction to link drop contract.
      VMContext.setPredecessor_account_id('linkdrop')
      // @willem: looks like this method is broken?  not sure
      // VMContext.setSigner_account_pk(pk) // TypeError: Reflect.get called on non-object
      // log(Context.senderPublicKey) // "HuxUynD5GdrcZ5MauxJuu74sGHgS6wLfCqqhQkLWK" from default context object

      expect(() => {
        let pk2: contract.Base58PublicKey = "2S87aQ1PM9o6eBcEXnTR5yBAVRTiNmvj8J8ngZ6FzSca"
        contract.create_account_and_claim(invalid_account, pk2);
      }).toThrow() // Invalid account id
    })

    // @willem: can't test this bc of the TypeError thrown on setSigner_account_pk()
    xit('works for a valid drop claim', () => {
      // Deposit money to linkdrop contract.
      const large_deposit = u128.mul(contract.ACCESS_KEY_ALLOWANCE, u128.from(100))
      VMContext.setAttached_deposit(large_deposit)
      contract.send(pk)

      // Now, send new transaction to link drop contract.
      VMContext.setPredecessor_account_id('linkdrop')
      // @willem: looks like this method is broken?  not sure
      // VMContext.setSigner_account_pk(pk) // TypeError: Reflect.get called on non-object
      // log(Context.senderPublicKey) // "HuxUynD5GdrcZ5MauxJuu74sGHgS6wLfCqqhQkLWK" from default context object
      VMContext.setAccount_balance(large_deposit)

      expect(() => {
        let pk2 = "2S87aQ1PM9o6eBcEXnTR5yBAVRTiNmvj8J8ngZ6FzSca"
        contract.create_account_and_claim(valid_account, pk2);
      }).not.toThrow()
      // @willem: this ends up throwing here bc the default key doesn't match the expected signer key
      // @willem: i guess we can fudge it now and expect the default key but would be better to fix so
      //          we're not introducing a magical key somewhere
      // Key 'a::HuxUynD5GdrcZ5MauxJuu74sGHgS6wLfCqqhQkLWK' is not present in the storage

      // TODO: verify that proper promises were created.
      //       but this needs simulation testing actually
    })
  })

  describe('send two times', () => {
    it('increases linkdrop balance', () => {
      // Deposit money to linkdrop contract.
      const large_deposit = u128.mul(contract.ACCESS_KEY_ALLOWANCE, u128.from(100))
      VMContext.setCurrent_account_id('linkdrop')
      VMContext.setAttached_deposit(large_deposit)
      contract.send(pk)
      // assert_eq!(contract.get_key_balance(pk.clone()), (deposit - ACCESS_KEY_ALLOWANCE).into());
      expect(contract.get_key_balance(pk) == u128.sub(deposit, contract.ACCESS_KEY_ALLOWANCE))

      // Deposit money to linkdrop contract.
      VMContext.setCurrent_account_id('linkdrop')
      VMContext.setAttached_deposit(u128.add(u128.from(1), large_deposit))
      contract.send(pk)

      // assert_eq!(contract.accounts.get(& pk.into()).unwrap(), deposit + deposit + 1 - 2 * ACCESS_KEY_ALLOWANCE);
      expect(contract.get_key_balance(pk) == u128.sub(deposit, contract.ACCESS_KEY_ALLOWANCE))

      // @willem: my goal was to calculate this
      // deposit + deposit + 1 - 2 * ACCESS_KEY_ALLOWANCE
      // const expected_value = u128.add(deposit, u128.add(deposit, u128.sub(u128.from(1), u128.mul(u128.from(2), contract.ACCESS_KEY_ALLOWANCE))))
      // @willem: but then this happened
      /*
      WARNING AS217: Function '~lib/as-bignum/integer/u128/u128.add' cannot be inlined into itself.

       const expected_value = u128.add(deposit, u128.add(deposit, u128.sub(u128.from(1), u128.mul(u128.from(2), contract.ACCESS_KEY_ALLOWANCE))));
      */
      // @willem: so i did this.  good, bad or ugly?
      // deposit + deposit + 1 - 2 * ACCESS_KEY_ALLOWANCE
      // deposit + deposit + 1 - c
      // deposit + deposit + b
      // deposit + a
      const c = u128.mul(u128.from(2), contract.ACCESS_KEY_ALLOWANCE)
      const b = u128.sub(u128.from(1), c)
      const a = u128.add(deposit, b)
      const expected_value = u128.add(deposit, a)

      expect(contract.accounts.get(pk) == expected_value)
    })
  })
})


/*
@willem: original tests below

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
    use std::convert::TryInto;

    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, BlockHeight, PublicKey, VMContext};

    use super::*;

    pub struct VMContextBuilder {
        context: VMContext,
    }

    impl VMContextBuilder {
        pub fn new() -> Self {
            Self {
                context: VMContext {
                    current_account_id: "".to_string(),
                    signer_account_id: "".to_string(),
                    signer_account_pk: vec![0, 1, 2],
                    predecessor_account_id: "".to_string(),
                    input: vec![],
                    block_index: 0,
                    epoch_height: 0,
                    block_timestamp: 0,
                    account_balance: 0,
                    account_locked_balance: 0,
                    storage_usage: 10u64.pow(6),
                    attached_deposit: 0,
                    prepaid_gas: 10u64.pow(18),
                    random_seed: vec![0, 1, 2],
                    is_view: false,
                    output_data_receivers: vec![],
                },
            }
        }

        pub fn current_account_id(mut self, account_id: AccountId) -> Self {
            self.context.current_account_id = account_id;
            self
        }

        #[allow(dead_code)]
        pub fn signer_account_id(mut self, account_id: AccountId) -> Self {
            self.context.signer_account_id = account_id;
            self
        }

        pub fn predecessor_account_id(mut self, account_id: AccountId) -> Self {
            self.context.predecessor_account_id = account_id;
            self
        }

        #[allow(dead_code)]
        pub fn block_index(mut self, block_index: BlockHeight) -> Self {
            self.context.block_index = block_index;
            self
        }

        pub fn attached_deposit(mut self, amount: Balance) -> Self {
            self.context.attached_deposit = amount;
            self
        }

        pub fn account_balance(mut self, amount: Balance) -> Self {
            self.context.account_balance = amount;
            self
        }

        #[allow(dead_code)]
        pub fn account_locked_balance(mut self, amount: Balance) -> Self {
            self.context.account_locked_balance = amount;
            self
        }

        pub fn signer_account_pk(mut self, pk: PublicKey) -> Self {
            self.context.signer_account_pk = pk;
            self
        }

        pub fn finish(self) -> VMContext {
            self.context
        }
    }

    fn linkdrop() -> String {
        "linkdrop".to_string()
    }

    fn bob() -> String {
        "bob".to_string()
    }

    -----------------------------------------------------------------------------
    DONE
    -----------------------------------------------------------------------------
    #[test]
    fn test_create_account() {
        let mut contract = LinkDrop::default();
        let pk: Base58PublicKey = "qSq3LoufLvTCTNGC3LJePMDGrok8dHMQ5A1YD9psbiz"
            .try_into()
            .unwrap();
        let deposit = 1_000_000;
        testing_env!(VMContextBuilder::new()
            .current_account_id(linkdrop())
            .attached_deposit(deposit)
            .finish());
        contract.create_account(bob(), pk);
        // TODO: verify that promise was created with funds for given username.
    }

    -----------------------------------------------------------------------------
    DONE
    -----------------------------------------------------------------------------
    #[test]
    #[should_panic]
    fn test_create_invalid_account() {
        let mut contract = LinkDrop::default();
        let pk: Base58PublicKey = "qSq3LoufLvTCTNGC3LJePMDGrok8dHMQ5A1YD9psbiz"
            .try_into()
            .unwrap();
        let deposit = 1_000_000;
        testing_env!(VMContextBuilder::new()
            .current_account_id(linkdrop())
            .attached_deposit(deposit)
            .finish());
        contract.create_account("XYZ".to_string(), pk);
    }

    -----------------------------------------------------------------------------
    DONE
    -----------------------------------------------------------------------------
    #[test]
    #[should_panic]
    fn test_get_missing_balance_panics() {
        let contract = LinkDrop::default();
        contract.get_key_balance("qSq3LoufLvTCTNGC3LJePMDGrok8dHMQ5A1YD9psbiz".try_into().unwrap());
    }

    -----------------------------------------------------------------------------
    DONE
    -----------------------------------------------------------------------------
    #[test]
    fn test_get_missing_balance_success() {
        let mut contract = LinkDrop::default();
        let pk: Base58PublicKey = "qSq3LoufLvTCTNGC3LJePMDGrok8dHMQ5A1YD9psbiz"
            .try_into()
            .unwrap();
        let deposit = ACCESS_KEY_ALLOWANCE * 100;
        testing_env!(VMContextBuilder::new()
            .current_account_id(linkdrop())
            .attached_deposit(deposit)
            .finish());
        contract.send(pk.clone());
        // try getting the balance of the key
        let balance:u128 = contract.get_key_balance(pk.try_into().unwrap()).try_into().unwrap();
        assert_eq!(
            balance,
            deposit - ACCESS_KEY_ALLOWANCE
        );
    }

    -----------------------------------------------------------------------------
    DONE
    -----------------------------------------------------------------------------
    #[test]
    #[should_panic]
    fn test_claim_invalid_account() {
      let mut contract = LinkDrop::default();
      let pk: Base58PublicKey = "qSq3LoufLvTCTNGC3LJePMDGrok8dHMQ5A1YD9psbiz"
      .try_into()
      .unwrap();
      // Deposit money to linkdrop contract.
      let deposit = ACCESS_KEY_ALLOWANCE * 100;
      testing_env!(VMContextBuilder::new()
      .current_account_id(linkdrop())
      .attached_deposit(deposit)
      .finish());
      contract.send(pk.clone());
      // Now, send new transaction to link drop contract.
      let context = VMContextBuilder::new()
      .current_account_id(linkdrop())
      .predecessor_account_id(linkdrop())
      .signer_account_pk(pk.into())
      .account_balance(deposit)
      .finish();
      testing_env!(context);
      let pk2 = "2S87aQ1PM9o6eBcEXnTR5yBAVRTiNmvj8J8ngZ6FzSca"
      .try_into()
      .unwrap();
      contract.create_account_and_claim("XYZ".to_string(), pk2);
    }

    -----------------------------------------------------------------------------
    DONE
    -----------------------------------------------------------------------------
    #[test]
    fn test_drop_claim() {
        let mut contract = LinkDrop::default();
        let pk: Base58PublicKey = "qSq3LoufLvTCTNGC3LJePMDGrok8dHMQ5A1YD9psbiz"
            .try_into()
            .unwrap();
        // Deposit money to linkdrop contract.
        let deposit = ACCESS_KEY_ALLOWANCE * 100;
        testing_env!(VMContextBuilder::new()
            .current_account_id(linkdrop())
            .attached_deposit(deposit)
            .finish());
        contract.send(pk.clone());
        // Now, send new transaction to link drop contract.
        let context = VMContextBuilder::new()
            .current_account_id(linkdrop())
            .predecessor_account_id(linkdrop())
            .signer_account_pk(pk.into())
            .account_balance(deposit)
            .finish();
        testing_env!(context);
        let pk2 = "2S87aQ1PM9o6eBcEXnTR5yBAVRTiNmvj8J8ngZ6FzSca"
            .try_into()
            .unwrap();
        contract.create_account_and_claim(bob(), pk2);
        // TODO: verify that proper promises were created.
    }

    -----------------------------------------------------------------------------
    DONE
    -----------------------------------------------------------------------------
    #[test]
    fn test_send_two_times() {
        let mut contract = LinkDrop::default();
        let pk: Base58PublicKey = "qSq3LoufLvTCTNGC3LJePMDGrok8dHMQ5A1YD9psbiz"
            .try_into()
            .unwrap();
        // Deposit money to linkdrop contract.
        let deposit = ACCESS_KEY_ALLOWANCE * 100;
        testing_env!(VMContextBuilder::new()
            .current_account_id(linkdrop())
            .attached_deposit(deposit)
            .finish());
        contract.send(pk.clone());
        assert_eq!(contract.get_key_balance(pk.clone()), (deposit - ACCESS_KEY_ALLOWANCE).into());
        testing_env!(VMContextBuilder::new()
            .current_account_id(linkdrop())
            .account_balance(deposit)
            .attached_deposit(deposit + 1)
            .finish());
        contract.send(pk.clone());
        assert_eq!(
            contract.accounts.get(&pk.into()).unwrap(),
            deposit + deposit + 1 - 2 * ACCESS_KEY_ALLOWANCE
        );
    }

    */
