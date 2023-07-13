import { ethers } from 'hardhat';

import {
  createAccountOwner, fillUserOpDefaults, signUserOp,
} from './UserOp';
import { UserOperation } from './UserOperation';

const { expect } = require('chai');
const { loadFixture } = require('@nomicfoundation/hardhat-network-helpers');

describe('SAddressBook contract', () => {
  async function deployFixture() {
    // Get the ContractFactory and Signers here.
    const sAddressBookContract = await ethers.getContractFactory('SAddressBook');

    const [owner, addr1] = await ethers.getSigners();

    const sAddressBook = await sAddressBookContract.deploy(owner.address);
    await sAddressBook.deployed();

    // Fixtures can return anything you consider useful for your tests
    return {
      sAddressBook,
      owner,
      addr1,
    };
  }

  describe('Transactions', () => {
    it('should deploy account', async () => {
      const {
        sAddressBook, owner, addr1,
      } = await loadFixture(deployFixture);

      const wallet1 = createAccountOwner(0);
      const wallet2 = createAccountOwner(1);
      const wallet3 = createAccountOwner(2);

      const label1 = '79008004422';
      const label2 = 'MY_ADDRESS_NE_DOM';

      await expect(sAddressBook.connect(owner).updateAlias(label1, wallet1.address, true))
        .to.emit(sAddressBook, 'AliasChanged').withArgs(label1, wallet1.address, true);

      await expect(sAddressBook.connect(addr1).updateAlias(label2, wallet1.address, true))
        .to.be.revertedWith('account: available only for operator');

      await expect(sAddressBook.connect(owner).updateOperator(addr1.address, true))
        .to.emit(sAddressBook, 'OperatorListChanged').withArgs(addr1.address, true);

      await expect(sAddressBook.connect(addr1).updateAlias(label2, wallet2.address, true))
        .to.emit(sAddressBook, 'AliasChanged').withArgs(label2, wallet2.address, true);

      await expect(sAddressBook.connect(addr1).updateAlias(label2, wallet3.address, true))
        .to.emit(sAddressBook, 'AliasChanged').withArgs(label2, wallet3.address, true)
        .emit(sAddressBook, 'AddressChanged').withArgs(label2, wallet2.address, wallet3.address);

      const resW1 = await sAddressBook.getAddress(label1);
      expect(resW1).to.eq(wallet1.address);

      const resW2 = await sAddressBook.getAddress(label2);
      expect(resW2).to.eq(wallet3.address);

      await expect(sAddressBook.connect(addr1).updateAlias('VERY_LONG_LONG_LOOOO______OOOOOONG_LABEL', wallet1.address, true))
        .to.be.revertedWith('AA0. Alias is too long');

      await expect(sAddressBook.getAddress('00000'))
        .to.be.revertedWith('AA1. Alias not found or non-active');

      // disable label1
      await expect(sAddressBook.connect(owner).updateAlias(label1, wallet1.address, false))
        .to.emit(sAddressBook, 'AliasChanged').withArgs(label1, wallet1.address, false);

      await expect(sAddressBook.getAddress(label1))
        .to.be.revertedWith('AA1. Alias not found or non-active');
    });
  });
});
