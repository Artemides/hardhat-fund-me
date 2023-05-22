import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChains, networkConfig } from "../hardhat.config.helper";

module.exports = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  //mock contract:  is the the contract does not exist use a minimal or forked version for testing purpuses
  const { chainId } = hre.network.config;
  let ethUsdPriceFeeedAddress: string;
  if (developmentChains.includes(network.name)) {
    const ethusdAgregator = await deployments.get("MockV3Aggregator");
    ethUsdPriceFeeedAddress = ethusdAgregator.address;
  } else {
    ethUsdPriceFeeedAddress = networkConfig[chainId ?? ""]["priceFeedAddress"];
  }

  log("Deploying FundMe contractss");

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeeedAddress],
    log: true,
  });
};
module.exports.tags = ["all", "fundme"];
