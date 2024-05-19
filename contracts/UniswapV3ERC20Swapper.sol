// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/external/IWETH9.sol";

interface ERC20Swapper {
    /// @dev swaps the `msg.value` Ether to at least `minAmount` of tokens in `address`, or reverts
    /// @param token The address of ERC-20 token to swap
    /// @param minAmount The minimum amount of tokens transferred to msg.sender
    function swapEtherToToken(
        address token,
        uint minAmount
    ) external payable returns (uint);
}

contract UniswapV3ERC20Swapper is ERC20Swapper, Ownable {
    uint24 public constant poolFee = 3000;
    address public immutable WETH9;
    ISwapRouter public immutable swapRouter;
    bool public isDisabled;

    constructor(ISwapRouter _swapRouter, address _wethAddress) {
        isDisabled = false;
        swapRouter = _swapRouter;
        WETH9 = _wethAddress;
    }

    function disableSwapper(bool _disable) public onlyOwner {
        if (isDisabled == _disable)
            revert("UniswapV3ERC20Swapper: Disable status already set.");
        isDisabled = _disable;
    }

    function swapEtherToToken(
        address token,
        uint minAmount
    ) public payable override returns (uint amountOut) {
        if (isDisabled)
            revert("UniswapV3ERC20Swapper: Swapper contract is disabled.");

        uint amountToswap = msg.value;

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: WETH9,
                tokenOut: token,
                fee: poolFee,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountToswap,
                amountOutMinimum: minAmount,
                sqrtPriceLimitX96: 0
            });
        // Executes the swap returning the amountIn needed to spend to receive the desired amountOut.
        amountOut = swapRouter.exactInputSingle{value: amountToswap}(params);
    }
}
