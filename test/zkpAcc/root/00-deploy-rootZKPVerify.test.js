const { ethers } = require("hardhat");

describe("RootZKPVerify", () => {
  let rootZKPVerify;
  let stateSender;
  let childZKPVerify;
  before(async () => {
    // accounts = await ethers.getSigner();

    const StateSender = await ethers.getContractFactory("StateSender");
    stateSender = await StateSender.deploy();

    await stateSender.deployed();

    childZKPVerify = ethers.Wallet.createRandom().address;

    const RootZKPVerify = await ethers.getContractFactory("RootZKPVerify");
    rootZKPVerify = await RootZKPVerify.deploy(stateSender.address);

    await rootZKPVerify.deployed();

    await rootZKPVerify.initialize(childZKPVerify);
  });

  it("verify", async () => {
    rootZKPVerify.verify(false);
  });
});
