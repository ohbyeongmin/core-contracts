const { ethers } = require("hardhat");

describe("ChildZKPVerify", () => {
  let childZKPVerify;
  let l2StateSender;
  let rootZKPVerify;

  before(async () => {
    const L2StateSender = await ethers.getContractFactory("L2StateSender");
    l2StateSender = await L2StateSender.deploy();

    await l2StateSender.deployed();

    rootZKPVerify = ethers.Wallet.createRandom().address;

    const ChildZKPVerify = await ethers.getContractFactory("ChildZKPVerify");
    childZKPVerify = await ChildZKPVerify.deploy(l2StateSender.address);

    await childZKPVerify.deployed();

    await childZKPVerify.initialize(rootZKPVerify);
  });

  it("verify", async () => {
    childZKPVerify.verify(false);
    childZKPVerify.finishedVerify(1);
  });
});
