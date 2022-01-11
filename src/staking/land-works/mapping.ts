import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Staked, Withdrawn } from '../../../generated/LandWorksDecentralandStaking/LandWorksDecentralandStaking'
import { Transaction, TransactionCount } from '../../../generated/schema';
import { common } from '../../common';

function saveTransaction(
  txHash: Bytes,
  logIndex: BigInt,
  actionType: string,
  tokenAddress: Bytes,
  userAddress: Bytes,
  amount: BigInt,
  blockTimestamp: BigInt,
  tokenIds: BigInt[],
): void {
  let txn = new Transaction(txHash.toHexString() + '-' + logIndex.toString())
  txn.actionType = actionType
  txn.tokenAddress = tokenAddress
  txn.userAddress = userAddress
  txn.amount = amount
  txn.transactionHash = txHash.toHexString()
  txn.blockTimestamp = blockTimestamp
  txn.tokenIds = tokenIds
  txn.save()

  let allTransactions = TransactionCount.load('all')
  if (allTransactions == null) {
    allTransactions = new TransactionCount('all')
    allTransactions.count = BigInt.fromI32(0)
  }
  allTransactions.count = allTransactions.count.plus(BigInt.fromI32(1))
  allTransactions.save()
}

export function handleStaked(event: Staked): void {
  saveTransaction(
    event.transaction.hash,
    event.logIndex,
    'DEPOSIT',
    event.address, // Тhe address of the Staking Contract -> has to be mapped to LandWorks contract
    event.params.user,
    event.params.amount, // The ENTR amount based on tokenIds
    event.block.timestamp,
    event.params.tokenIds, // The staked tokenIds
  )

  common.incrementTransactionsCount('DEPOSIT')
}

export function handleWithdrawn(event: Withdrawn): void {
  saveTransaction(
    event.transaction.hash,
    event.logIndex,
    'WITHDRAW',
    event.address, // Тhe address of the Staking Contract -> has to be mapped to LandWorks contract
    event.params.user,
    event.params.amount,  // The ENTR amount based on tokenIds
    event.block.timestamp,
    event.params.tokenIds, // The staked tokenIds
  )

  common.incrementTransactionsCount('WITHDRAW')
}
