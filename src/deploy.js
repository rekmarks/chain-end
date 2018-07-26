
const Contract = require('truffle-contract')

module.exports = deploy

/**
 * Deploys an instance of the provided truffleContract. 
 * Asynchronous. Validates input. Pure except for web3 calls.
 * 
 * @param  {object} truffleContract   the contract to deploy
 * @param  {array}  constructorParams contract constructor parameters
 * @param  {object} web3Provider      web3 provider
 * @param  {string} web3Account       deploying account
 * @param  {number} gasLimit          (optional) gas limit
 * @return {object}                   the deployed contract instance
 */
async function deploy (
    contractJSON,
    constructorParams,
    web3Provider,
    web3Account,
    gasLimit=null
  ) {

  const contractName = contractJSON.contractName

  // validate contractJSON
  if (!contractName) {
    throw new Error('deploy: missing contract name')
  }
  if (contractJSON.isDeployed && contractJSON.isDeployed()) {
    throw new Error('deploy: contract type is deployed instance')
  }
  if (!contractJSON.abi || !contractJSON.bytecode) {
    throw new Error('deploy: contract JSON missing bytecode or abi')
  }

  const truffleContract = Contract(contractJSON)

  const contractInstance = await _deploy(
    truffleContract, 
    constructorParams,
    web3Provider,
    web3Account,
    gasLimit
  )

  // validate instance
  if (!contractInstance.transactionHash) {
    throw new Error('_addInstance: contractInstance missing transactionHash')
  }
  if (!contractInstance.address) {
    throw new Error('_addInstance: contractInstance missing address')  
  }

  return contractInstance
}

/**
 * PRIVATE. Deploys an instance of the truffleContract. 
 * Assumes valid input.
 * 
 * @param  {object} truffleContract   the contract to deploy
 * @param  {array}  constructorParams contract constructor parameters
 * @param  {object} provider          web3 provider
 * @param  {string} account           deploying account
 * @param  {number} gasLimit          gas limit
 * @return {object}                   the deployed instance
 */
async function _deploy (
    truffleContract,
    constructorParams, 
    provider,  
    account,
    gasLimit
  ) {

  const contract = Object.assign({}, truffleContract)
  contract.setProvider(provider)

  // set contract defaults per truffle-contract API
  // set gas limit if desired, otherwise don't supply it (for use with MetaMask)
  const contractDefaults = (gasLimit ? { from: account, gas: gasLimit} : {from: account})
  contract.defaults(contractDefaults)

  return await contract.new(...constructorParams)
}
