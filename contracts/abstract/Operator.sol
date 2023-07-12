pragma solidity ^0.8.12;

import "../interfaces/IOperator.sol";

contract Operator is IOperator {

    mapping(address => bool) operators;

    event OperatorListChanged(address operator, bool enabled);

    function isOperator(address operator) external view returns (bool result) {
        return operators[operator];
    }

    function _requireOperator() internal view {
        require(operators[msg.sender], "account: available only for operator");
    }

    function updateOperator(address operator, bool status) external virtual {
        _requireOperator();
        _updateOperator(operator, status);
    }

    function _updateOperator(address operator, bool status) internal {
        operators[operator] = status;
        emit OperatorListChanged(operator, status);
    }
}
