
pragma solidity ^0.5.0;

/**
 * @title StandardCrowdsale
 * Extends Crowdsale and AllowanceCrowdsale. Calls their constructors. No
 * additional functionality.
 */
contract StandardCrowdsale is Crowdsale, AllowanceCrowdsale {

  /**
   * @dev Calls Crowdsale and AllowanceCrowdsale constructors
   */
  constructor
    (
      uint256 rate,
      address payable wallet,
      IERC20 token,
      address tokenWallet
    )
    Crowdsale(rate, wallet, token)
    AllowanceCrowdsale(tokenWallet)
    public {}
}
