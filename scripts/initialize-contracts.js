const { ethers, network } = require("hardhat");
const { exit } = require("node:process");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainName = network.name;

  let contract;
  let otherContract;

  if (chainName === "child") {
    console.log("Initialize Child Contract...");
    const childZKPVerifyContractFactory = await ethers.getContractFactory("ChildZKPVerify", deployer);
    contract = await childZKPVerifyContractFactory.attach("0xCb295389188eafa45eA55cca32939a7713b7DC42");
    otherContract = "0x91373d9966c8323064621f47d8a0dbed8295a8fa";
  } else if (chainName === "root") {
    console.log("Initialize Root Contract...");
    const rootZKPVerifyContractFactory = await ethers.getContractFactory("RootZKPVerify", deployer);
    contract = await rootZKPVerifyContractFactory.attach("0x91373d9966c8323064621f47d8a0dbed8295a8fa");
    otherContract = "0xCb295389188eafa45eA55cca32939a7713b7DC42";
  }

  const response = await contract.initialize(otherContract, { gasLimit: 1000000 });
  const receipt = await response.wait();

  console.log(`Finished initialize`);
  console.log(receipt);
}

// Root : 0x91373d9966C8323064621f47d8a0DBED8295A8fa
// Child : 0xCb295389188eafa45eA55cca32939a7713b7DC42

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
