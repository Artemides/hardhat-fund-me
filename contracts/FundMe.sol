//SPDX-License-Identifier: MIT

pragma solidity 0.8.18;

import "./ConverterCurrency.sol";

contract FundMe {
    using ConvertCurrency for uint256;

    address payable public immutable i_owner;
    uint256 public constant MIN_USD = 50 * 1e18;

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

    constructor() {
        i_owner = payable(msg.sender);
    }

    error NotEnoughDonation();
    error NotOwner();
    error WithdrawFailed();
    event AccountFunder();
    event FoundsWithdrawn();

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert NotOwner();
        _;
    }

    function fund() public payable {
        uint256 foundUSD = msg.value.getConvertionRate();
        if (foundUSD < MIN_USD) revert NotEnoughDonation();

        if (!founderExists(msg.sender)) founders.push(msg.sender);

        foundsByFounder[msg.sender].ammount += msg.value;
        foundsByFounder[msg.sender].state = State.Active;
    }

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
