# ChainEnd
For programmatically deploying an arbitrary number of pre-compiled Solidity smart contracts.

Also comes with a clunky command line utility for, given `.sol` source files, finding dependencies of smart contracts and joining them into a single source file for easy Etherscan verification.

# Usage

Install using `npm install chain-end`. Command line utilities require Python.

## Smart Contract Deployment

The imported package contains the following relevant properties:
- The `contracts` object, which contains the JSON (`truffle compile` output) of the default contracts
- The `Deployer` class
    - Instantiate a deployer using `Deployer(web3Provider, accountAddress, gasLimit)`
        - For use with MetaMask, use `Deployer(web3Provider, accountAddress)` to let MetaMask handle transaction gas
    - Add a contract type to deploy instances of it using `deployer.addContract(compiledJSON)`
        - `compiledJSON` must be an undeployed, compiled Truffle artifact, i.e. the output of `truffle compile`
    - Deploy and access a deployed contract instance using `const instance = deployer.deploy(contractName, constructorParameters)`
        - ContractName must be a key from `contracts` or the name of a contract added using `addContract`
    - Consult `src/web3/deployer.js` for additional methods you may want to use
- The `deploy` function, which exposes the internal API of `Deployer` for stateless deployment
    - Deploy directly using: `deploy(contractJSON, constructorParams, web3Provider, web3Account, gasLimit)`
    - `gasLimit` is optional
- The `getInstance` function, which retrieves a deployed contract given its artifact, its deployed address, a provider, and (optionally) a sender account
- The `callInstance` function, which calls a specified function from a given TruffleContract instance and returns the result

## Command Line Utility

All scripts must be run from the `chain-end` project root directory.

- Do `npm run cli-setup`
- Place your `.sol` files in `solidity/source_files/raw`
    - Place your target contracts directly under `raw/`
    - Place your dependencies in some folder, e.g. `raw/dependencies`
    - `raw/` will contain all OpenZeppelin contracts in the `openzeppelin-contracts` folder (note the version in `package.json`)
- Do `npm run get-metadata`, notice the files output in `solidity/metadata`
- Do `npm run join-source-files -- solidity/metadata/metadataFile solidity/metadata/filepathsFile`
    - Both arguments are simply the files output by the previous script
- Do `npm run solcompile`
- Your contracts will now be available through the package in `module.exports.contracts`
    - Their Truffle artifacts will be in `solidity/compiled`
    - Their joined source files in `solidity/source_files/complete`

### Metadata

If the metadata interests you, here is a partial example output:
```
{
  "Address": {
    "compiler": "^0.5.0",
    "dependencies": [],
    "name": "Address",
    "type": "library"
  },
  "AllowanceCrowdsale": {
    "compiler": "^0.5.0",
    "dependencies": [
      "Crowdsale",
      "IERC20",
      "Math",
      "SafeERC20",
      "SafeMath"
    ],
    "name": "AllowanceCrowdsale",
    "type": "contract"
  },
  ...
}
```
    
# License
MIT
