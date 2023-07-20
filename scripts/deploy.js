// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const path = require("path");
const { createAccountOwner, ONE_ETH, getBalance } = require("../test/UserOp");
const { parseEther, formatEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  const { provider } = ethers;
  let owner = createAccountOwner(0);
  owner = owner.connect(provider);
  await deployer.sendTransaction({ to: owner.address, value: parseEther('100') });

  console.log("Account balance:", (await deployer.getBalance()).toString());
  console.log(`Owner (${owner.address}) balance: `, (await getBalance(provider, owner.address)) );
  console.log('Private key: ', owner.privateKey);

  let name = 'DigitalRuble';
  let Contract = await ethers.getContractFactory(name);
  let contract = await Contract.deploy();
  await contract.deployed();
  console.log(`${name}=${contract.address}`);
  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(contract, name);

  const tx = await contract.transfer(owner.address, parseEther('1000000'));
  await tx.wait();
  console.log(`Operator ${owner.address} balance:`, formatEther(await contract.balanceOf(owner.address)));

  name = 'SAddressBook';
  Contract = await ethers.getContractFactory(name);
  contract = await Contract.deploy(owner.address);
  await contract.deployed();
  console.log(`${name}=${contract.address}`);
  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(contract, name);

  name = 'SEntryPoint';
  Contract = await ethers.getContractFactory(name);
  const entryPoint = await Contract.deploy(owner.address);
  await entryPoint.deployed();
  console.log(`${name}=${entryPoint.address}`);
  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(entryPoint, name);

  name = 'SAccountFactory';
  Contract = await ethers.getContractFactory(name);
  contract = await Contract.deploy();
  await contract.deployed();
  console.log(`${name}=${contract.address}`);
  // We also save the contract's artifacts and address in the frontend directory
  saveFrontendFiles(contract, name);
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, `${name}-address.json`),
    JSON.stringify({ [name]: contract.address }, undefined, 2)
  );

  const cArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    path.join(contractsDir, `${name}.json`),
    JSON.stringify(cArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
