# ERC-20 swapping contract

A simple Solidity contract for exchanging Ether to an arbitrary ERC-20 using Uniswap V3 DEX smart contracts.

Below is the ERC20Swapper interface.

   ```solidity
   interface ERC20Swapper {
       /// @dev swaps the `msg.value` Ether to at least `minAmount` of tokens in `address`, or reverts
       /// @param token The address of ERC-20 token to swap
       /// @param minAmount The minimum amount of tokens transferred to msg.sender
       /// @return The actual amount of transferred tokens
       function swapEtherToToken(address token, uint minAmount) public payable returns (uint);
   }
   ```

The contract is deployed on Sepolia Testnet on `0x59b61751F6bE24192ab604e69f91F03A5E52219d`.

## Various Considerations
The exchange rate calculation happens off-chain and by using the `@uniswap/smart-order-router` package which calculates the minimum input amount for a specific route (in this example ETH->DAI). The `minAmount` is passed on the contract and that is the minimum amount the user wants to receive. Based on that off-chain calculation, the amount of ETH to be sent on the smart contract is defined. 

The smart contract itself is not upgradeable in order to avoid potential issues when upgrading the logic of the smart contract. However, it does have an owner which can enable/disable the execution of the swap to happen on the smart contract. This mechanism is implemented as a safeguard mechanism in cases that there is a critical vulnerability on the underlying DEX protocol.

The contract can be used by both EOAs and other smart contacts.
For testing the smart contract, a local mainnet fork was created in order to allow us to test using existing liquidity pools and pairs, without needing to deploy the whole Uniswap V3 protocol, create pairs and provide liquidity for our testing.

### Performance
The gas report can be found [here](./gas-report.txt). It is auto-generated using the `hardhat-gas-reporter` plugin. It retrieves the gas price of the defined network (`GAS_REPORT_NETWORK`) specified in `.env`. It supports Ethereum `Mainnet`, but more networks can be added, see [here](https://www.npmjs.com/package/hardhat-gas-reporter#token-and-gaspriceapi-options-example) for more info.

In summary the deployment of the `UniswapV3ERC20Swapper` costs `522,439`  which is 4.44 euro amd the `swapEtherToToken()` costs `120743` which is 1.03 euro.

## Development 

1. Install required packages 
```sh
pnpm install 
```

2. To compile the contract
```sh
pnpm build
```

3. To test the contract we are running a local fork of the Ethereum mainnet to make it easier for testing existing liquidity pools and pairs.

```sh
## In one terminal run 
npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/<ALCHEMY_API_KEY>

## In anoother terminal run
pnpm test
```

4. To deploy the contract:
```sh
pnpm run deploy <NETWORK_NAME>
## Example
pnpm run deploy sepolia
## OR you can also
pnpm run deploy:sepolia
```
The above will also try to verify the contract on block explorer as well.
To manually run the verification part, you need to:
```sh
pnpm run verify <NETWORK_NAME>
## Example
pnpm run verify sepolia
## OR you can also
pnpm run verify:sepolia
```
> `yarn` package manager can be used as well for the above commands

## :warning: Disclaimer :warning:
This repository is not under active development and it was developed for fun. The smart contracts are not audited, therefore not production ready. :warning: Use at your own risk!