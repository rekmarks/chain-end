
pragma solidity ^0.5.0;

/**
 * @title BurnableERC20 token
 * Wraps OpenZeppelin ERC20Burnable and ERC20Detailed. The constructor
 * sets the total supply of the token and grants all tokens to msg.sender
 */
contract BurnableERC20 is ERC20, ERC20Burnable, ERC20Detailed {

    /**
     * @dev Calls ERC20Detailed constructor and sets totalSupply and
     * balances[msg.sender] to equal supply.
     *
     * supply must be pre-validated to match decimals. Suggest accept user
     * input and calculate correct values before calling constructor.
     */
    constructor
      (
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 supply
      )
      ERC20()
      ERC20Detailed(name, symbol, decimals)
      ERC20Burnable()
      public
    {
      _mint(msg.sender, supply);
    }
}
