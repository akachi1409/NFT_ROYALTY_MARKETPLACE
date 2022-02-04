// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

/**
 * @title Sample Royalties splitter contract
 * @dev Allow to specify different rightsholder and split royalties equally
        between them.
 */
contract RoyaltiesPayment is Ownable {
    // A list all those entitled to royalties payment
    address[] public payees;

    //Total amount
    uint256 public totalAmount;

    // A record of total withdrawal amounts per payee address
    mapping(address => uint256) public balances;

    event Log(address addressOfbalaces, uint256 percentage);

    constructor() {
        // balances[0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266] = 20;
        // balances[0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db] = 40;
        // balances[0x617F2E2fD72FD9D5503197092aC168c91465E7f2] = 40;
        // payees.push(0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266);
        // payees.push(0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db);
        // payees.push(0x617F2E2fD72FD9D5503197092aC168c91465E7f2);
    }

    function logForBalances() public {
        for (uint256 i = 0; i < payees.length; ++i) {
            address payee = payees[i];
            uint256 percentage = balances[payee];
            emit Log(payee, percentage);
        }
    }

    /// @notice Split every received payment equally between the payees
    receive() external payable {
        totalAmount += msg.value;
    }

    /// @notice Whether an adress is in our list of payees or not
    /// @param user - the address to verify
    /// @return true if the user is a payee, false otherwise
    function _isPayee(address user) internal returns (bool) {
        return balances[user] > 0;
    }

    /// @notice Clear all balances by paying out all payees their share
    function _payAll() internal {
        if (totalAmount > 0) {
            uint256 all = 0;
            for (uint256 i = 0; i < payees.length; i++) {
                address payee = payees[i];
                uint256 percentage = balances[payee];
                all = all + percentage;
            }
            if (all == 100) {
                for (uint256 i = 0; i < payees.length; i++) {
                    address payee = payees[i];
                    uint256 percentage = balances[payee];
                    payee.call{value: (totalAmount / 100) * percentage}("");
                }
                totalAmount = 0;
            }
        }
    }

    function getTotalPercent() public view onlyOwner returns (uint256) {
        uint256 all = 0;
        for (uint256 i = 0; i < payees.length; i++) {
            address payee = payees[i];
            uint256 percentage = balances[payee];
            all = all + percentage;
        }
        return all;
    }

    function deleteTable() public onlyOwner {
        delete payees;
    }

    /// @notice Pay all users their current balances
    function payAll() external onlyOwner {
        _payAll();
    }

    function setRoyaltyTable(address rightholder, uint256 perc)
        public
        onlyOwner
    {
        payees.push(rightholder);
        balances[rightholder] = perc;
    }

    modifier isPayee(address user) {
        require(_isPayee(user), "Not payee");
        _;
    }
}
