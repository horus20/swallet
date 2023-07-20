// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./abstract/Operator.sol";

// import "hardhat/console.sol"; // todo: remove this

contract SAddressBook is Operator {

    uint256 public constant MAX_ALIAS_SIZE = 20;

    struct AddressInfo {
        address addr;
        bool active;
        bool isValue;
    }

    mapping(string => AddressInfo) private _addressBook;

    event AliasChanged(string addressAlias, address addr, bool active);
    event AddressChanged(string addressAlias, address oldAddr, address newAddr);

    constructor(address operator) {
        _updateOperator(operator, true);
    }

    function updateAlias(string calldata addressAlias, address addr, bool active) external {
        if (_addressBook[addressAlias].isValue) {
            _requireOperatorOrAddrOwner(_addressBook[addressAlias].addr);
        } else {
            _requireOperatorOrAddrOwner(addr);
        }
        _validateAlias(addressAlias);
        _updateAlias(addressAlias, addr, active);
    }

    function _requireOperatorOrAddrOwner(address addr) internal view {
        require(this.isOperator(msg.sender) || addr == msg.sender, "account: available only for operator or address owner");
    }

    function _validateAlias(string calldata addressAlias) internal {
        if (bytes(addressAlias).length > MAX_ALIAS_SIZE) {
            revert("AA0. Alias is too long");
        }
    }

    function _updateAlias(string calldata addressAlias, address addr, bool active) internal {
        if (_addressBook[addressAlias].isValue) {
            if (_addressBook[addressAlias].addr != addr) {

                emit AddressChanged(addressAlias, _addressBook[addressAlias].addr, addr);
            }
            _addressBook[addressAlias].addr = addr;
            _addressBook[addressAlias].active = active;
        } else {
            _addressBook[addressAlias] = AddressInfo(addr, active, true);
        }
        emit AliasChanged(addressAlias, addr, active);
    }

    function getAddressByAlias(string calldata addressAlias) external view returns (address) {
        if (_addressBook[addressAlias].isValue && _addressBook[addressAlias].active) {
            return _addressBook[addressAlias].addr;
        }
        revert("AA1. Alias not found or non-active");
    }
}
