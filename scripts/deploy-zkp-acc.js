const { ethers, network } = require("hardhat");
const { exit } = require("node:process");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainName = network.name;

  let childZKPVerifyContract;
  let RoodZKPVerifyContract;
  let deployedContract;

  if (chainName === "child") {
    console.log(`Deploying... ChildZKPVerify to child chain...`);
    childZKPVerifyContract = await ethers.getContractFactory("ChildZKPVerify", deployer);
    deployedContract = await childZKPVerifyContract.deploy(process.env.L2_STATE_SENDER);
  } else if (chainName === "root") {
    console.log(`Deploying... RootZKPVerify to root chain...`);
    RoodZKPVerifyContract = await ethers.getContractFactory("RootZKPVerify", deployer);
    deployedContract = await RoodZKPVerifyContract.deploy(process.env.STATE_SENDER);
  }

  console.log(`Finished Deploy, address : ${deployedContract.address}`);
}

// Root : 0x91373d9966C8323064621f47d8a0DBED8295A8fa
// Child : 0xCb295389188eafa45eA55cca32939a7713b7DC42

main()
  .then(() => exit(0))
  .catch((error) => {
    console.error(error);
    exit(1);
  });
