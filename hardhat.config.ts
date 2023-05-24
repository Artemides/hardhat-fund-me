import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import { HardhatUserConfig } from "hardhat/types";
import "dotenv/config";

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL!;
const METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY!;
const COINMARKET_API_KEY = process.env.COINMARKET_API_KEY!;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY!;
const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [METAMASK_PRIVATE_KEY],
      chainId: 11155111,
    },
    local: {
      url: "http://127.0.0.1:8545",
    },
  },

  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: COINMARKET_API_KEY,
  },

  solidity: {
    compilers: [
      {
        version: "0.8.18",
      },
      {
        version: "0.8.0",
      },
    ],
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: { default: 0 },
    user: {
      default: 1,
    },
  },
};

export default config;
