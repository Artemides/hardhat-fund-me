import { deployments, ethers, getNamedAccounts } from "hardhat";

describe("FundMe", async function () {
  this.beforeEach(async function () {
    const { deployer } = await getNamedAccounts();
    await deployments.fixture(["all"]);
    const fundMe = await ethers.getContract("FundMe", deployer);
  });
});
