
// src
module.exports.contracts = require('./src/solidityImports')

// src/deployer
module.exports.deploy = require('./src/deployer/deploy')
module.exports.Deployer = require('./src/deployer/Deployer')
module.exports.getInstance = require('./src/deployer/getInstance')
module.exports.callInstance = require('./src/deployer/callInstance')
