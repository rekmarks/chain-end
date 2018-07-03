
const migrations = require('../../../truffle-migrations-generator/migrations_generator.js')

const migrationData = {
  token: {
    StandardERC20: {
      name: 'BrittBrunoBux',
      symbol: 'BBX',
      decimals: 2,
      supply: 12000,
    },
  }
}

migrations.generate.StandardERC20(
  migrationData.token.StandardERC20.name, 
  migrationData.token.StandardERC20.symbol, 
  migrationData.token.StandardERC20.decimals, 
  migrationData.token.StandardERC20.supply )

module.exports = migrationData
