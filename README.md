# chain-end
For programmatically deploying an arbitrary number of pre-compiled smart contracts, and, Soon:tm:, interacting with them in all sorts of interesting ways.

## usage

The imported package contains three modules:
- the `contracts` object, which contains the JSON of the default contracts
    - currently, this is just one OpenZeppelin-based ERC20 token contract: `StandardERC20`
- the `Deployer` class
    - instantiate a deployer using `Deployer(web3Provider, accountAddress, gasLimit)`
        - for use with MetaMask, use `Deployer(web3Provider, accountAddress)` to let MetaMask handle transaction gas
    - add a contract type to deploy instances of it using `deployer.addContract(compiledJSON)`
        - `compiledJSON` must be an undeployed, compiled Truffle artifact, i.e. the output of `truffle compile`
    - deploy and access a deployed contract instance using `const instance = deployer.deploy(contractName, constructorParameters)`
        - contractName must be `StandardERC20` or the name of a contract added using `addContract`
    - consult `src/deployer.js` for additional methods you may want to use
- the `deploy` function, which exposes the internal API of `Deployer` for stateless deployment
    - deploy directly using: `deploy(contractJSON, constructorParams, web3Provider, web3Account, gasLimit)`
    - `gasLimit` is optional
- the `getInstance` function, which retrieves a deployed contract given its artifact, its deployed address, a provider, and (optionally) a sender account
- the `callInstance` function, which calls a specified function from a given TruffleContract instance and returns the result
