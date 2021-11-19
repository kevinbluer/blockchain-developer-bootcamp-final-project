// SPDX-License-Identifier: MIT
pragma solidity >= 0.8.0 < 0.9.0;

///@title Receiver.sol
///@notice Keeps track of the current safes created
///@author Rodrigo Herrera Itie
contract Receiver {
    // The first address is the EOA (owner or owners of the safes).
    // The array of addresses is the total safes created by the EOA.
    mapping(address => address[]) public tracking;

    function updateTracking(address _owner, address _newSafe) external {
        tracking[_owner].push(_newSafe);
    }

    function returnTracking(address _owner) 
            external 
            view returns (address[] memory)
    {
        return tracking[_owner];
    }
}



