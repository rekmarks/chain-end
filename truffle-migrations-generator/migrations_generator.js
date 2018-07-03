
let fs = require('fs')

// path to the project root
const rootPath = require('../get_root_path')

const MIGRATIONS_PATH = rootPath + '/truffle/migrations/'
const TOKENS_PATH = rootPath + '/truffle/contracts/tokens/'

module.exports = {
  generate: {
    StandardERC20: generateStandardERC20Migration,
  },
  delete: {
    tokens: () => deleteAllOf('token'),
  },
}

// keeps track of how many migrations of each contract type 
// we have generated
let migrationHistory = {
  token: 0
}

// 
const contractTypes = [ 'token' ]

/* migration file managers */

/**
 * Deletes all migration files for the specified contract type
 * @param  {string} type the migration type to be deleted
 */
function deleteAllOf (type) {

  // fail loudly if the type is invalid
  if (contractTypes.indexOf(type) === -1) {
    throw new Error('invalid type')
  }

  // iterate through migrations and delete all files of the specified type
  fs.readdirSync(MIGRATIONS_PATH).forEach(file => {

      let split = file.split('_')
      if (split[1] === type) {
        fs.unlinkSync(MIGRATIONS_PATH + file)
      }
  })

  // reset migration counter
  migrationHistory[type] = 0
}

/* migration file writers */

// tokens

/**
 * Generates a StandardERC20 migration file
 * @param  {string} name     the token name
 * @param  {string} symbol   the token symbol
 * @param  {number} decimals the number of decimals for the token
 * @param  {number} supply   the supply of the token
 */
function generateStandardERC20Migration (name, symbol, decimals, supply) {

    const fileContent = 
      getStandardERC20DeploymentString(name, symbol, decimals, supply)

    const fileName = getTokenMigrationFilenameString('StandardERC20')

    migrationHistory.token += 1

    fs.writeFileSync(MIGRATIONS_PATH + fileName, fileContent)
}

/* string getters */

// migration filename strings //

/**
 * Gets the filename of the next migration to be generated
 * @param  {string} contractName the name of the contract e.g. StandardERC20
 * @return {string}              the migration file's filename
 */
function getTokenMigrationFilenameString (contractName) {

  // input validation
  if (1000 + migrationHistory.tokens > 1999) {
    throw new Error('too many token migrations')
  }
  if (1000 + migrationHistory.tokens < 1000) {
    throw new Error('invalid token migration prefix')
  }

  // get and return filename
  const out = 
    (1000 + migrationHistory.token).toString() 
    + '_token_' + contractName + '.js'  

  return out
}

// common migration JavaScript strings //

/**
 * Get the "artifacts.require" line for a migration file
 * @param  {string} contractName the name of the contract e.g. StandardERC20
 * @return {string}              the "artifacts.require" line
 */
function getArtifactsRequireString (contractName) {

  let out = 'const ' + contractName + ' = artifacts.require(\'' 
    + TOKENS_PATH + contractName + '.sol\')\n'

  return out
}

/**
 * Get the "module.exports" line for a migration file
 * @return {string}              the "module.exports" line
 */
function getModuleExportsString () {

  let out = '\nmodule.exports = (deployer) => {\n'
  return out
}

// token JavaScript strings //

/**
 * Generates the JavaScript content of a StandardERC20 migration file
 * @param  {string} name     the token name
 * @param  {string} symbol   the token symbol
 * @param  {number} decimals the number of decimals for the token
 * @param  {number} supply   the supply of the token
 * @return {string} the migration file content
 */
function getStandardERC20DeploymentString (name, symbol, decimals, supply) {

  const contractName = 'StandardERC20'

  if (getArtifactsRequireString(contractName) === undefined) {
    throw new Error('undefined')
  }

  let out = 
    '\n' + getArtifactsRequireString(contractName)
    + getModuleExportsString()
    + '\tdeployer.deploy(' + contractName 
    + ', \'' + name + '\', \'' + symbol + '\', ' + decimals + ', ' + supply + ')\n'
    + '}\n'

  return out    
}
