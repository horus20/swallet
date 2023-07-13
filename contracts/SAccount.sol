pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

import "@account-abstraction/contracts/core/BaseAccount.sol";
import "./abstract/TokenCallbackHandler.sol";
import "./abstract/Operator.sol";
import "./interfaces/IEntryPointWithOperator.sol";

import "hardhat/console.sol"; // todo: remove this
/**
  * minimal account.
  *  this is sample minimal account.
  *  has execute, eth handling methods
  *  has a single signer that can send requests through the entryPoint.
  */
contract SAccount is Operator, BaseAccount, TokenCallbackHandler, UUPSUpgradeable, Initializable {
    using ECDSA for bytes32;

    IEntryPointWithOperator private _entryPoint;

    event SimpleAccountInitialized(IEntryPointWithOperator indexed entryPoint);

    function entryPoint() public view virtual override returns (IEntryPoint) {
        return _entryPoint;
    }

    function entryPointWithOperator() public view returns (IEntryPointWithOperator) {
        return _entryPoint;
    }


    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    constructor(IEntryPointWithOperator anEntryPoint) {
        _entryPoint = anEntryPoint;
        _disableInitializers();
    }

    function changeEntryPoint(IEntryPointWithOperator newEntryPoint) external {
        _requireFromEntryPointOrOwner();
        _entryPoint = newEntryPoint;
        _entryPointChanged();
    }

    /**
     * execute a transaction (called directly from owner, or by entryPoint)
     */
    function execute(address dest, uint256 value, bytes calldata func) external {
        _requireFromEntryPointOrOwner();

        console.log("execute: %s %s", dest, value);
        _call(dest, value, func);
    }

    /**
     * execute a sequence of transactions
     */
    function executeBatch(address[] calldata dest, bytes[] calldata func) external {
        _requireFromEntryPointOrOwner();
        require(dest.length == func.length, "wrong array lengths");
        for (uint256 i = 0; i < dest.length; i++) {
            _call(dest[i], 0, func[i]);
        }
    }

    function updateOperator(address operator, bool status) external virtual override {
        _requireFromEntryPointOrOperatorOrOwner();
        _updateOperator(operator, status);
    }

    /**
     * @dev The _entryPoint member is immutable, to reduce gas consumption.  To upgrade EntryPoint,
     * a new implementation of SimpleAccount must be deployed with the new EntryPoint address, then upgrading
      * the implementation by calling `upgradeTo()`
     */
    function initialize() public virtual initializer {
        _entryPointChanged();
    }

    function _entryPointChanged() internal virtual {
        emit SimpleAccountInitialized(_entryPoint);
    }

    // Require the function call went through EntryPoint or owner
    function _requireFromEntryPointOrOwner() internal view {
        require(msg.sender == address(entryPoint()) || this.isOperator(msg.sender), "account: available only for EntryPoint and account operators");
    }

    function _requireFromEntryPointOrOperatorOrOwner() internal view {
        require(msg.sender == address(entryPoint()) || this.isOperator(msg.sender) || entryPointWithOperator().isOperator(msg.sender), "account: available only for EntryPoint operators and account operators");
    }

    /// implement template method of BaseAccount
    function _validateSignature(UserOperation calldata userOp, bytes32 userOpHash) internal override virtual returns (uint256 validationData) {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        address operator = hash.recover(userOp.signature);

        // console.log("address: %s", operator);
        // console.logBytes32(userOpHash);

        if (!this.isOperator(operator)) {
            // console.log("SIG_VALIDATION_FAILED");
            return SIG_VALIDATION_FAILED;
        }
        // console.log("Signature success");
        return 0;
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value : value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    function _authorizeUpgrade(address newImplementation) internal view override {
        (newImplementation);
        _requireFromEntryPointOrOperatorOrOwner();
    }
}
