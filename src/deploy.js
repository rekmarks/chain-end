
const Contract = require('truffle-contract')

module.exports = deploy

/**
 * Deploys an instance of the provided truffleContract. 
 * Asynchronous. Validates input. Pure except for web3 calls.
 * 
 * @param  {object} truffleContract   the contract to deploy
 * @param  {array}  constructorParams contract constructor parameters
 * @param  {object} web3Provider      web3 provider
 * @param  {string} senderAccount     deploying account
 * @param  {number} gasLimit          (optional) gas limit
 * @return {object}                   the deployed contract instance
 */
async function deploy (
    contractJSON,
    constructorParams,
    web3Provider,
    senderAccount,
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
  truffleContract.setProvider(web3Provider)
  truffleContract.defaults(
    gasLimit ? { from: senderAccount, gas: gasLimit} : {from: senderAccount}
  )

  const contractInstance = await truffleContract.new(...constructorParams)

  // validate instance
  if (!contractInstance.transactionHash) {
    throw new Error('deploy: contractInstance missing transactionHash')
  }
  if (!contractInstance.address) {
    throw new Error('deploy: contractInstance missing address')  
  }

  return contractInstance
}
