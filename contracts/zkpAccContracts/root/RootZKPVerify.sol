// SPDX-License-Identifier: MIT

pragma solidity 0.8.19;

import "../../interfaces/IStateSender.sol";
import "../../interfaces/root/IL2StateReceiver.sol";

contract RootZKPVerify is IL2StateReceiver {
    IStateSender public stateSender;
    address public childZKPVerifyContract;

    event FinishedVerification(bool indexed verification);

    constructor(address stateSenderAddress) {
        stateSender = IStateSender(stateSenderAddress);
    }

    function initialize(address childZKPVerifyContractAddress) public {
        childZKPVerifyContract = childZKPVerifyContractAddress;
    }

    function verify(bool proof) public {
        stateSender.syncState(childZKPVerifyContract, abi.encode(proof));
    }

    function FinishedVerify(bool verification) public {
        emit FinishedVerification(verification);
    }

    function onL2StateReceive(uint256 id, address sender, bytes calldata data) external {
        bool verification = abi.decode(data, (bool));
        FinishedVerify(verification);
    }
}
