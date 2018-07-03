
const StandardERC20 = artifacts.require('/Users/rekmarks/workspaces/ethereum/smart-contract-deployment-manager/truffle/contracts/tokens/StandardERC20.sol')

module.exports = (deployer) => {
	deployer.deploy(StandardERC20, 'BrittBrunoBux', 'BBX', 2, 12000)
}
