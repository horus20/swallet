import { artifacts, ethers } from "hardhat";

import { parseEther } from 'ethers/lib/utils';
import { UserOperation } from './UserOperation';
import {
  AddressZero,
  createAccountOwner, fillAndSign, fillUserOpDefaults, getBalance, ONE_ETH, signUserOp,
} from './UserOp';

const { expect } = require('chai');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

describe('SAccount contract', () => {
  async function deploySAccountFixture() {
    // Get the ContractFactory and Signers here.
    const sAccountContract = await ethers.getContractFactory('SAccount');
    const sEntryPointContract = await ethers.getContractFactory('SEntryPoint');
    const Token = await ethers.getContractFactory('DigitalRuble');
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // To deploy our contract, we just have to call Token.deploy() and await
    // for it to be deployed(), which happens onces its transaction has been
    // mined.
    const sEntryPoint = await sEntryPointContract.deploy(owner.address);
    await sEntryPoint.deployed();

    const secondEntryPoint = await sEntryPointContract.deploy(owner.address);
    await secondEntryPoint.deployed();

    const sAccount = await sAccountContract.deploy(sEntryPoint.address);
    await sAccount.deployed();

    // const cArtifact = artifacts.readArtifactSync('SAccount');
    // console.log(JSON.stringify(cArtifact));

    const rdrToken = await Token.deploy();
    await rdrToken.deployed();

    const { provider } = ethers;

    // Fixtures can return anything you consider useful for your tests
    return {
      sAccountContract,
      sAccount,
      sEntryPointContract,
      sEntryPoint,
      secondEntryPoint,
      rdrToken,
      provider,
      owner,
      addr1,
      addr2,
      addr3,
    };
  }

  // deploy
  describe('Deployment', async () => {
    it('Should deploy and check entry point', async () => {
      const { sAccount, sEntryPoint, owner } = await loadFixture(deploySAccountFixture);

      expect(await sAccount.entryPoint()).to.equal(sEntryPoint.address);
      expect(await sEntryPoint.isOperator(owner.address)).to.equal(true);
    });
  });

  describe('Transactions', () => {
    it("Should emit error 'account: available only for EntryPoint operators and account operators'", async () => {
      // add/update owner keys
      const { sAccount, addr1 } = await loadFixture(deploySAccountFixture);

      await expect(sAccount.connect(addr1).updateOperator(addr1.address, true))
        .to.be.revertedWith('account: available only for EntryPoint operators and account operators');
    });

    it('Should check add new owner keys (address)', async () => {
      // add/update owner keys
      const {
        sAccount, owner, addr1, addr2,
      } = await loadFixture(deploySAccountFixture);

      // add addr1 as operator with entry point operator
      await expect(sAccount.connect(owner).updateOperator(addr1.address, true))
        .to.emit(sAccount, 'OperatorListChanged').withArgs(addr1.address, true);

      // add addr2 as operator with addr1
      await expect(sAccount.connect(addr1).updateOperator(addr2.address, true))
        .to.emit(sAccount, 'OperatorListChanged').withArgs(addr2.address, true);
    });

    it('Should disable the old owner key (address)', async () => {
      const {
        sAccount, owner, addr1, addr2, addr3,
      } = await loadFixture(deploySAccountFixture);

      // add addr1 as operator with entry point operator
      await expect(sAccount.connect(owner).updateOperator(addr1.address, true))
        .to.emit(sAccount, 'OperatorListChanged').withArgs(addr1.address, true);

      // add addr2 as operator with addr1
      await expect(sAccount.connect(addr1).updateOperator(addr2.address, true))
        .to.emit(sAccount, 'OperatorListChanged').withArgs(addr2.address, true);

      // disable addr1 operator with addr2
      await expect(sAccount.connect(addr2).updateOperator(addr1.address, false))
        .to.emit(sAccount, 'OperatorListChanged').withArgs(addr1.address, false);

      // check addr1 disabled
      await expect(sAccount.connect(addr1).updateOperator(addr3.address, true))
        .to.be.revertedWith('account: available only for EntryPoint operators and account operators');

      // reenable addr1
      await expect(sAccount.connect(addr2).updateOperator(addr1.address, true))
        .to.emit(sAccount, 'OperatorListChanged').withArgs(addr1.address, true);
      await expect(sAccount.connect(addr2).updateOperator(addr3.address, true))
        .to.emit(sAccount, 'OperatorListChanged').withArgs(addr3.address, true);

      // disable all exclude addr1
      await expect(sAccount.connect(addr1).disableAllOperators())
        .to.emit(sAccount, 'OperatorListChanged').withArgs(addr2.address, false)
        .to.emit(sAccount, 'OperatorListChanged').withArgs(addr3.address, false);

      // check addr2 disabled
      await expect(sAccount.connect(addr2).updateOperator(addr1.address, false))
        .to.be.revertedWith('account: available only for EntryPoint operators and account operators');

      // check addr3 disabled
      await expect(sAccount.connect(addr3).updateOperator(addr1.address, false))
        .to.be.revertedWith('account: available only for EntryPoint operators and account operators');
    });

    it('Should change an entry point', async () => {
      // update entry point
      const {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        sAccount, sEntryPoint, secondEntryPoint, owner, addr1, addr2, addr3,
      } = await loadFixture(deploySAccountFixture);

      // add addr1 as operator with entry point operator
      await expect(sAccount.connect(owner).updateOperator(addr1.address, true))
        .to.emit(sAccount, 'OperatorListChanged').withArgs(addr1.address, true);

      await expect(sAccount.connect(owner).changeEntryPoint(secondEntryPoint.address))
        .to.be.revertedWith('account: available only for EntryPoint and account operators');

      await expect(sAccount.connect(addr1).changeEntryPoint(secondEntryPoint.address))
        .to.emit(sAccount, 'SimpleAccountInitialized').withArgs(secondEntryPoint.address);

      expect(await sAccount.entryPoint()).to.equal(secondEntryPoint.address);
    });

    it('should check signature failed/success', async () => {
      const {
        sAccount, sEntryPoint, owner,
      } = await loadFixture(deploySAccountFixture);

      const callGasLimit = 200000;
      const verificationGasLimit = 100000;
      const maxFeePerGas = 3e9;
      const chainId = await ethers.provider.getNetwork().then((net) => net.chainId);

      const wallet = createAccountOwner(0);
      const unsignedUserOp = fillUserOpDefaults({
        sender: sAccount.address,
        callGasLimit,
        verificationGasLimit,
        maxFeePerGas,
      });

      const userOp: UserOperation = signUserOp(unsignedUserOp, wallet, sEntryPoint.address, chainId);
      // const userOpHash = await getUserOpHash(userOp, sEntryPoint.address, chainId);
      // console.log(wallet.address, userOpHash);

      // const result = await sAccount.connect(addr1).validateUserOp({ ...userOp, nonce: 1 }, userOpHash, 0);
      try {
        await sEntryPoint.connect(owner).simulateValidation(userOp);
      } catch (e: any) {
        expect(e.message).to.include('FailedOp(0, "AA24 signature error")');
      }

      // add operator
      await expect(sAccount.connect(owner).updateOperator(wallet.address, true))
        .to.emit(sAccount, 'OperatorListChanged').withArgs(wallet.address, true);

      try {
        await sEntryPoint.connect(owner).simulateValidation(userOp);
      } catch (e: any) {
        expect(e.message).to.include('ValidationResult');
      }
    });

    it('Should validate op and transfer ETH', async () => {
      // transaction - validate - execute - emit event
      const {
        sAccount, sEntryPoint, owner, provider,
      } = await loadFixture(deploySAccountFixture);

      const wallet = createAccountOwner(0);
      const testWallet = createAccountOwner(1);

      await owner.sendTransaction({ to: sAccount.address, value: ONE_ETH });
      // console.log(`sAccount (${sAccount.address}) balance: `, await getBalance(provider, sAccount.address));
      // console.log(`testWallet (${testWallet.address}) balance: `, await getBalance(provider, testWallet.address));

      // console.log('Add sAccount operator with address: ', wallet.address);
      await expect(sAccount.connect(owner).updateOperator(wallet.address, true))
        .to.emit(sAccount, 'OperatorListChanged').withArgs(wallet.address, true);

      const callGasLimit = 200000;
      const verificationGasLimit = 100000;
      const maxFeePerGas = 3e9;
      const chainId = await ethers.provider.getNetwork().then((net) => net.chainId);

      const callData = sAccount.interface.encodeFunctionData('execute', [testWallet.address, parseEther('0.1'), '0x']);
      const nonce = await sAccount.getNonce();
      const unsignedUserOp = fillUserOpDefaults({
        sender: sAccount.address,
        nonce,
        callData,
        callGasLimit,
        verificationGasLimit,
        maxFeePerGas,
      });

      const userOp: UserOperation = signUserOp(unsignedUserOp, wallet, sEntryPoint.address, chainId);
      // const userOpHash = await getUserOpHash(userOp, sEntryPoint.address, chainId);
      // console.log('Try to run userOp, hash: ', userOpHash, userOp, 'owner: ', owner.address);

      const tx = await sEntryPoint.connect(owner).handleOps([userOp], AddressZero);
      const receipt = await tx.wait();

      const newBalanceSAccount = await getBalance(provider, sAccount.address);
      const newBalanceTestWallet = await getBalance(provider, testWallet.address);
      // console.log(`sAccount (${sAccount.address}) balance: `, newBalanceSAccount, ' Test wallet new balance: ', newBalanceTestWallet);

      expect(newBalanceSAccount).to.equal('0.9');
      expect(newBalanceTestWallet).to.equal('0.1');
    });

    it('Should validate op and transfer RDR', async () => {
      // transaction - validate - execute - emit event
      const {
        sAccount, sEntryPoint, owner, provider, rdrToken,
      } = await loadFixture(deploySAccountFixture);

      const wallet = createAccountOwner(0);
      const testWallet = createAccountOwner(1);

      // Transfer 50 tokens from owner to sAccount
      await expect(rdrToken.transfer(sAccount.address, 50))
        .to.emit(rdrToken, 'Transfer').withArgs(owner.address, sAccount.address, 50);

      // console.log(`sAccount (${sAccount.address}) balance: `, await rdrToken.balanceOf(sAccount.address), 'RDR');
      // console.log(`testWallet (${testWallet.address}) balance: `, await rdrToken.balanceOf(testWallet.address), 'RDR');

      // console.log(`sAccount (${sAccount.address}) balance: `, await getBalance(provider, sAccount.address), 'ETH');
      console.log(`owner (${owner.address}) balance: `, await getBalance(provider, owner.address), 'ETH');
      // console.log(`SEntryPoint (${sEntryPoint.address}) balance: `, await getBalance(provider, sEntryPoint.address), 'ETH');

      // console.log('RDR address: ', rdrToken.address);
      // console.log('Add sAccount operator with address: ', wallet.address);
      await expect(sAccount.connect(owner).updateOperator(wallet.address, true))
        .to.emit(sAccount, 'OperatorListChanged').withArgs(wallet.address, true);

      const callGasLimit = 200000;
      const verificationGasLimit = 100000;
      const maxFeePerGas = 3e9;
      const chainId = await ethers.provider.getNetwork().then((net) => net.chainId);

      const transferCallData = rdrToken.interface.encodeFunctionData('transfer', [testWallet.address, 51]);
      const callData = sAccount.interface.encodeFunctionData('execute', [rdrToken.address, parseEther('0'), transferCallData]);
      const nonce = await sAccount.getNonce();
      const unsignedUserOp = fillUserOpDefaults({
        sender: sAccount.address,
        nonce,
        callData,
        callGasLimit,
        verificationGasLimit,
        maxFeePerGas,
      });

      const userOp: UserOperation = signUserOp(unsignedUserOp, wallet, sEntryPoint.address, chainId);
      // const userOpHash = await getUserOpHash(userOp, sEntryPoint.address, chainId);
      // console.log('Try to run userOp, hash: ', userOpHash, userOp, 'owner: ', owner.address);

      //console.log(`sAccount (${sAccount.address}) balance: `, await rdrToken.balanceOf(sAccount.address), 'RDR');
      //await sEntryPoint.connect(owner).simulateHandleOp(userOp, sAccount.address, callData);

      const tx = await sEntryPoint.connect(owner).handleOps([userOp], AddressZero);
      const result = await tx.wait();
      console.log(result);

      const newBalanceSAccount = (await rdrToken.balanceOf(sAccount.address)).toString();
      const newBalanceTestWallet = (await rdrToken.balanceOf(testWallet.address)).toString();
      // console.log(`sAccount (${sAccount.address})  balance: `, newBalanceSAccount, 'RDR   Test wallet new balance: ', newBalanceTestWallet, 'RDR');

      // console.log(`sAccount (${sAccount.address}) balance: `, await getBalance(provider, sAccount.address), 'ETH');
      console.log(`owner (${owner.address}) balance: `, await getBalance(provider, owner.address), 'ETH');
      // console.log(`SEntryPoint (${sEntryPoint.address}) balance: `, await getBalance(provider, sEntryPoint.address), 'ETH');

      expect(newBalanceSAccount).to.equal('40');
      expect(newBalanceTestWallet).to.equal('10');
    });

    it('should revert if wallet not deployed (and no initcode)', async () => {
      const {
        sEntryPoint, owner,
      } = await loadFixture(deploySAccountFixture);

      const wallet = createAccountOwner(0);
      const op = await fillAndSign({
        sender: wallet.address,
        nonce: 0,
        verificationGasLimit: 1000,
      }, owner, sEntryPoint);

      try {
        await sEntryPoint.connect(owner).simulateValidation(op);
      } catch (e: any) {
        expect(e.message).to.include('FailedOp(0, "AA20 account not deployed")');
      }
    });
  });
});
