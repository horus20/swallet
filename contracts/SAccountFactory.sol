// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./SAccount.sol";

contract SAccountFactory {

    event SAccountCreated(address account);

    function createAccount(IEntryPointWithOperator anEntryPoint) public returns (SAccount account) {
        account = new SAccount(anEntryPoint);

        emit SAccountCreated(address(account));
    }
}
