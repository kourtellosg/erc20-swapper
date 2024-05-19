import hre from "hardhat";
import { DeployFunction } from "hardhat-deploy/dist/types";
import {
  UniswapRouterAddress,
  WETHAddress,
  erc20SwapperContractName,
} from "./000-uniswap-erc20-swapper";

const verifyERC20Swapper: DeployFunction = async function () {
  const deployment = await hre.deployments.getOrNull(erc20SwapperContractName);
  if (!deployment) {
    console.log("no deployment found - skipping verification");
    return;
  }

  if (hre.network.name !== "hardhat") {
    console.log("Contract verification started ...");
    console.log(
      `contracts/${erc20SwapperContractName}.sol:${erc20SwapperContractName}`
    );
    await hre.run("verify:verify", {
      address: deployment.address,
      contract: `contracts/${erc20SwapperContractName}.sol:${erc20SwapperContractName}`,
      constructorArguments: [UniswapRouterAddress, WETHAddress],
    });
    console.log("Contract verification completed ...");
  }
};

verifyERC20Swapper.id = "verify-erc20-swapper-uniswap";
verifyERC20Swapper.tags = [
  "deploy-erc20-swapper-uniswap",
  "verify-erc20-swapper-uniswap",
];
export default verifyERC20Swapper;
