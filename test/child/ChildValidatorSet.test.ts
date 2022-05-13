import { expect } from "chai";
import * as hre from "hardhat";
import { ethers } from "hardhat";
import { Signer, BigNumber } from "ethers";
import * as mcl from "../../ts/mcl";
import { expandMsg } from "../../ts/hashToField";
import { BLS, ChildValidatorSet } from "../../typechain";

const DOMAIN = ethers.utils.arrayify(
  ethers.utils.hexlify(ethers.utils.randomBytes(32))
);

describe("ChildValidatorSet", () => {
  let bls: BLS,
    rootValidatorSetAddress: string,
    childValidatorSet: ChildValidatorSet,
    systemChildValidatorSet: ChildValidatorSet,
    stateSyncChildValidatorSet: ChildValidatorSet,
    validatorSetSize: number,
    accounts: any[]; // we use any so we can access address directly from object
  before(async () => {
    await mcl.init();
    accounts = await ethers.getSigners();

    rootValidatorSetAddress = ethers.Wallet.createRandom().address;

    const ChildValidatorSet = await ethers.getContractFactory(
      "ChildValidatorSet"
    );
    childValidatorSet = await ChildValidatorSet.deploy();

    await childValidatorSet.deployed();

    await hre.network.provider.send("hardhat_setBalance", [
      "0xffffFFFfFFffffffffffffffFfFFFfffFFFfFFfE",
      "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
    ]);
    await hre.network.provider.send("hardhat_setBalance", [
      "0x0000000000000000000000000000000000001001",
      "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
    ]);
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0xffffFFFfFFffffffffffffffFfFFFfffFFFfFFfE"],
    });
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x0000000000000000000000000000000000001001"],
    });
    const systemSigner = await ethers.getSigner(
      "0xffffFFFfFFffffffffffffffFfFFFfffFFFfFFfE"
    );
    const stateSyncSigner = await ethers.getSigner(
      "0x0000000000000000000000000000000000001001"
    );
    systemChildValidatorSet = childValidatorSet.connect(systemSigner);
    stateSyncChildValidatorSet = childValidatorSet.connect(stateSyncSigner);
  });
  it("Initialize without system call", async () => {
    await expect(
      childValidatorSet.initialize(rootValidatorSetAddress, [], [], [], [])
    ).to.be.revertedWith("ONLY_SYSTEMCALL");
  });
  it("Initialize and validate initialization", async () => {
    validatorSetSize = Math.floor(Math.random() * (5 - 1) + 1); // Randomly pick 1-5
    const validatorStake = ethers.utils.parseEther(
      String(Math.floor(Math.random() * (10000 - 1000) + 1000))
    );
    const validatorStakes = Array(validatorSetSize).fill(validatorStake);
    const addresses = [];
    const pubkeys = [];
    const validatorSet = [];
    for (let i = 0; i < validatorSetSize; i++) {
      const { pubkey, secret } = mcl.newKeyPair();
      pubkeys.push(mcl.g2ToHex(pubkey));
      addresses.push(accounts[i].address);
      validatorSet.push(i + 1);
    }
    await systemChildValidatorSet.initialize(
      rootValidatorSetAddress,
      addresses,
      pubkeys,
      validatorStakes,
      validatorSet
    );
    expect(await childValidatorSet.currentValidatorId()).to.equal(
      validatorSetSize
    );
    console.log(await childValidatorSet.currentValidatorId());
    for (let i = 0; i < validatorSetSize; i++) {
      const validator = await childValidatorSet.validators(i + 1);
      expect(validator.id).to.equal(i + 1);
      expect(validator._address).to.equal(addresses[i]);
      expect(validator.selfStake).to.equal(validatorStake);
      expect(validator.stake).to.equal(validatorStake);
      expect(
        await childValidatorSet.validatorIdByAddress(addresses[i])
      ).to.equal(validator.id);
    }
    // struct array is not available on typechain
    //expect(await childValidatorSet.epochs(1).validatorSet).to.deep.equal(validatorSet);
  });
  it("Attempt reinitialization", async () => {
    await expect(
      systemChildValidatorSet.initialize(
        rootValidatorSetAddress,
        [],
        [],
        [],
        []
      )
    ).to.be.revertedWith("ALREADY_INITIALIZED");
  });
  it("Commit epoch without system call", async () => {
    await expect(
      childValidatorSet.commitEpoch(0, 0, 0, ethers.utils.randomBytes(32))
    ).to.be.revertedWith("ONLY_SYSTEMCALL");
  });
  it("Commit epoch with unexpected id", async () => {
    await expect(
      systemChildValidatorSet.commitEpoch(0, 0, 0, ethers.utils.randomBytes(32))
    ).to.be.revertedWith("UNEXPECTED_EPOCH_ID");
  });
  it("Commit epoch with no blocks committed", async () => {
    await expect(
      systemChildValidatorSet.commitEpoch(1, 0, 0, ethers.utils.randomBytes(32))
    ).to.be.revertedWith("NO_BLOCKS_COMMITTED");
  });
  it("Commit epoch with incomplete sprint", async () => {
    await expect(
      systemChildValidatorSet.commitEpoch(
        1,
        1,
        63,
        ethers.utils.randomBytes(32)
      )
    ).to.be.revertedWith("INCOMPLETE_SPRINT");
  });
  it("Commit epoch", async () => {
    const epoch = {
      id: 1,
      startBlock: 1,
      endBlock: 64,
      epochRoot: ethers.utils.randomBytes(32),
    };
    await expect(
      systemChildValidatorSet.commitEpoch(
        epoch.id,
        epoch.startBlock,
        epoch.endBlock,
        epoch.epochRoot
      )
    );
    const storedEpoch = await childValidatorSet.epochs(epoch.id);
    expect(storedEpoch.id).to.equal(BigNumber.from(epoch.id));
    expect(storedEpoch.startBlock).to.equal(BigNumber.from(epoch.startBlock));
    expect(storedEpoch.endBlock).to.equal(BigNumber.from(epoch.endBlock));
    expect(storedEpoch.epochRoot).to.equal(
      ethers.utils.hexlify(epoch.epochRoot)
    );
  });
  it("Commit epoch with old block", async () => {
    await expect(
      systemChildValidatorSet.commitEpoch(
        2,
        64,
        127,
        ethers.utils.randomBytes(32)
      )
    ).to.be.revertedWith("BLOCK_IN_COMMITTED_EPOCH");
  });
  it("Validator registration state sync from wrong address", async () => {
    const wallet = ethers.Wallet.createRandom();
    await expect(
      childValidatorSet.onStateReceive(
        0,
        wallet.address,
        ethers.utils.randomBytes(1)
      )
    ).to.be.revertedWith("ONLY_STATESYNC");
  });
  it("Validator registration state sync data from wrong root validator set address", async () => {
    const wallet = ethers.Wallet.createRandom();
    await expect(
      stateSyncChildValidatorSet.onStateReceive(
        0,
        wallet.address,
        ethers.utils.randomBytes(1)
      )
    ).to.be.revertedWith("ONLY_ROOT");
  });
  it("Validator registration state sync data with wrong signature", async () => {
    const wallet = ethers.Wallet.createRandom();
    const { pubkey, secret } = mcl.newKeyPair();
    const data = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "uint256[4]"],
      [validatorSetSize, wallet.address, mcl.g2ToHex(pubkey)]
    );
    const encodedData = ethers.utils.defaultAbiCoder.encode(
      ["bytes32", "bytes"],
      [ethers.utils.randomBytes(32), data]
    );
    await expect(
      stateSyncChildValidatorSet.onStateReceive(
        0,
        rootValidatorSetAddress,
        encodedData
      )
    ).to.be.revertedWith("INVALID_SIGNATURE");
  });
  it("Validator registration state sync", async () => {
    const wallet = ethers.Wallet.createRandom();
    const { pubkey, secret } = mcl.newKeyPair();
    const strippedPubkey = mcl
      .g2ToHex(pubkey)
      .map((elem: any) => ethers.utils.hexValue(elem));
    const data = ethers.utils.defaultAbiCoder.encode(
      ["uint256", "address", "uint256[4]"],
      [validatorSetSize + 1, wallet.address, strippedPubkey]
    );
    const encodedData = ethers.utils.defaultAbiCoder.encode(
      ["bytes32", "bytes"],
      [
        "0xbddc396dfed8423aa810557cfed0b5b9e7b7516dac77d0b0cdf3cfbca88518bc",
        data,
      ]
    );
    await stateSyncChildValidatorSet.onStateReceive(
      0,
      rootValidatorSetAddress,
      encodedData
    );
    expect(await childValidatorSet.currentValidatorId()).to.equal(
      validatorSetSize + 1
    );
    const validator = await childValidatorSet.validators(validatorSetSize + 1);
    expect(validator.id).to.equal(validatorSetSize + 1);
    expect(validator._address).to.equal(wallet.address);
    expect(
      await childValidatorSet.validatorIdByAddress(wallet.address)
    ).to.equal(validator.id);
    //expect(validator.blsKey).to.deep.equal(strippedPubkey);
  });
});