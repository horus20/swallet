pragma solidity ^0.8.12;

interface IOperator {

    function isOperator(address operator) external view returns (bool result);

    function updateOperator(address operator, bool status) external;

}
