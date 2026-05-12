// License
// SDK-license-identifier: LGPL-3.0-only

// Solidity Version
pragma solidity ^0.8.34;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// Smart Contract
contract CryptoReal is ERC20{

    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_){
        _mint(msg.sender, 1000 * 1e18);
    
    }

    // State variable
    
    // Modifiers
    
    // Events
    
    // Functions
    
    // External functions
    
    // Internal functions

}
