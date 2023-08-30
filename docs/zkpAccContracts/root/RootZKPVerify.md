# RootZKPVerify









## Methods

### FinishedVerify

```solidity
function FinishedVerify(bool verification) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| verification | bool | undefined |

### childZKPVerifyContract

```solidity
function childZKPVerifyContract() external view returns (address)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | address | undefined |

### initialize

```solidity
function initialize(address childZKPVerifyContractAddress) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| childZKPVerifyContractAddress | address | undefined |

### onL2StateReceive

```solidity
function onL2StateReceive(uint256 id, address sender, bytes data) external nonpayable
```

Called by exit helper when state is received from L2



#### Parameters

| Name | Type | Description |
|---|---|---|
| id | uint256 | undefined |
| sender | address | Address of the sender on the child chain |
| data | bytes | Data sent by the sender |

### stateSender

```solidity
function stateSender() external view returns (contract IStateSender)
```






#### Returns

| Name | Type | Description |
|---|---|---|
| _0 | contract IStateSender | undefined |

### verify

```solidity
function verify(bool proof) external nonpayable
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| proof | bool | undefined |



## Events

### FinishedVerification

```solidity
event FinishedVerification(bool indexed verification)
```





#### Parameters

| Name | Type | Description |
|---|---|---|
| verification `indexed` | bool | undefined |



