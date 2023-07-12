// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

/* solhint-disable avoid-low-level-calls */
/* solhint-disable no-inline-assembly */
import "@account-abstraction/contracts/core/EntryPoint.sol";
import "./abstract/Operator.sol";

contract SEntryPoint is Operator, EntryPoint {

    constructor(address operator) EntryPoint() {
        _updateOperator(operator, true);
    }
}
