export type NetworkConfig = {
  [key: string]: {
    name: string;
    priceFeedAddress: string;
  };
};
export const networkConfig: NetworkConfig = {
  11155111: {
    name: "sepolia",
    priceFeedAddress: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
};

export const developmentChains = ["local", "hardhat"];
