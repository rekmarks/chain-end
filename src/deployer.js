/**
 * Smart contract deployment manager.
 * Deploys contracts and keeps track of them.
 * Assumes pre-compiled Truffle artifacts of contracts.
 */

const defaultContracts = require('./contracts')

class Deployer {

  /**
   * Constructor. Sets web3 provider, deploying account, and gas limit.
   * @param  {object} web3Provider   the web3 provider
   * @param  {string} account        the deploying account id
   * @param  {number} gasLimit       the deployment transaction gas limit
   */
  constructor(web3Provider, account, gasLimit) {

    this.config = {
      provider: web3Provider,
      account: account,
      gasLimit: gasLimit
    }

    this.instances = {}
    this._instanceCounts = {}

    this.contractTypes = defaultContracts
  }

  /**
   * Sets the deploying account
   * @param {string} account the ID of the deploying account
   */
  setAccount(account) {
    this.config.account = account
  }

  /**
   * Sets the gas limit of the deployment transaction // TODO: confirm
   * @param {number} gas the gas limit
   */
  setGas(gas) {
    this.config.gasLimit = gas
  }

  /**
   * Adds a contract type
   * @param {object} contractJSON Truffle contract artifact from: truffle compile
   */
  addContract(contractJSON) {

    // TODO: more input validation?

    const contractName = contractJSON.contractName

    if (!contractName) {
      throw new Error('addContract: missing contract name')
    } else if (this.contractTypes[contractName]) {
      throw new Error('addContract: duplicate contract name: ' + contractName)
    }

    this.contractTypes[contractName] = contractJSON
  }

  /**
   * Deploys a truffleContract with constructorParams. Asynchronous pure 
   * function.
   * @param  {object} truffleContract   the contract to deploy
   * @param  {array}  constructorParams contract constructor parameters
   * @return {object}                   the deployed instance
   */
  async deploy(truffleContract, constructorParams) {

    // undeployed contracts only
    if (truffleContract.isDeployed()) {
      throw new Error("deploy: truffleContract is deployed instance")
    }
    
    const contractInstance = await _deploy(
      truffleContract, 
      constructorParams,
      this.config.provider,
      this.config.account,
      this.config.gasLimit
    )

    // deployed instance must have transactionHash property
    if (!contractInstance.transactionHash) {
      throw new Error("deploy: contractInstance missing transactionHash")
    } 

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

    // a deployed instance must have the transactionHash property
    if (!contractInstance.transactionHash) {
      throw new Error("_addInstance: contractInstance missing transactionHash")
    } 

    // get the contract name per the Truffle artifact schema
    const contractName = contractInstance.constructor._json.contractName

    // TODO: revamp instance storage, search, and access
    // increment count of contract?
    if (this._instanceCounts[contractName]) {
      this._instanceCounts[contractName] += 1
    } else {
      this._instanceCounts[contractName] = 1
      this.instances[contractName] = {}
    }

    // store instance, using count as the id
    this.instances
      [contractName]
      [ this._instanceCounts[contractName] ] = contractInstance
  }
}

/**
 * Deploys an instance of the truffleContract. Asynchronous pure function.
 * @param  {object} truffleContract   the contract to deploy
 * @param  {array}  constructorParams contract constructor parameters
 * @param  {object} provider          web3 provider
 * @param  {string} account           deploying account
 * @param  {number} gas               gas limit // TODO: confirm what this is
 * @return {object}                   the deployed instance
 */
async function _deploy (
    truffleContract,
    constructorParams, 
    provider,  
    account,
    gas
  ) {

  // TODO: input validation, here or further up the call chain

  const contract = Object.assign({}, truffleContract)
  contract.setProvider(provider)

  contract.defaults({
      from: account,
      gas: gas
  })

  return await contract.new(...constructorParams)
}

module.exports = Deployer
