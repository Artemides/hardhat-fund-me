import { ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains } from "../../hardhat.config.helper";
import { NetworkConfig } from "../../hardhat.config.helper";
import { FundMe } from "../../typechain-types";
import { assert } from "chai";

developmentChains.includes(network.name)
  ? describe.skip
  : describe("fundMe", async () => {
      let fundMe: FundMe;
      let deployer: string;
      const SEND_ETHER = ethers.utils.parseEther("0.1");
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("Allows to fund and withdraw", async () => {
        const txFundResponse = await fundMe.fund({ value: SEND_ETHER });
        txFundResponse.wait(1);
        const txWithdrawResponse = await fundMe.withdraw();
        txWithdrawResponse.wait(1);

        const newFundeMeBalance = await fundMe.provider.getBalance(
          fundMe.address
        );

        assert.equal(newFundeMeBalance.toString(), "0");
      });
    });
