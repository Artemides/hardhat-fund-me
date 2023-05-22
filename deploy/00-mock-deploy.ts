import { HardhatRuntimeEnvironment } from "hardhat/types";

const DECIMALS = "18";
const INITIAL_PRICE = "2000000000000000000000";

const deployMocks = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  if (chainId === 31337) {
    log("Deploying mocks...");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });
    log("Mock deployed");
    log("*************************");
  }
};

deployMocks.tags = ["all", "mocks"];

export default deployMocks;
