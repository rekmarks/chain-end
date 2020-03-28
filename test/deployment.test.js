const ganache = require('ganache-cli')
const Web3 = require('web3')
const { strict: assert } = require('assert')

const {
  Deployer,
  deploy,
  getInstance,
  callInstance,
  contracts: defaultContracts,
} = require('../index')
const {
  asNumber,
  contractParameters,
} = require('./helper')
const StandardERC20_JSON = defaultContracts.StandardERC20
const StandardERC20_Test_JSON = require('./contracts/StandardERC20_Test.json')

describe('deployment', () => {

  describe('deployer', () => {
    const provider = ganache.provider()
    const web3 = new Web3(provider)

    const gas = 3141592

    let deployer, accounts, instance1, instance2

    before('set up deployer', async () => {
      accounts = await web3.eth.getAccounts()
      deployer = new Deployer(provider, accounts[0], gas)
    })

    it('deployer initialized correctly', () => {
      assert.equal(
        Object.keys(deployer.contractTypes).length, 
        Object.keys(defaultContracts).length,
        'initial contract types incorrect'
      )
      assert.equal(
        Object.keys(deployer.instances).length, 0,
        'nonempty initial instances'
      )
    })

    it('does not add duplicate contract', () => {
      try {
        deployer.addContract(StandardERC20_JSON)
        assert(false, 'duplicate contract type added (did not throw)')
      } catch (error) {} // do nothing
    })

    it('adds a contract type', () => {
        deployer.addContract(StandardERC20_Test_JSON)
        assert(deployer.contractTypes.StandardERC20_Test,
        'contract not added'
      )
    })

    it('deploys a contract correctly', async () => {

      instance1 = await deployer.deploy(
        StandardERC20_JSON.contractName,
        contractParameters.token.StandardERC20.a,
      )

      // deployer state
      assert.equal(
        Object.keys(deployer.instances).length, 1,
        'incorrect number of instance types'
      )
      assert(
        Object.keys(deployer.instances.StandardERC20).length, 1,
        'incorrect number of StandardERC20 instances'
      )

      // instance1 state
      const deployedName = await instance1.name()
      const deployedSymbol = await instance1.symbol()
      const deployedDecimals = asNumber(await instance1.decimals())
      const deployedSupply = asNumber(await instance1.totalSupply())
      const deployerBalance = asNumber(await instance1.balanceOf.call(accounts[0]))

      assert.equal(deployedName, contractParameters.token.StandardERC20.a[0], 'deployed name incorrect')
      assert.equal(deployedSymbol, contractParameters.token.StandardERC20.a[1], 'deployed symbol incorrect')
      assert.equal(deployedDecimals, contractParameters.token.StandardERC20.a[2], 'deployed decimals incorrect')
      assert.equal(deployedSupply, contractParameters.token.StandardERC20.a[3], 'deployed supply incorrect')
      assert.equal(deployerBalance, contractParameters.token.StandardERC20.a[3], 'deployer account balance incorrect')
    })

    it('deploys a second contract correctly, without changing the first', async () => {

      deployer.setAccount(accounts[1])

      instance2 = await deployer.deploy(
        StandardERC20_JSON.contractName,
        contractParameters.token.StandardERC20.b,
      )

      // deployer state
      assert(Object.keys(deployer.instances).length, 1,
        'incorrect number of instance types')
      assert(Object.keys(deployer.instances.StandardERC20).length, 2,
        'incorrect number of StandardERC20 instances')

      // instance2 state
      let deployedName = await instance2.name()
      let deployedSymbol = await instance2.symbol()
      let deployedDecimals = asNumber(await instance2.decimals())
      let deployedSupply = asNumber(await instance2.totalSupply())
      let deployerBalance = asNumber(await instance2.balanceOf.call(accounts[1]))

      assert.equal(deployedName, contractParameters.token.StandardERC20.b[0], 'deployed name incorrect')
      assert.equal(deployedSymbol, contractParameters.token.StandardERC20.b[1], 'deployed symbol incorrect')
      assert.equal(deployedDecimals, contractParameters.token.StandardERC20.b[2], 'deployed decimals incorrect')
      assert.equal(deployedSupply, contractParameters.token.StandardERC20.b[3], 'deployed supply incorrect')
      assert.equal(deployerBalance, contractParameters.token.StandardERC20.b[3], 'deployer account balance incorrect')

      // instances are in fact different
      assert.notEqual(instance1.address, instance2.address, 'duplicate contract addresses')  

      // instance1 state
      deployedName = await instance1.name()
      deployedSymbol = await instance1.symbol()
      deployedDecimals = asNumber(await instance1.decimals())
      deployedSupply = asNumber(await instance1.totalSupply())
      deployerBalance = asNumber(await instance1.balanceOf.call(accounts[0]))

      assert.equal(deployedName, contractParameters.token.StandardERC20.a[0], 'deployed name incorrect')
      assert.equal(deployedSymbol, contractParameters.token.StandardERC20.a[1], 'deployed symbol incorrect')
      assert.equal(deployedDecimals, contractParameters.token.StandardERC20.a[2], 'deployed decimals incorrect')
      assert.equal(deployedSupply, contractParameters.token.StandardERC20.a[3], 'deployed supply incorrect')
      assert.equal(deployerBalance, contractParameters.token.StandardERC20.a[3], 'deployer account balance incorrect')
    })

    it('removes contract types correctly', () => {

      assert(
        Object.keys(deployer.contractTypes).length, 2, 
        'incorrect number of contractTypes before removal'
      )

      assert(
        deployer.removeContract(StandardERC20_Test_JSON.contractName), true, 
        'expected ' + StandardERC20_Test_JSON.contractName + ' to exist'
      )

      assert(
        Object.keys(deployer.contractTypes).length, 1, 
        'incorrect number of contractTypes after removal'
      )

      assert(
        !deployer.removeContract('DoYouWantToLiveDeliciously?'), true, 
        'expected DoYouWantToLiveDeliciously? to not exist'
      )
    })
    // TODO: add test of deployed added contract
  })
  
  describe('deploy, getInstance, and callInstance', () => {

    const provider = ganache.provider()
    const web3 = new Web3(provider)

    const gas = 3141592

    let accounts, instance1, address1

    before('get accounts', async () => {
      accounts = await web3.eth.getAccounts()
    })

    it('deploys a contract correctly', async () => {

      instance1 = await deploy(
        StandardERC20_JSON,
        contractParameters.token.StandardERC20.a,
        provider,
        accounts[0],
        gas
      )

      // instance1 state
      const deployedName = await instance1.name()
      const deployedSymbol = await instance1.symbol()
      const deployedDecimals = asNumber(await instance1.decimals())
      const deployedSupply = asNumber(await instance1.totalSupply())
      const deployerBalance = asNumber(await instance1.balanceOf.call(accounts[0]))

      assert.equal(deployedName, contractParameters.token.StandardERC20.a[0], 'deployed name incorrect')
      assert.equal(deployedSymbol, contractParameters.token.StandardERC20.a[1], 'deployed symbol incorrect')
      assert.equal(deployedDecimals, contractParameters.token.StandardERC20.a[2], 'deployed decimals incorrect')
      assert.equal(deployedSupply, contractParameters.token.StandardERC20.a[3], 'deployed supply incorrect')
      assert.equal(deployerBalance, contractParameters.token.StandardERC20.a[3], 'deployer account balance incorrect')

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
      const deployedDecimals = asNumber(await instance1.decimals())
      const deployedSupply = asNumber(await instance1.totalSupply())
      const deployerBalance = asNumber(await instance1.balanceOf.call(accounts[0]))

      assert.equal(deployedName, contractParameters.token.StandardERC20.a[0], 'deployed name incorrect')
      assert.equal(deployedSymbol, contractParameters.token.StandardERC20.a[1], 'deployed symbol incorrect')
      assert.equal(deployedDecimals, contractParameters.token.StandardERC20.a[2], 'deployed decimals incorrect')
      assert.equal(deployedSupply, contractParameters.token.StandardERC20.a[3], 'deployed supply incorrect')
      assert.equal(deployerBalance, contractParameters.token.StandardERC20.a[3], 'deployer account balance incorrect')
    })

    it('calls functions using callInstance', async () => {

      const deployedName = await callInstance(instance1, 'name')
      const deployedSymbol = await callInstance(instance1, 'symbol')
      const deployedDecimals = asNumber(await callInstance(instance1, 'decimals'))
      const deployedSupply = asNumber(await callInstance(instance1, 'totalSupply'))
      const deployerBalance = asNumber(await callInstance(instance1, 'balanceOf', [accounts[0]]))

      assert.equal(deployedName, contractParameters.token.StandardERC20.a[0], 'deployed name incorrect')
      assert.equal(deployedSymbol, contractParameters.token.StandardERC20.a[1], 'deployed symbol incorrect')
      assert.equal(deployedDecimals, contractParameters.token.StandardERC20.a[2], 'deployed decimals incorrect')
      assert.equal(deployedSupply, contractParameters.token.StandardERC20.a[3], 'deployed supply incorrect')
      assert.equal(deployerBalance, contractParameters.token.StandardERC20.a[3], 'deployer account balance incorrect')
    })

    it('calls functions using callInstance, from different accounts', async () => {

      const deployerBalance = asNumber(await callInstance(instance1, 'balanceOf', [accounts[0]], accounts[1]))
      const acc1Balance = asNumber(await callInstance(instance1, 'balanceOf', [accounts[1]], accounts[2]))
      const acc2Balance = asNumber(await callInstance(instance1, 'balanceOf', [accounts[2]], accounts[3]))

      assert.equal(deployerBalance, contractParameters.token.StandardERC20.a[3], 'deployer account balance incorrect')
      assert.equal(acc1Balance, 0, 'account 1 balance incorrect')
      assert.equal(acc2Balance, 0, 'account 2 balance incorrect')
    })

    it('calls write functions using callInstance, from different accounts', async () => {

      await callInstance(instance1, 'transfer', [accounts[1], 500], accounts[0])
      await callInstance(instance1, 'transfer', [accounts[2], 250], accounts[1])

      const deployerBalance = asNumber(await callInstance(instance1, 'balanceOf', [accounts[0]], accounts[1]))
      const acc1Balance = asNumber(await callInstance(instance1, 'balanceOf', [accounts[1]], accounts[2]))
      const acc2Balance = asNumber(await callInstance(instance1, 'balanceOf', [accounts[2]], accounts[3]))

      assert.equal(deployerBalance, contractParameters.token.StandardERC20.a[3] - 500, 'deployer account balance incorrect')
      assert.equal(acc1Balance, 250, 'account 1 balance incorrect')
      assert.equal(acc2Balance, 250, 'account 2 balance incorrect')
    })
  })

  describe('other default contract types deploy correctly', () => {

    const provider = ganache.provider()
    const web3 = new Web3(provider)

    const gas = 3141592

    let accounts, mintableInstance, mintableAddress

    before('get accounts', async () => {
      accounts = await web3.eth.getAccounts()
    })

    it('MintableERC20', async () => {

      mintableInstance = await deploy(
        defaultContracts.MintableERC20,
        contractParameters.token.StandardERC20.a,
        provider,
        accounts[0],
        gas
      )

      // mintableInstance state
      const deployedName = await mintableInstance.name()
      const deployedSymbol = await mintableInstance.symbol()
      const deployedDecimals = asNumber(await mintableInstance.decimals())
      const deployedSupply = asNumber(await mintableInstance.totalSupply())
      const deployerBalance = asNumber(await mintableInstance.balanceOf.call(accounts[0]))

      assert.equal(deployedName, contractParameters.token.StandardERC20.a[0], 'deployed name incorrect')
      assert.equal(deployedSymbol, contractParameters.token.StandardERC20.a[1], 'deployed symbol incorrect')
      assert.equal(deployedDecimals, contractParameters.token.StandardERC20.a[2], 'deployed decimals incorrect')
      assert.equal(deployedSupply, contractParameters.token.StandardERC20.a[3], 'deployed supply incorrect')
      assert.equal(deployerBalance, contractParameters.token.StandardERC20.a[3], 'deployer account balance incorrect')

      mintableAddress = mintableInstance.address
    })

    it('StandardCrowdsale', async () => {

      const rate = 100

      standardCrowdsaleInstance = await deploy(
        defaultContracts.StandardCrowdsale,
        [ rate, accounts[1], mintableAddress, accounts[1] ],
        provider,
        accounts[1],
        gas
      )

      const deployedRate = asNumber(await standardCrowdsaleInstance.rate())
      const deployedWallet = await standardCrowdsaleInstance.wallet()
      const deployedToken = await standardCrowdsaleInstance.token()
      const deployedTokenWallet = await standardCrowdsaleInstance.tokenWallet()

      assert.equal(deployedRate, rate, 'deployed rate incorrect')
      assert.equal(deployedWallet.toLowerCase(), accounts[1].toLowerCase(), 'deployed wallet incorrect')
      assert.equal(deployedToken.toLowerCase(), mintableAddress.toLowerCase(), 'deployed token incorrect')
      assert.equal(deployedTokenWallet.toLowerCase(), accounts[1].toLowerCase(), 'deployed token wallet incorrect')
    })
  })
})
