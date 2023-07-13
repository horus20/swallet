import { ethers } from 'hardhat';

import { parseEther } from 'ethers/lib/utils';
import {
  createAccountOwner, fillAndSign, fillUserOpDefaults, getAccountInitCode, getBalance, getUserOpHash, ONE_ETH, signUserOp,
} from './UserOp';
import { UserOperation } from './UserOperation';

const { expect } = require('chai');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

describe('SAccount contract', () => {
  async function deploySAccountFixture() {
    // Get the ContractFactory and Signers here.
    const sAccountContract = await ethers.getContractFactory('SAccount');
    const sEntryPointContract = await ethers.getContractFactory('SEntryPoint');
    const sAccountFactoryContract = await ethers.getContractFactory('SAccountFactory');

    const [owner] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    const sEntryPoint = await sEntryPointContract.deploy(owner.address);
    await sEntryPoint.deployed();

    const sAccountFactory = await sAccountFactoryContract.deploy();
    await sAccountFactory.deployed();

    const sAccount = await sAccountContract.deploy(sEntryPoint.address);
    await sAccount.deployed();

    // Fixtures can return anything you consider useful for your tests
    return {
      sAccountContract,
      sAccountFactory,
      sAccount,
      sEntryPointContract,
      sEntryPoint,
      owner,
    };
  }

  describe('Transactions', () => {
    it('should deploy account', async () => {
      const {
        sEntryPoint, owner, sAccountFactory, sAccount,
      } = await loadFixture(deploySAccountFixture);

      /* const wallet = createAccountOwner(0);

      const callGasLimit = 2000000;
      const verificationGasLimit = 1000000;

      const initCode = getAccountInitCode(sAccountFactory, sEntryPoint.address);
      const sender = await sEntryPoint.callStatic.getSenderAddress(initCode).catch((e) => e.errorArgs.sender);
      console.log(initCode, sender);

      const op = await fillAndSign({
        sender,
        initCode,
        callGasLimit,
        verificationGasLimit,
      }, wallet, sEntryPoint);

      await sEntryPoint.connect(owner).simulateValidation(op); */

      let tx = await sAccountFactory.connect(owner).createAccount(sEntryPoint.address);
      let receipt = await tx.wait();
      expect(tx).to.emit(sAccountFactory, 'SAccountCreated');
      const wallet1address = receipt.events?.filter((x) => x.event === 'SAccountCreated')[0].args[0];
      // console.log(wallet1address);

      tx = await sAccountFactory.connect(owner).createAccount(sEntryPoint.address);
      receipt = await tx.wait();
      expect(tx).to.emit(sAccountFactory, 'SAccountCreated');
      const wallet2address = receipt.events?.filter((x) => x.event === 'SAccountCreated')[0].args[0];
      // console.log(wallet2address);

      // test new wallet
      const wallet = createAccountOwner(0);
      const callGasLimit = 200000;
      const verificationGasLimit = 100000;
      const maxFeePerGas = 3e9;
      const chainId = await ethers.provider.getNetwork().then((net) => net.chainId);
      const unsignedUserOp = fillUserOpDefaults({
        sender: wallet1address,
        callGasLimit,
        verificationGasLimit,
        maxFeePerGas,
      });

      const userOp: UserOperation = signUserOp(unsignedUserOp, wallet, sEntryPoint.address, chainId);
      try {
        await sEntryPoint.connect(owner).simulateValidation(userOp);
      } catch (e: any) {
        expect(e.message).to.include('FailedOp(0, "AA24 signature error")');
      }

      // add wallet to
      await owner.sendTransaction({
        to: wallet1address,
        value: 0,
        data: sAccount.interface.encodeFunctionData('updateOperator', [wallet.address, true]),
      });
      await owner.sendTransaction({
        to: wallet2address,
        value: 0,
        data: sAccount.interface.encodeFunctionData('updateOperator', [wallet.address, true]),
      });

      try {
        await sEntryPoint.connect(owner).simulateValidation(userOp);
      } catch (e: any) {
        expect(e.message).to.include('ValidationResult');
      }

      unsignedUserOp.sender = wallet2address;
      const userOp2: UserOperation = signUserOp(unsignedUserOp, wallet, sEntryPoint.address, chainId);
      try {
        await sEntryPoint.connect(owner).simulateValidation(userOp2);
      } catch (e: any) {
        expect(e.message).to.include('ValidationResult');
      }
    });
  });
});
