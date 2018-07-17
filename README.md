# chain-end
For programmatically deploying an arbitrary number of pre-compiled smart contracts, and, Soon:tm:, interacting with them in all sorts of interesting ways.

## usage

The imported package contains two modules:
- the `contracts` object, which contains the JSON of the default contracts
    - currently, this is just one OpenZeppelin-based ERC20 token contract: `StandardERC20`
- the `Deployer` class
    - instantiate a deployer using `Deployer(web3Provider, accountAddress, gasLimit)`
    - add a contract type to deploy instances of it using `deployer.addContract(compiledJSON)`
        - `compiledJSON` must be an undeployed, compiled Truffle artifact, i.e. the output of `truffle compile`
    - deploy and access a deployed contract instance using `const instance = deployer.deploy(contractName, constructorParameters)`
        - contractName must be `StandardERC20` or the name of a contract added using `addContract`
    - consult `src/deployer.js` for additional methods you may want to use
