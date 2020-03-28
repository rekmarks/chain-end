
const Contract = require('@truffle/contract')

const defaultContracts = require('../solidityImports')

/**
 * Smart contract deployment manager.
 * Deploys contracts and keeps track of them.
 * Assumes pre-compiled Truffle artifacts of contracts.
 */
class Deployer {

  /**
   * Constructor. Sets web3 provider, deploying account, and (optionally) gas limit.
   * Do not set gas limit for use with MetaMask.
   *
   * @param  {object} web3Provider   the web3 provider
   * @param  {string} account        the deploying account id
   * @param  {number} gasLimit       the deployment transaction gas limit, if desired
   * @param  {object} contractTypes  the @truffle/contracts to use
   */
  constructor(web3Provider, account, gasLimit=null, contractTypes=defaultContracts) {

    this.config = {
      provider: web3Provider,
      account: account,
      gasLimit: gasLimit,
    }

    this.instances = {}

    this.contractTypes = {}
    Object.entries(contractTypes).forEach( ([key, value]) => {
      this.contractTypes[key] = Contract(value)
    })
  }

  /**
   * Sets the deploying account
   * @param {string} account the ID of the deploying account
   */
  setAccount(account) {
    this.config.account = account
  }

  /**
   * Sets the gas limit of the deployment transaction
   * @param {number} gasLimit the gas limit
   */
  setGasLimit(gasLimit) {
    this.config.gasLimit = gasLimit
  }

  /**
   * Adds a contract type
   * @param {object} contractJSON Truffle contract artifact from: truffle compile
   */
  addContract(contractJSON) {

    const contractName = contractJSON.contractName

    // input validation
    if (!contractName) {
      throw new Error('addContract: missing contract name')

    } else if (this.contractTypes[contractName]) {
      throw new Error('addContract: duplicate contract name: ' + contractName)
    }

    // TODO: does this make sense?
    if (contractJSON.isDeployed && contractJSON.isDeployed()) {
      throw new Error('addContract: contract type is deployed instance')
    }

    if (!contractJSON.abi || !contractJSON.bytecode) {
      throw new Error('addContract: contract JSON missing bytecode or abi')
    }

    this.contractTypes[contractName] = Contract(contractJSON)
  }

  /**
   * Removes a contract type
   * @param  {string}   contractName  the name of the contract type to remove
   * @return {boolean}                true if contract existed, false otherwise
   */
  removeContract(contractName) {
    const contractExisted = !!this.contractTypes[contractName]
    delete this.contractTypes[contractName]
    return contractExisted
  }

  /**
   * Deploys a truffleContract with constructorParams. Asynchronous pure
   * function.
   *
   * Attempts to deploy truffleContract if provided, else attempts to find
   * contract in internal contractTypes, else fails.
   *
   * @param  {string}   contractName      name of the contract to deploy
   * @param  {array}    constructorParams contract constructor parameters
   * @return {object}                     the deployed instance
   */
  async deploy(contractName, constructorParams) {

    const truffleContract = this.contractTypes[contractName]

    if (!truffleContract) {
      throw new Error('deploy: contract neither found nor supplied')
    }

    const contractInstance = await _deploy(
      truffleContract,
      constructorParams,
      this.config.provider,
      this.config.account,
      this.config.gasLimit
    ) // this is validated in _addInstance

    this._addInstance(contractInstance)

    // return the deployed contract because the caller probably wants
    // to keep track of it
    return contractInstance
  }

  /**
   * PRIVATE. Stores contract instance.
   * @param {object} a deployed contract instance
   */
  _addInstance(contractInstance) {

    // input validation
    if (!contractInstance.transactionHash) {
      throw new Error('_addInstance: contractInstance missing transactionHash')
    }
    if (!contractInstance.address) {
      throw new Error('_addInstance: contractInstance missing address')
    }

    // get the contract name and address per Truffle artifact schema
    const contractName = contractInstance.constructor._json.contractName
    const contractAddress = contractInstance.address

    // check for duplicate addresses
    const _instances = Object.keys(this.instances)
    for (let i = 0; i < _instances.length; i++) {

      if (this.instances[_instances[i]][contractAddress]) {
          throw new Error('_addInstance: duplicate contract address')
      }
    }

    // store instance, using its address as the id
    if (!this.instances[contractName]) {
      this.instances[contractName] = {}
    }
    this.instances[contractName][contractAddress] = contractInstance
  }
}

/**
 * PRIVATE. Deploys an instance of the truffleContract.
 * Asynchronous pure function. Assumes valid input.
 *
 * @param  {object} truffleContract   the contract to deploy
 * @param  {array}  constructorParams contract constructor parameters
 * @param  {object} provider          web3 provider
 * @param  {string} account           deploying account
 * @param  {number} gas               gas limit
 * @return {object}                   the deployed instance
 */
async function _deploy (
    truffleContract,
    constructorParams,
    provider,
    account,
    gas
  ) {

  const contract = Object.assign({}, truffleContract)
  contract.setProvider(provider)

  // set contract defaults per @truffle/contract API
  // set gas limit if desired, otherwise don't supply it (for use with MetaMask)
  const contractDefaults = (gas ? { from: account, gas: gas} : {from: account})
  contract.defaults(contractDefaults)

  return await contract.new(...constructorParams)
}

module.exports = Deployer
