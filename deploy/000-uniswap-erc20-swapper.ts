import hre from "hardhat";
import {
  DeployFunction,
  DeploymentSubmission,
} from "hardhat-deploy/dist/types";

export const erc20SwapperContractName = "UniswapV3ERC20Swapper";
export const UniswapRouterAddress =
  "0xE592427A0AEce92De3Edee1F18E0157C05861564";
export const WETHAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

const deployERC20Swapper: DeployFunction = async function () {
  const signers = await hre.ethers.getSigners();
  const adminSigner = signers[0];
  console.log(adminSigner.address);

  const deployment = await hre.deployments.getOrNull(erc20SwapperContractName);
  if (deployment) {
    console.log("Contract already deployed, skipping deployyment");
    return;
  }
  const erc20SwapperContract = await hre.ethers.deployContract(
    erc20SwapperContractName,
    [UniswapRouterAddress, WETHAddress],
    adminSigner
  );
  const contract = await erc20SwapperContract.waitForDeployment();
  const swapperAddress = contract.target;
  const artifact = await hre.deployments.getExtendedArtifact(
    erc20SwapperContractName
  );

  await hre.deployments.save(erc20SwapperContractName, {
    ...artifact,
    ...{ address: swapperAddress },
  } as DeploymentSubmission);
};

deployERC20Swapper.id = "deploy-erc20-swapper-uniswap";
deployERC20Swapper.tags = ["deploy-erc20-swapper-uniswap", "test"];
export default deployERC20Swapper;
