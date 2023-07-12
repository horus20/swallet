pragma solidity ^0.8.12;

import "../interfaces/IOperator.sol";

contract Operator is IOperator {

    struct OperatorVal {
        address operator;
        bool status;
    }

    OperatorVal[] operators;

    event OperatorListChanged(address operator, bool enabled);

    function isOperator(address operator) external view returns (bool result) {
        uint i;
        for(i = 0; i < operators.length; i++)
        {
            if(operators[i].operator == operator)
            {
                return operators[i].status;
            }
        }
        return false;
    }

    function disableAllOperators() external {
        _requireOperator();
        _disableAllOperators();
    }

    function _disableAllOperators() internal {
        uint i;
        for(i = 0; i < operators.length; i++)
        {
            if(operators[i].operator != msg.sender)
            {
                operators[i].status = false;
                emit OperatorListChanged(operators[i].operator, operators[i].status);
            }
        }
    }

    function _requireOperator() internal view {
        require(this.isOperator(msg.sender), "account: available only for operator");
    }

    function updateOperator(address operator, bool status) external virtual {
        _requireOperator();
        _updateOperator(operator, status);
    }

    function _updateOperator(address operator, bool status) internal {
        uint i;
        for(i = 0; i < operators.length; i++)
        {
            if(operators[i].operator == operator)
            {
                operators[i].status = status;
                break;
            }
        }
        if (i >= operators.length) {
            operators.push(OperatorVal(operator, status));
        }

        emit OperatorListChanged(operator, status);
    }
}
