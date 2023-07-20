import { arrayify, defaultAbiCoder, keccak256 } from "ethers/lib/utils";

import { ecsign, keccak256 as keccak256_buffer, toRpcSig } from 'ethereumjs-util';

export const AddressZero = "0x0000000000000000000000000000000000000000";
export const DefaultsForUserOp = {
  sender: AddressZero,
  nonce: 0,
  initCode: '0x',
  callData: '0x',
  callGasLimit: 0,
  verificationGasLimit: 150000, // default verification gas. will add create2 cost (3200+200*length) if initCode exists
  preVerificationGas: 21000, // should also cover calldata cost.
  maxFeePerGas: 0,
  maxPriorityFeePerGas: 1e9,
  paymasterAndData: '0x',
  signature: '0x',
};
export function packUserOp(op, forSignature = true) {
  if (forSignature) {
    return defaultAbiCoder.encode(
      ['address', 'uint256', 'bytes32', 'bytes32',
        'uint256', 'uint256', 'uint256', 'uint256', 'uint256',
        'bytes32'],
      [op.sender, op.nonce, keccak256(op.initCode), keccak256(op.callData),
        op.callGasLimit, op.verificationGasLimit, op.preVerificationGas, op.maxFeePerGas, op.maxPriorityFeePerGas,
        keccak256(op.paymasterAndData)],
    );
  }
  // for the purpose of calculating gas cost encode also signature (and no keccak of bytes)
  return defaultAbiCoder.encode(
    ['address', 'uint256', 'bytes', 'bytes',
      'uint256', 'uint256', 'uint256', 'uint256', 'uint256',
      'bytes', 'bytes'],
    [op.sender, op.nonce, op.initCode, op.callData,
      op.callGasLimit, op.verificationGasLimit, op.preVerificationGas, op.maxFeePerGas, op.maxPriorityFeePerGas,
      op.paymasterAndData, op.signature],
  );
}
export function getUserOpHash(op, entryPoint, chainId) {
  const userOpHash = keccak256(packUserOp(op, true));
  const enc = defaultAbiCoder.encode(
    ['bytes32', 'address', 'uint256'],
    [userOpHash, entryPoint, chainId],
  );
  return keccak256(enc);
}
export function signUserOp(op, signer, entryPoint, chainId) {
  const message = getUserOpHash(op, entryPoint, chainId);
  const msg1 = Buffer.concat([
    Buffer.from('\x19Ethereum Signed Message:\n32', 'ascii'),
    Buffer.from(arrayify(message)),
  ]);

  const sig = ecsign(keccak256_buffer(msg1), Buffer.from(arrayify(signer.privateKey)));
  // that's equivalent of:  await signer.signMessage(message);
  // (but without "async"
  const signedMessage1 = toRpcSig(sig.v, sig.r, sig.s);
  return {
    ...op,
    signature: signedMessage1,
  };
}

export function fillUserOpDefaults(op, defaults = DefaultsForUserOp) {
  const partial = { ...op };
  // we want "item:undefined" to be used from defaults, and not override defaults, so we must explicitly
  // remove those so "merge" will succeed.
  // eslint-disable-next-line no-restricted-syntax
  for (const key in partial) {
    if (partial[key] == null) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete partial[key];
    }
  }
  const filled = { ...defaults, ...partial };
  return filled;
}
