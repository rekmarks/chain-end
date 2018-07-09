const ganache = require('ganache-cli')
const Contract = require('truffle-contract')
const Web3 = require('web3')
const assert = require('assert')

const Deployer = require('../index')
const contractParams = require('./helper')
const StandardERC20_JSON = require('../src/default-contracts/StandardERC20.json')

describe('deployment', function() {

  const provider = ganache.provider()
  const web3 = new Web3(provider)

  const gas = 3141592

  let accounts, deployer, instance1, instance2

  // can't figure out how to make the describe callback async
  before('get accounts', function() {
    return web3
      .eth
      .getAccounts()
      .then(accs => accounts = accs)
  })


  it('deploys a contract correctly', async function() {

    deployer = new Deployer(provider, accounts[0], gas)

    await deployer.deploy(
      StandardERC20_JSON.contractName,
      contractParams.token.StandardERC20.a,
    )

    instance1 = deployer.instances.StandardERC20['1']

    const deployedName = await instance1.name()
    const deployedSymbol = await instance1.symbol()
    const deployedDecimals = await instance1.decimals()
    const deployedSupply = await instance1.totalSupply()
    const deployerBalance = await instance1.balanceOf.call(accounts[0])

    assert.equal(deployedName, contractParams.token.StandardERC20.a[0], 'deployed name incorrect')
    assert.equal(deployedSymbol, contractParams.token.StandardERC20.a[1], 'deployed symbol incorrect')
    assert.equal(deployedDecimals, contractParams.token.StandardERC20.a[2], 'deployed decimals incorrect')
    assert.equal(deployedSupply, contractParams.token.StandardERC20.a[3], 'deployed supply incorrect')
    assert.equal(deployerBalance, contractParams.token.StandardERC20.a[3], 'deployer account balance incorrect')
  })

  it('deploys a second contract correctly, without changing the first', async function() {

    deployer.setAccount(accounts[1])

    await deployer.deploy(
      StandardERC20_JSON.contractName,
      contractParams.token.StandardERC20.b,
    )

    instance2 = deployer.instances.StandardERC20['2']

    let deployedName = await instance2.name()
    let deployedSymbol = await instance2.symbol()
    let deployedDecimals = await instance2.decimals()
    let deployedSupply = await instance2.totalSupply()
    let deployerBalance = await instance2.balanceOf.call(accounts[1])

    assert.equal(deployedName, 'SuneBrunoBux', 'deployed name incorrect')
    assert.equal(deployedSymbol, 'SBX', 'deployed symbol incorrect')
    assert.equal(deployedDecimals, contractParams.token.StandardERC20.b[2], 'deployed decimals incorrect')
    assert.equal(deployedSupply, contractParams.token.StandardERC20.b[3], 'deployed supply incorrect')
    assert.equal(deployerBalance, contractParams.token.StandardERC20.b[3], 'deployer account balance incorrect')

    assert.notEqual(instance1.address, instance2.address)

    deployedName = await instance1.name()
    deployedSymbol = await instance1.symbol()
    deployedDecimals = await instance1.decimals()
    deployedSupply = await instance1.totalSupply()
    deployerBalance = await instance1.balanceOf.call(accounts[0])

    assert.equal(deployedName, contractParams.token.StandardERC20.a[0], 'deployed name incorrect')
    assert.equal(deployedSymbol, contractParams.token.StandardERC20.a[1], 'deployed symbol incorrect')
    assert.equal(deployedDecimals, contractParams.token.StandardERC20.a[2], 'deployed decimals incorrect')
    assert.equal(deployedSupply, contractParams.token.StandardERC20.a[3], 'deployed supply incorrect')
    assert.equal(deployerBalance, contractParams.token.StandardERC20.a[3], 'deployer account balance incorrect')
  })
})
