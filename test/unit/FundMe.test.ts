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
      const priceFeedAddress = await fundMe.getAgregator();
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
      const [currentFounderFunds] = await fundMe.getFounderFounds(deployer);
      await fundMe.fund({ value: ammountToFund });
      const [updatedFunderFunds] = await fundMe.getFounderFounds(deployer);

      assert.equal(
        updatedFunderFunds.toString(),
        currentFounderFunds.add(ammountToFund).toString()
      );
    });
  });

  describe("withdraw", async () => {
    beforeEach(async () => {
      await fundMe.fund({ value: ethers.utils.parseEther("1") });
    });
    it("Allow only the owner to withdraw", async () => {
      const accounts = await ethers.getSigners();
      const randomAccountIndex = Math.floor(Math.random() * accounts.length);
      const someAccount = accounts[randomAccountIndex];

      const fundMeConnected = fundMe.connect(someAccount);
      await expect(fundMeConnected.withdraw()).to.be.rejectedWith("NotOwner");
    });
    it("Withdraws from a single funder", async () => {
      const currentOwnerBalance = await ethers.provider.getBalance(deployer);
      const currentFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );

      const transactionResponse = await fundMe.withdraw();
      const { gasUsed, effectiveGasPrice } = await transactionResponse.wait(1);
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const updatedOwnerBalance = await ethers.provider.getBalance(deployer);
      const updatedFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );

      assert.equal(updatedFundMeBalance.toString(), "0");
      assert.equal(
        currentFundMeBalance.add(currentOwnerBalance).toString(),
        updatedOwnerBalance.add(gasCost).toString()
      );
    });

    it("Withdraws from multiple funders", async () => {
      const accounts = await ethers.getSigners();

      await Promise.all(
        accounts.map(async (account) => {
          const sigleFundMe = fundMe.connect(account);
          await sigleFundMe.fund({ value: ethers.utils.parseEther("1") });
        })
      );

      const currentOwnerBalance = await ethers.provider.getBalance(deployer);
      const currentFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );

      const transactionResponse = await fundMe.withdraw();
      const { gasUsed, effectiveGasPrice } = await transactionResponse.wait(1);
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const updatedOwnerBalance = await ethers.provider.getBalance(deployer);
      const updatedFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );

      assert.equal(updatedFundMeBalance.toString(), "0");
      assert.equal(
        currentFundMeBalance.add(currentOwnerBalance).toString(),
        updatedOwnerBalance.add(gasCost).toString()
      );

      await Promise.all(
        accounts.map(async (account) => {
          const [, availableFunds] = await fundMe.getFounderFounds(
            account.address
          );
          assert.equal(availableFunds.toString(), "0");
        })
      );
    });

    it("Withdraws cheaper", async () => {
      const accounts = await ethers.getSigners();

      await Promise.all(
        accounts.map(async (account) => {
          const sigleFundMe = fundMe.connect(account);
          await sigleFundMe.fund({ value: ethers.utils.parseEther("1") });
        })
      );

      const currentOwnerBalance = await ethers.provider.getBalance(deployer);
      const currentFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );

      const transactionResponse = await fundMe.withdrawCheaper();
      const { gasUsed, effectiveGasPrice } = await transactionResponse.wait(1);
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const updatedOwnerBalance = await ethers.provider.getBalance(deployer);
      const updatedFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );

      assert.equal(updatedFundMeBalance.toString(), "0");
      assert.equal(
        currentFundMeBalance.add(currentOwnerBalance).toString(),
        updatedOwnerBalance.add(gasCost).toString()
      );

      await Promise.all(
        accounts.map(async (account) => {
          const [, availableFunds] = await fundMe.getFounderFounds(
            account.address
          );
          assert.equal(availableFunds.toString(), "0");
        })
      );
    });
  });
});
