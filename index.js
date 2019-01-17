
// src/
module.exports.contracts = require('./src/solidityImports')

// src/solidity_utils
module.exports.getMetadata = require('./src/solidity_utils/getMetadata')
module.exports.sourceFiles = require('./src/solidity_utils/joinSourceFiles')

// src/web3
module.exports.deploy = require('./src/web3/deploy')
module.exports.Deployer = require('./src/web3/deployer')
module.exports.getInstance = require('./src/web3/getInstance')
module.exports.callInstance = require('./src/web3/callInstance')
