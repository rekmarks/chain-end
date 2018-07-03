
const fs = require('fs')
const Ganache = require('ganache-core')
const Eth = require('ethjs')

const migrations = require('../../truffle-migrations-generator/migrations_generator.js')
const migrationsHelper = require('./helpers/migrations_helper.js')

const rootPath = require('../../get_root_path')
const migrationsPath = rootPath + '/truffle/migrations/'

const StandardERC20 = artifacts.require('StandardERC20')


describe('without ganache-cli', async () => {

  let provider, accounts, account, eth

  provider = Ganache.provider()
  eth = new Eth(provider)

  accounts = await eth.accounts()
  account = accounts[0]

  // beforeEach('set up', async () => {})

  contract('StandardERC20', (accounts) => {

    after('delete all existing token migrations after all tests have been run', () => {
      migrations.delete.tokens()
    })
    
    it('initial state matches constructor arguments', async () => {

        const instance = await StandardERC20.deployed()
                
        const deployedName = await instance.name()
        const deployedSymbol = await instance.symbol()
        const deployedDecimals = await instance.decimals()
        const deployedSupply = await instance.totalSupply()
        const deployerBalance = await instance.balanceOf.call(accounts[0])

        assert.equal(deployedName, migrationsHelper.token.StandardERC20.name, 'deployed name incorrect')
        assert.equal(deployedSymbol, migrationsHelper.token.StandardERC20.symbol, 'deployed symbol incorrect')
        assert.equal(deployedDecimals, migrationsHelper.token.StandardERC20.decimals, 'deployed decimals incorrect')
        assert.equal(deployedSupply, migrationsHelper.token.StandardERC20.supply, 'deployed supply incorrect')
        assert.equal(deployerBalance, migrationsHelper.token.StandardERC20.supply, 'deployer account balance incorrect')
    })
  })
})