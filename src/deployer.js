
// const Contract = require('truffle-contract')

const defaultGas = 3141592

export default class Deployer {

  /**
   * [constructor description]
   * @param  {[type]} provider [description]
   * @param  {[type]} account  [description]
   * @return {[type]}          [description]
   */
  constructor(provider, account) {

    this.config = {
      provider: provider,
      gas: defaultGas
    }
    setAccount(account)

    this.instances = {}
    this._instanceCounts = {}
  }

  /**
   * [setAccount description]
   * @param {[type]} account [description]
   */
  setAccount(account) {
    this.config.account = account
  }

  /**
   * [setGas description]
   * @param {[type]} gas [description]
   */
  setGas(gas) {
    this.config.gas = gas
  }
  
  /**
   * [addInstance description]
   * @param {[type]} contractInstance     [description]
   */
  function _addInstance(contractInstance) {

    // get the contract name per the Truffle artifact schema
    const contractName = instance.constructor._json.contractName

    // TODO: improve instance storage, search, and access
    // increment count of contract
    if (this._instanceCounts[contractName]) {
      this._instanceCounts[contractName] += 1
    } else {
      this._instanceCounts[contractName] = 1
      this.instances[contractName] = {}
    }

    // store instance, using count as the id
    this.instances
      [contractName]
      [ this._instanceCounts[contractName] ] = instance
  }

  /**
   * [deploy description]
   * @param  {[type]} contractType      [description]
   * @param  {[type]} constructorParams [description]
   * @return {[type]}                   [description]
   */
  deploy(contractType, constructorParams) {
    _addInstance(
      _deploy(
        contractType, 
        constructorParams,
        this.config.provider,
        this.config.account,
        this.config.gas
        )
      )
  }
}

/**
 * Pure function, deploys an instance of contractType
 * @param  { object } truffleContract      [description]
 * @param  { array }  constructorParams [description]
 * @param  { object? } provider          [description]
 * @param  { string? } account           [description]
 * @param  { number } gas               [description]
 * @return { object }                   the deployed instance
 */
function _deploy (
    truffleContract,
    constructorParams, 
    provider,  
    account,
    gas
  ) {

  // TODO: run debugger and confirm param types
  // debugger

  // TODO: input validation

  const contract = Object.assign({}, truffleContract)
  contract.setProvider(provider)

  contract.defaults({
      from: account,
      gas: gas
  })

  return contract.new(...constructorParams)
}

// original schema
// let deployer = {

//   config: {
//     provider: null,
//     accounts: null,
//     gas: defaultGas
//   },

//   instances: {},
//   _instanceCounts: {},
  
//   deploy: deployWrapper,
// }
