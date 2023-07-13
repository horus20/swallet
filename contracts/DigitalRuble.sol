// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract DigitalRuble is ERC20, ERC20Permit, Ownable {
    constructor() ERC20("DigitalRuble", "RDR") ERC20Permit("DigitalRuble") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function pp() public view {
        console.log(this.owner());
    }
}
