
const Contract = require('truffle-contract')

module.exports = getInstance

/**
 * 
 * Asynchronous. Validates input. Pure except for web3 calls.
 * 
 * @param  {object} contractArtifact  the artifact of the deployed contract
 * @param  {object} web3Provider      web3 provider
 * @param  {string} senderAccount     transaction sender
 * @param  {string} address           the address of the deployed contract
 * @return {object}                   the contract instance
 */
async function getInstance (
    contractArtifact,
    web3Provider,
    instanceAddress,
    senderAccount
  ) {

  const contractName = contractArtifact.contractName

  // validate contractArtifact
  if (!contractName) {
    throw new Error('getInstance: missing contract name')
  }
  if (contractArtifact.isDeployed && contractArtifact.isDeployed()) {
    throw new Error('getInstance: contract type is deployed instance')
  }
  if (!contractArtifact.abi || !contractArtifact.bytecode) {
    throw new Error('getInstance: contract JSON missing bytecode or abi')
  }

  // initialize truffle contract object
  const truffleContract = Contract(contractArtifact)
  truffleContract.setProvider(web3Provider)
  if (senderAccount) truffleContract.defaults({ from: senderAccount })

  // get instance
  const instance = await truffleContract.at(instanceAddress)

  // validate instance
  if (!instance) {
    throw new Error('getInstance: no intsance was returned')
  }
  if (instance.address !== instanceAddress) {
    throw new Error('getInstance: instance missing address')  
  }

  return instance
}
