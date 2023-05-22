//SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "./ConverterCurrency.sol";

/**
 *@title Thid is a contract for croud founding
 *@author edmund
 *@notice this contract
 */

contract FundMe {
    using ConvertCurrency for uint256;
    address payable public immutable i_owner;
    uint256 public constant MIN_USD = 50 * 1e18;
    AggregatorV3Interface agregator;

    enum State {
        Withdrawn,
        Active
    }

    struct FundObj {
        uint256 ammount;
        State state;
    }

    address[] public founders;

    mapping(address => FundObj) foundsByFounder;

    event AccountFunder();
    event FoundsWithdrawn();

    error NotEnoughDonation();
    error NotOwner();
    error WithdrawFailed();

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert NotOwner();
        _;
    }

    /**
     * @dev use testnet address or get an address from local blockchains
     * @param agregatorAddress:this is the address which contains the price from eth to usd
     */
    constructor(address agregatorAddress) {
        i_owner = payable(msg.sender);
        agregator = AggregatorV3Interface(agregatorAddress);
    }

    /**
     * @notice the fund function is public for those who want to fund or donate a minimun usd as eth
     */
    function fund() public payable {
        uint256 foundUSD = msg.value.getConvertionRate(agregator);
        if (foundUSD < MIN_USD) revert NotEnoughDonation();

        if (!founderExists(msg.sender)) founders.push(msg.sender);

        foundsByFounder[msg.sender].ammount += msg.value;
        foundsByFounder[msg.sender].state = State.Active;
    }

    /**
     * @notice this function does not restore the ones that have founded this contract, they are registered forever
     * @dev this function should be only called by the contract's owner
     */
    function withdraw() public onlyOwner {
        uint256 ammount;
        for (
            uint256 founderIdx = 0;
            founderIdx < founders.length;
            founderIdx++
        ) {
            FundObj memory currentFund = foundsByFounder[founders[founderIdx]];
            if (currentFund.state == State.Active)
                ammount += currentFund.ammount;
        }

        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!success) revert WithdrawFailed();

        emit FoundsWithdrawn();
    }

    /**
     * @notice find the founder for the purpuse of adding him again or not into the founders list
     * @param _founder: if the founder exist
     */
    function founderExists(address _founder) internal view returns (bool) {
        bool exists = false;
        for (
            uint256 founderIdx = 0;
            founderIdx < founders.length;
            founderIdx++
        ) {
            if (founders[founderIdx] == _founder) exists = true;
        }
        return exists;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
