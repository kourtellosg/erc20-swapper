import hre from "hardhat";
import { ethers, deployments } from "hardhat";
import { Signer } from "ethers";
import { expect } from "chai";
import {
  AlphaRouter,
  SwapType,
  parseAmount,
} from "@uniswap/smart-order-router";
import { JsonRpcProvider } from "@ethersproject/providers";
import {
  WETHAddress,
  erc20SwapperContractName,
} from "../deploy/000-uniswap-erc20-swapper";
import { IERC20, UniswapV3ERC20Swapper } from "../dist/types";
import { CurrencyAmount, Percent, Token, TradeType } from "@uniswap/sdk-core";

const DAI_ADDRESS = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

describe("UniswapV3ERC20Swapper", function () {
  const chainId = 1;
  const provider = new JsonRpcProvider(
    "https://eth-mainnet.g.alchemy.com/v2/W4uMvp6CIJ6ehCxL68He-hYMShdblT2T"
  );
  const router = new AlphaRouter({
    chainId: chainId,
    provider: provider,
  });

  const name0 = "Wrapped Ether";
  const symbol0 = "WETH";
  const decimals0 = 18;
  const address0 = WETHAddress;

  const name1 = "DAI Token";
  const symbol1 = "DAI";
  const decimals1 = 18;
  const address1 = DAI_ADDRESS;

  const WETH = new Token(chainId, address0, decimals0, symbol0, name0);
  const DAI = new Token(chainId, address1, decimals1, symbol1, name1);

  let Erc20SwapperContract: UniswapV3ERC20Swapper;
  let Erc20SwapperContractAddress: string;
  let DAIContract: IERC20;

  let randomWallet1: Signer;
  let randomWallet1Address: string;

  const prepareTrade = async () => {
    const amountToSwap = ethers.parseEther("1");
    const swapAmountx = parseAmount("1", WETH);

    const trade = await router.route(swapAmountx, DAI, TradeType.EXACT_INPUT, {
      recipient: randomWallet1Address,
      slippageTolerance: new Percent(5, 100),
      type: SwapType.UNIVERSAL_ROUTER,
    });

    const minAmount = CurrencyAmount.fromFractionalAmount(
      trade?.trade.outputAmount.currency!,
      trade?.trade.outputAmount.numerator!,
      trade?.trade.outputAmount.denominator!
    ).toFixed(18);

    console.log(
      "Swapping",
      CurrencyAmount.fromFractionalAmount(
        trade?.trade.inputAmount.currency!,
        trade?.trade.inputAmount.numerator!,
        trade?.trade.inputAmount.denominator!
      ).toFixed(2),
      "WETH for minimum of",
      minAmount,
      "DAI"
    );
    return { minAmount, amountToSwap };
  };

  this.beforeAll("setup tests and deploy contracts", async function () {
    const signers = await hre.ethers.getSigners();
    randomWallet1 = signers[1];
    randomWallet1Address = await randomWallet1.getAddress();
    await deployments.fixture(["test"]);

    DAIContract = await ethers.getContractAt(
      "IERC20",
      DAI_ADDRESS,
      randomWallet1
    );

    const erc20SwapperContract = await deployments.getOrNull(
      erc20SwapperContractName
    );
    Erc20SwapperContractAddress = erc20SwapperContract?.address!;
    Erc20SwapperContract = await ethers.getContractAt(
      erc20SwapperContractName,
      Erc20SwapperContractAddress,
      randomWallet1
    );
  });

  it("should swap ETH to DAI", async function () {
    const { minAmount, amountToSwap } = await prepareTrade();
    const daiBalanceBefore = await DAIContract.balanceOf(randomWallet1Address);
    await Erc20SwapperContract.swapEtherToToken(
      DAI_ADDRESS,
      ethers.parseEther(minAmount) - ethers.parseEther("100"),
      {
        value: amountToSwap,
      }
    );
    const daiBalanceAfter = await DAIContract.balanceOf(randomWallet1Address);
    expect(
      Number(daiBalanceAfter) - Number(daiBalanceBefore)
    ).to.be.greaterThanOrEqual(Number(minAmount));
  });
});
