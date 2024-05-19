import "@typechain/hardhat";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-verify";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";

require("dotenv").config();

type GasReportConfig = {
  token: string;
  gasPriceApi: string;
};

const gasReportConfigs: Record<string, GasReportConfig> = {
  Mainnet: {
    token: "ETH",
    gasPriceApi:
      "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
  },
};

const etherscanConfig = {
  mainnet: {
    apiUrl: "https://api.etherscan.io/",
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
  sepolia: {
    apiUrl: "https://api-sepolia.etherscan.io/api",
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
};

const config = {
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.7.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 20,
      },
    },
  },
  contractSizer: {
    alphaSort: true,
    runOnCompile: true,
  },
  namedAccounts: {
    owner: { default: 0 },
    sender1: { default: 1 },
    sender2: { default: 2 },
  },
  gasReporter: {
    enabled: true,
    coinmarketcap: process.env.COINMARKETCAP_API || "",
    // Uncomment below for outputting the gas report to a file
    // outputFile: "gas-report.txt",
    // noColors: true,
    token: gasReportConfigs[process.env.GAS_REPORT_NETWORK || "Mainnet"].token,
    gasPriceApi:
      gasReportConfigs[process.env.GAS_REPORT_NETWORK || "Mainnet"].gasPriceApi,
  },
  typechain: {
    outDir: "dist/types",
    target: "ethers-v6",
  },
  networks: {
    hardhat: {
      chainId: 1337,
      mining: {
        auto: true,
      },
      gas: 20000000,
      blockGasLimit: 20000000,
      gasPrice: "auto",
      gasMultiplier: 2,
      hardfork: "muirGlacier",
      throwOnCallFailures: true,
      throwOnTransactionFailures: true,
      accounts: {
        mnemonic:
          process.env.DEPLOYER_MNEMONIC ||
          "test test test test test test test test test test test junk",
        count: 10,
        accountsBalance: "1000000000000000000000",
      },
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: {
        mnemonic:
          process.env.DEPLOYER_MNEMONIC ||
          "test test test test test test test test test test test test ",
      },
    },
  },
  etherscan: {
    apiKey: {
      sepolia: etherscanConfig.sepolia.apiKey,
    },
  },
};

export default config;
