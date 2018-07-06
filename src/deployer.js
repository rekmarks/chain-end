
const Contract = require('truffle-contract')
const Web3 = require("web3");

let deployer = {

  // number of deployed instances of contracts
  counts: {},

  // for keeping track of contract instances
  instances: {},

  deploy: deploy,
}

module.exports = deployer

/**
 * [deploy description]
 * @param  {[type]} contractType      [description]
 * @param  {[type]} constructorParams [description]
 * @param  {[type]} provider          [description]
 * @param  {[type]} account           [description]
 * @param  {[type]} gas               [description]
 */
async function deploy (
    contractType,
    constructorParams, 
    provider,  
    account,
    gas
  ) {

  // TODO: input validation

  const contract = Object.assign({}, contractType)
  contract.setProvider(provider)

  contract.defaults({
      from: account,
      gas: gas
  })

  const instance = await contract.new(...constructorParams)

  recordInstance(instance)
}

// TODO: move to contracts.js
/**
 * [addInstance description]
 * @param {[type]} contract     [description]
 */
function recordInstance(instance) {

  // get the contract name per the Truffle artifact schema
  const contractName = instance.constructor._json.contractName

  // TODO: improve instance storage, search, and access
  // increment count of contract
  if (deployer.counts[contractName]) {
    deployer.counts[contractName] += 1
  } else {
    deployer.counts[contractName] = 1
    deployer.instances[contractName] = {}
  }

  // store instance, using count as the id
  deployer.instances
    [contractName]
    [ deployer.counts[contractName] ] = instance
}
