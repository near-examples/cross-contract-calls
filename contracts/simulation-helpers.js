// ---------------------------------------------------------------
// Simulation Testing Helpers
// ---------------------------------------------------------------

module.exports.setup = (runtime, accounts) => {
  return accounts
    .map((account) => {
      switch (typeof account) {
        case 'string':
          return runtime.newAccount(account)
        case 'object':
          let [name, contract] = Object.entries(account)[0]
          return runtime.newAccount(name, contract)
      }
    })
    .reduce((acc, user) => {
      acc[user.account_id] = user
      return acc
    }, {})
}

module.exports.expectToFind = (target, {
  inArray,
  inObject
}, partial = true) => {
  if (partial) {
    const string = JSON.stringify(inArray || inObject)
    expect(string).toEqual(expect.stringContaining(target))
  } else {
    if (inArray) {
      expect(inArray).toEqual(expect.arrayContaining([target]))
    } else if (inObject) {
      // TODO: make this recursive, maybe using underscore or lodash?
      const keys = Object.keys(inObject)
      const values = Object.values(inObject)
      expect(keys.concat(values)).toEqual(expect.arrayContaining([target]))
    }
  }
}

// prettier-ignore
module.exports.simulate = ({
  signer,
  contract,
  method,
  config = {}
}, printResponse = false) => {
  for (let [key, value] of Object.entries(config)) {
    runtime[key] = value
  }

  let response

  if (signer) {
    response = signer.call_other(
      contract.account_id,
      method.name,
      method.params
    )
  } else {
    response = contract[method.type](method.name, method.params)
  }

  if (printResponse) {
    console.log('\n\n------ Near VM Response ------')
    console.log(JSON.stringify(response, null, 2))
  }

  return {
    calls: response.calls && Object.values(response.calls),
    receipts: response.result.receipts,
    data: response.return_data,
    error: response.err,
    logs: response.result.outcome ? response.result.outcome.logs : [],
    result: response.result,
    results: response.results,
    state: response.result.state,
  }
}

module.exports.getContext = () => {
  return {
    input: '{}',
    output_data_receivers: [],
    prepaid_gas: 10 ** 15,
    attached_deposit: '0',
    is_view: false,
    block_index: 1,
    block_timestamp: 1585778575325000000,
    epoch_height: 1,
    storage_usage: 100,
    random_seed: 'KuTCtARNzxZQ3YvXDeLjx83FDqxv2SdQTSbiq876zR7',
    current_account_id: 'alice',
    signer_account_id: 'alice',
    predecessor_account_id: 'bob',
    account_balance: '1000',
    signer_account_pk: 'KuTCtARNzxZQ3YvXDeLjx83FDqxv2SdQTSbiq876zR7',
    account_locked_balance: '10',
  }
}

// prettier-ignore
module.exports.resolveError = (message) => {
  // unpack the error message
  // assume object is nested and will converge to a single value like this:
  // { FunctionCallError: { MethodResolveError: 'MethodNotFound' } }
  if (typeof message === 'object') {
    const keys = Object.keys(message)
    return this.resolveError(message[keys[0]])
  }

  return {
    GasLimitExceeded: 'Exceeded the maximum amount of gas allowed to burn per contract',
    MethodEmptyName: 'Method name is empty',
    WasmerCompileError: 'Wasmer compilation error: {{msg}}',
    GuestPanic: 'Smart contract panicked: {{panic_msg}}',
    Memory: 'Error creating Wasm memory',
    GasExceeded: 'Exceeded the prepaid gas',
    MethodUTF8Error: 'Method name is not valid UTF8 string',
    BadUTF16: 'String encoding is bad UTF-16 sequence',
    WasmTrap: 'WebAssembly trap: {{msg}}',
    GasInstrumentation: 'Gas instrumentation failed or contract has denied instructions.',
    InvalidPromiseIndex: '{{promise_idx}} does not correspond to existing promises',
    InvalidPromiseResultIndex: 'Accessed invalid promise result index: {{result_idx}}',
    Deserialization: 'Error happened while deserializing the module',
    MethodNotFound: 'Contract method is not found',
    InvalidRegisterId: 'Accessed invalid register id: {{register_id}}',
    InvalidReceiptIndex: 'VM Logic returned an invalid receipt index: {{receipt_index}}',
    EmptyMethodName: 'Method name is empty in contract call',
    CannotReturnJointPromise: 'Returning joint promise is currently prohibited',
    StackHeightInstrumentation: 'Stack instrumentation failed',
    CodeDoesNotExist: 'Cannot find contract code for account {{account_id}}',
    MethodInvalidSignature: 'Invalid method signature',
    IntegerOverflow: 'Integer overflow happened during contract execution',
    MemoryAccessViolation: 'MemoryAccessViolation',
    InvalidIteratorIndex: 'Iterator index {{iterator_index}} does not exist',
    IteratorWasInvalidated: 'Iterator {{iterator_index}} was invalidated after its creation by performing a mutable operation on trie',
    InvalidAccountId: 'VM Logic returned an invalid account id',
    Serialization: 'Error happened while serializing the module',
    CannotAppendActionToJointPromise: 'Actions can only be appended to non-joint promise.',
    InternalMemoryDeclared: 'Internal memory declaration has been found in the module',
    Instantiate: 'Error happened during instantiation',
    ProhibitedInView: '{{method_name}} is not allowed in view calls',
    InvalidMethodName: 'VM Logic returned an invalid method name',
    BadUTF8: 'String encoding is bad UTF-8 sequence',
    BalanceExceeded: 'Exceeded the account balance',
    LinkError: 'Wasm contract link error: {{msg}}',
    InvalidPublicKey: 'VM Logic provided an invalid public key',
    ActorNoPermission: "Actor {{actor_id}} doesn't have permission to account {{account_id}} to complete the action",
    RentUnpaid: "The account {{account_id}} wouldn't have enough balance to pay required rent {{amount}}",
    LackBalanceForState: "The account {{account_id}} wouldn't have enough balance to cover storage, required to have {{amount}}",
    ReceiverMismatch: 'Wrong AccessKey used for transaction: transaction is sent to receiver_id={{tx_receiver}}, but is signed with function call access key that restricted to only use with receiver_id={{ak_receiver}}. Either change receiver_id in your transaction or switch to use a FullAccessKey.',
    CostOverflow: 'Transaction gas or balance cost is too high',
    InvalidSignature: 'Transaction is not signed with the given public key',
    AccessKeyNotFound: 'Signer "{{account_id}}" doesn\'t have access key with the given public_key {{public_key}}',
    NotEnoughBalance: 'Sender {{signer_id}} does not have enough balance {} for operation costing {}',
    NotEnoughAllowance: 'Access Key {account_id}:{public_key} does not have enough balance {{allowance}} for transaction costing {{cost}}',
    Expired: 'Transaction has expired',
    DeleteAccountStaking: 'Account {{account_id}} is staking and can not be deleted',
    SignerDoesNotExist: 'Signer {{signer_id}} does not exist',
    TriesToStake: 'Account {{account_id}} tries to stake {{stake}}, but has staked {{locked}} and only has {{balance}}',
    AddKeyAlreadyExists: 'The public key {{public_key}} is already used for an existing access key',
    InvalidSigner: 'Invalid signer account ID {{signer_id}} according to requirements',
    CreateAccountNotAllowed: "The new account_id {{account_id}} can't be created by {{predecessor_id}}",
    RequiresFullAccess: 'The transaction contains more then one action, but it was signed with an access key which allows transaction to apply only one specific action. To apply more then one actions TX must be signed with a full access key',
    TriesToUnstake: 'Account {{account_id}} is not yet staked, but tries to unstake',
    InvalidNonce: 'Transaction nonce {{tx_nonce}} must be larger than nonce of the used access key {{ak_nonce}}',
    AccountAlreadyExists: "Can't create a new account {{account_id}}, because it already exists",
    InvalidChain: "Transaction parent block hash doesn't belong to the current chain",
    AccountDoesNotExist: "Can't complete the action because account {{account_id}} doesn't exist",
    MethodNameMismatch: "Transaction method name {{method_name}} isn't allowed by the access key",
    DeleteAccountHasRent: "Account {{account_id}} can't be deleted. It has {balance{}}, which is enough to cover the rent",
    DeleteAccountHasEnoughBalance: "Account {{account_id}} can't be deleted. It has {balance{}}, which is enough to cover it's storage",
    InvalidReceiver: 'Invalid receiver account ID {{receiver_id}} according to requirements',
    DeleteKeyDoesNotExist: "Account {{account_id}} tries to remove an access key that doesn't exist",
    Timeout: 'Timeout exceeded',
    Closed: 'Connection closed',
  } [message]
}
