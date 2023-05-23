import { Contract } from "ethers";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { FundMe, MockV3Aggregator } from "../../typechain-types";
import { assert, expect } from "chai";
describe("Fundme test", async () => {
  let fundMe: FundMe;
  let deployer: string;
  let deployerAddress: string;
  let MockV3Aggregator: MockV3Aggregator;
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;
    deployerAddress = (await ethers.getSigners())[0].address;
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
  describe("fundMe", async () => {
    it("fails when not enough eth is funded", async () => {
      await expect(fundMe.fund()).to.be.revertedWithCustomError(
        fundMe,
        "NotEnoughDonation"
      );
    });

    it("adds the funder only once into the funders list", async () => {
      await fundMe.fund({ value: ethers.utils.parseEther("1") });
      await fundMe.fund({ value: ethers.utils.parseEther("1") });
      await fundMe.fund({ value: ethers.utils.parseEther("1") });
      const [, timesFunderAddedIntoFundersList] = await fundMe.founderExists(
        deployer
      );
      assert.equal(timesFunderAddedIntoFundersList.toString(), "1");
    });

    it("icreases the funder's ammount each funding", async () => {
      const ammountToFund = ethers.utils.parseEther("1");
      const [currentFounderFunds] = await fundMe.foundsByFounder(deployer);
      await fundMe.fund({ value: ammountToFund });
      const [updatedFunderFunds] = await fundMe.foundsByFounder(deployer);

      assert.equal(
        updatedFunderFunds.toString(),
        currentFounderFunds.add(ammountToFund).toString()
      );
    });
  });
});
