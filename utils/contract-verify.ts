import { run } from "hardhat";
export const verify = async (contractAddress: string, args: any[]) => {
  try {
    console.log("verifying contract");
    run("verify:verify", {
      address: contractAddress,
      args,
    });
  } catch (error: any) {
    if (error.message.toLowerCase().includes("already verified"))
      console.log("Already verified");
    else console.log({ error });
  }
};
