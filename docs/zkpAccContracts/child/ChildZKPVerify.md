# ChildZKPVerify









## Methods

### count

```solidity
function count() external view returns (uint256)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

### finishedVerify

```solidity
function finishedVerify(uint256 verificationNum) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| verificationNum | uint256 | undefined |

### initialize

```solidity
function initialize(address rootZKPVerifyContractAddress) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| rootZKPVerifyContractAddress | address | undefined |

### l2StateSender

```solidity
function l2StateSender() external view returns (contract IStateSender)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IStateSender | undefined |

### onStateReceive

```solidity
function onStateReceive(uint256, address sender, bytes data) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |
| sender | address | undefined |
| data | bytes | undefined |

### rootZKPVerifyContract

```solidity
function rootZKPVerifyContract() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### verification

```solidity
function verification(uint256) external view returns (bool)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| _0 | uint256 | undefined |

#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | bool | undefined |

### verify

```solidity
function verify(bool proof) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| proof | bool | undefined |




