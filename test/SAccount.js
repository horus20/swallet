const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("SAccount contract", function () {

    async function deploySAccountFixture() {
        // Get the ContractFactory and Signers here.
        const sAccountContract = await ethers.getContractFactory("SAccount");
        const sEntryPointContract = await ethers.getContractFactory("SEntryPoint");
        const [owner, addr1, addr2, addr3] = await ethers.getSigners();

        // To deploy our contract, we just have to call Token.deploy() and await
        // for it to be deployed(), which happens onces its transaction has been
        // mined.
        const sEntryPoint = await sEntryPointContract.deploy(owner.address);
        await sEntryPoint.deployed();

        const sAccount = await sAccountContract.deploy(sEntryPoint.address);
        await sAccount.deployed();

        // Fixtures can return anything you consider useful for your tests
        return {
            sAccountContract,
            sAccount,
            sEntryPointContract,
            sEntryPoint,
            owner,
            addr1,
            addr2,
            addr3,
        };
      }

    // deploy
    describe("Deployment", async function () {

        it("Should deploy and check entry point", async function () {
            const { sAccount, sEntryPoint, owner } = await loadFixture(deploySAccountFixture);

            expect(await sAccount.entryPoint()).to.equal(sEntryPoint.address);
            expect(await sEntryPoint.isOperator(owner.address)).to.equal(true);
        });
    });

    describe("Transactions", function () {
        it("Should emit error 'account: available only for EntryPoint operators and account operators'", async function () {
            // add/update owner keys
            const { sAccount, addr1 } = await loadFixture(deploySAccountFixture);

            await expect(sAccount.connect(addr1).updateOperator(addr1.address, true))
                .to.be.revertedWith("account: available only for EntryPoint operators and account operators");
        });

        it("Should add new owner key (address)", async function () {
            // add/update owner keys
            const { sAccount, sEntryPoint, owner, addr1, addr2, addr3 } = await loadFixture(deploySAccountFixture);

            // add addr1 as operator with entry point operator
            await expect(sAccount.connect(owner).updateOperator(addr1.address, true))
                .to.emit(sAccount, "OperatorListChanged").withArgs(addr1.address, true);

            // add addr2 as operator with addr1
            await expect(sAccount.connect(addr1).updateOperator(addr2.address, true))
                .to.emit(sAccount, "OperatorListChanged").withArgs(addr2.address, true);

            // disable addr1 operator with addr2
            await expect(sAccount.connect(addr2).updateOperator(addr1.address, false))
                .to.emit(sAccount, "OperatorListChanged").withArgs(addr1.address, false);

            // check addr1 disabled
            await expect(sAccount.connect(addr1).updateOperator(addr3.address, true))
                .to.be.revertedWith("account: available only for EntryPoint operators and account operators");
        });

        it("Should disable the old owner key (address)", async function () {
            // add/update owner keys
        });

        it("Should change an entry point", async function () {
            // update entry point
        });

        it("Should validate op - failed", async function () {
            // transaction - validate - failed
        });

        it("Should validate op and transfer", async function () {
            // transaction - validate - execute - emit event
        });
    })
});
