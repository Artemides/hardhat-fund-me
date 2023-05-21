//SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library ConvertCurrency {
    function getCurrentPriceUSD(
        AggregatorV3Interface agregator
    ) internal view returns (uint256) {
        // AggregatorV3Interface agregator = AggregatorV3Interface(
        //     0x694AA1769357215DE4FAC081bf1f309aDC325306
        // );

        (, int256 price, , , ) = agregator.latestRoundData();

        return uint256(price * 1e10);
    }

    function getConvertionRate(
        uint256 ethAmmount,
        AggregatorV3Interface agregator
    ) internal view returns (uint256) {
        uint256 ethPrice = getCurrentPriceUSD(agregator);
        uint256 convertionRate = (ethAmmount * ethPrice) / 1e18;
        return convertionRate;
    }
}
