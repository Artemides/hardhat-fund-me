import { Contract } from "ethers";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { FundMe, MockV3Aggregator } from "../../typechain-types";
import { assert } from "chai";
describe("Fundme test", async () => {
  let fundMe: FundMe;
  let deployer: string;
  let MockV3Aggregator: MockV3Aggregator;
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture("all");
    fundMe = await ethers.getContract("FundMe", deployer);
    MockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
  });

  describe("contructor", async () => {
    it("sets correctly the pricefeed address", async () => {
      const priceFeedAddress = await fundMe.agregator();
      assert.equal(priceFeedAddress, MockV3Aggregator.address);
    });
  });
});
