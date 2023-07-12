pragma solidity ^0.8.12;

import "./IOperator.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";

interface IEntryPointWithOperator is IOperator, IEntryPoint {

}
