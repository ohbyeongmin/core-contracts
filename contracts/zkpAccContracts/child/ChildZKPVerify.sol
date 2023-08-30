// SPDX-License-Idenrifier: MIT

pragma solidity 0.8.19;

import "../../interfaces/child/IStateReceiver.sol";
import "../../interfaces/IStateSender.sol";

contract ChildZKPVerify is IStateReceiver {
    IStateSender public l2StateSender;
    address public rootZKPVerifyContract;
    mapping(uint256 => bool) public verification;
    uint256 public count;

    constructor(address l2StateSenderAddress) {
        l2StateSender = IStateSender(l2StateSenderAddress);
    }

    function initialize(address rootZKPVerifyContractAddress) public {
        rootZKPVerifyContract = rootZKPVerifyContractAddress;
    }

    function onStateReceive(uint256 /* id */, address sender, bytes calldata data) external {
        bool proof = abi.decode(data, (bool));
        verify(proof);
    }

    function verify(bool proof) public {
        verification[count] = !proof;
        finishedVerify(count);
        count++;
    }

    function finishedVerify(uint256 verificationNum) public {
        l2StateSender.syncState(rootZKPVerifyContract, abi.encode(verification[verificationNum]));
    }
}
