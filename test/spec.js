const ganache = require('ganache-cli')
const Contract = require('truffle-contract')
const Web3 = require('web3')
const assert = require('assert')

const Deployer = require('../index').Deployer
const deploy = require('../index').deploy
const getInstance = require('../index').getInstance
const callInstance = require('../index').callInstance
const contractParams = require('./helper').contractParameters
const defaultContracts = require('../index').contracts
const StandardERC20_JSON = defaultContracts.StandardERC20
const StandardERC20_Test_JSON = require('./contracts/StandardERC20_Test.json')

describe('deployment', () => {

  describe('deployer', () => {
    const provider = ganache.provider()
    const web3 = new Web3(provider)

    const gas = 3141592

    let accounts, deployer, instance1, instance2

    // using before() since I can't figure out how to make the describe 
    // callback async
    before('get accounts', () => {
      return web3
        .eth
        .getAccounts()
        .then(accs => accounts = accs)
    })

    before('set up deployer', () => {
      deployer = new Deployer(provider, accounts[0], gas)
      // deployer = new Deployer(provider, accounts[0])
    })

    it('deployer initialized correctly', () => {
      assert.equal(Object.keys(deployer.contractTypes).length, 
        Object.keys(defaultContracts).length,
        'initial contract types incorrect')
      assert.equal(Object.keys(deployer.instances).length, 0,
        'nonempty initial instances')
    })

    it('does not add duplicate contract', () => {
      try {
        deployer.addContract(StandardERC20_JSON)
        assert(false, 'duplicate contract type added (did not throw)')
      } catch (error) {} // do nothing
    })

    it('adds a contract type', () => {
        deployer.addContract(StandardERC20_Test_JSON)
        assert(deployer.contractTypes.StandardERC20_Test, 'contract not added')
    })

    it('deploys a contract correctly', async () => {

      instance1 = await deployer.deploy(
        StandardERC20_JSON.contractName,
        contractParams.token.StandardERC20.a,
      )

      // deployer state
      assert.equal(Object.keys(deployer.instances).length, 1,
        'incorrect number of instance types')
      assert(Object.keys(deployer.instances.StandardERC20).length, 1,
        'incorrect number of StandardERC20 instances')

      // instance1 state
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

    it('deploys a second contract correctly, without changing the first', async () => {

      deployer.setAccount(accounts[1])

      instance2 = await deployer.deploy(
        StandardERC20_JSON.contractName,
        contractParams.token.StandardERC20.b,
      )

      // deployer state
      assert(Object.keys(deployer.instances).length, 1,
        'incorrect number of instance types')
      assert(Object.keys(deployer.instances.StandardERC20).length, 2,
        'incorrect number of StandardERC20 instances')

      // instance2 state
      let deployedName = await instance2.name()
      let deployedSymbol = await instance2.symbol()
      let deployedDecimals = await instance2.decimals()
      let deployedSupply = await instance2.totalSupply()
      let deployerBalance = await instance2.balanceOf.call(accounts[1])

      assert.equal(deployedName, contractParams.token.StandardERC20.b[0], 'deployed name incorrect')
      assert.equal(deployedSymbol, contractParams.token.StandardERC20.b[1], 'deployed symbol incorrect')
      assert.equal(deployedDecimals, contractParams.token.StandardERC20.b[2], 'deployed decimals incorrect')
      assert.equal(deployedSupply, contractParams.token.StandardERC20.b[3], 'deployed supply incorrect')
      assert.equal(deployerBalance, contractParams.token.StandardERC20.b[3], 'deployer account balance incorrect')

      // instances are in fact different
      assert.notEqual(instance1.address, instance2.address, 'duplicate contract addresses')  

      // instance1 state
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

    it('removes contract types correctly', () => {

      assert(Object.keys(deployer.contractTypes).length, 2, 
        'incorrect number of contractTypes before removal')

      assert(deployer.removeContract(StandardERC20_Test_JSON.contractName), true, 
        'expected ' + StandardERC20_Test_JSON.contractName + ' to exist')

      assert(Object.keys(deployer.contractTypes).length, 1, 
        'incorrect number of contractTypes after removal')

      assert(!deployer.removeContract('DoYouWantToLiveDeliciously?'), true, 
        'expected DoYouWantToLiveDeliciously? to not exist')
    })
    // TODO: add test of deployed added contract
  })
  
  describe('deploy, getInstance, and callInstance', () => {

    const provider = ganache.provider()
    const web3 = new Web3(provider)

    const gas = 3141592

    let accounts, deployer, instance1, address1

    // using before() since I can't figure out how to make the describe 
    // callback async
    before('get accounts', () => {
      return web3
        .eth
        .getAccounts()
        .then(accs => accounts = accs)
    })

    it('deploys a contract correctly', async () => {

      instance1 = await deploy(
        StandardERC20_JSON,
        contractParams.token.StandardERC20.a,
        provider,
        accounts[0],
        gas
      )

      // instance1 state
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

      address1 = instance1.address
    })

    it('gets a deployed instance', async () => {

      instance1 = null

      instance1 = await getInstance(
        StandardERC20_JSON,
        provider,
        address1,
        accounts[0]
      )

      // instance1 state
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

    it('calls functions using callInstance', async () => {

      const deployedName = await callInstance(instance1, 'name')
      const deployedSymbol = await callInstance(instance1, 'symbol')
      const deployedDecimals = await callInstance(instance1, 'decimals')
      const deployedSupply = await callInstance(instance1, 'totalSupply')
      const deployerBalance = await callInstance(instance1, 'balanceOf', [accounts[0]])

      assert.equal(deployedName, contractParams.token.StandardERC20.a[0], 'deployed name incorrect')
      assert.equal(deployedSymbol, contractParams.token.StandardERC20.a[1], 'deployed symbol incorrect')
      assert.equal(deployedDecimals, contractParams.token.StandardERC20.a[2], 'deployed decimals incorrect')
      assert.equal(deployedSupply, contractParams.token.StandardERC20.a[3], 'deployed supply incorrect')
      assert.equal(deployerBalance, contractParams.token.StandardERC20.a[3], 'deployer account balance incorrect')
    })

    it('calls functions using callInstance, from different accounts', async () => {

      const deployerBalance = await callInstance(instance1, 'balanceOf', [accounts[0]], accounts[1])
      const acc1Balance = await callInstance(instance1, 'balanceOf', [accounts[1]], accounts[2])
      const acc2Balance = await callInstance(instance1, 'balanceOf', [accounts[2]], accounts[3])

      assert.equal(deployerBalance, contractParams.token.StandardERC20.a[3], 'deployer account balance incorrect')
      assert.equal(acc1Balance, 0, 'account 1 balance incorrect')
      assert.equal(acc2Balance, 0, 'account 2 balance incorrect')
    })

    it('calls write functions using callInstance, from different accounts', async () => {

      const transfer1 = await callInstance(instance1, 'transfer', [accounts[1], 500], accounts[0])
      const transfer2 = await callInstance(instance1, 'transfer', [accounts[2], 250], accounts[1])

      const deployerBalance = await callInstance(instance1, 'balanceOf', [accounts[0]], accounts[1])
      const acc1Balance = await callInstance(instance1, 'balanceOf', [accounts[1]], accounts[2])
      const acc2Balance = await callInstance(instance1, 'balanceOf', [accounts[2]], accounts[3])

      assert.equal(deployerBalance, contractParams.token.StandardERC20.a[3] - 500, 'deployer account balance incorrect')
      assert.equal(acc1Balance, 250, 'account 1 balance incorrect')
      assert.equal(acc2Balance, 250, 'account 2 balance incorrect')
    })
  })

  describe('other default contract types deploy correctly', () => {

    const provider = ganache.provider()
    const web3 = new Web3(provider)

    const gas = 3141592

    let accounts, deployer, mintableInstance, mintableAddress
    let crowdsaleInstance, crowdsaleAddress

    // using before() since I can't figure out how to make the describe 
    // callback async
    before('get accounts', () => {
      return web3
        .eth
        .getAccounts()
        .then(accs => accounts = accs)
    })

    it('MintableERC20', async () => {

      mintableInstance = await deploy(
        defaultContracts.MintableERC20,
        contractParams.token.StandardERC20.a,
        provider,
        accounts[0],
        gas
      )

      // mintableInstance state
      const deployedName = await mintableInstance.name()
      const deployedSymbol = await mintableInstance.symbol()
      const deployedDecimals = await mintableInstance.decimals()
      const deployedSupply = await mintableInstance.totalSupply()
      const deployerBalance = await mintableInstance.balanceOf.call(accounts[0])

      assert.equal(deployedName, contractParams.token.StandardERC20.a[0], 'deployed name incorrect')
      assert.equal(deployedSymbol, contractParams.token.StandardERC20.a[1], 'deployed symbol incorrect')
      assert.equal(deployedDecimals, contractParams.token.StandardERC20.a[2], 'deployed decimals incorrect')
      assert.equal(deployedSupply, contractParams.token.StandardERC20.a[3], 'deployed supply incorrect')
      assert.equal(deployerBalance, contractParams.token.StandardERC20.a[3], 'deployer account balance incorrect')

      mintableAddress = mintableInstance.address
    })

    it('Crowdsale', async () => {

      const rate = 100

      crowdsaleInstance = await deploy(
        defaultContracts.Crowdsale,
        [ rate, accounts[1], mintableAddress ],
        provider,
        accounts[1],
        gas
      )

      const deployedRate = await crowdsaleInstance.rate()
      const deployedWallet = await crowdsaleInstance.wallet()
      const deployedToken = await crowdsaleInstance.token()

      assert.equal(deployedRate, rate, 'deployed rate incorrect')
      assert.equal(deployedWallet.toLowerCase(), accounts[1].toLowerCase(), 'deployed wallet incorrect')
      assert.equal(deployedToken.toLowerCase(), mintableAddress.toLowerCase(), 'deployed token incorrect')
    })
  })
})
