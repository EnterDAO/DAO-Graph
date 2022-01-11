import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Deposit, Withdraw } from '../../generated/Staking/Staking'
import { Transaction, TransactionCount } from '../../generated/schema'
import { common } from '../common';

function saveTransaction(
  txHash: Bytes,
  logIndex: BigInt,
  actionType: string,
  tokenAddress: Bytes,
  userAddress: Bytes,
  amount: BigInt,
  blockTimestamp: BigInt
): void {
  let txn = new Transaction(txHash.toHexString() + '-' + logIndex.toString())
  txn.actionType = actionType
  txn.tokenAddress = tokenAddress
  txn.userAddress = userAddress
  txn.amount = amount
  txn.transactionHash = txHash.toHexString()
  txn.blockTimestamp = blockTimestamp
  txn.save()

  let allTransactions = TransactionCount.load('all')
  if (allTransactions == null) {
    allTransactions = new TransactionCount('all')
    allTransactions.count = BigInt.fromI32(0)
  }
  allTransactions.count = allTransactions.count.plus(BigInt.fromI32(1))
  allTransactions.save()
}

export function handleDeposit(event: Deposit): void {
  saveTransaction(
    event.transaction.hash,
    event.logIndex,
    'DEPOSIT',
    event.params.tokenAddress,
    event.params.user,
    event.params.amount,
    event.block.timestamp
  )

  common.incrementTransactionsCount('DEPOSIT')
}

export function handleWithdraw(event: Withdraw): void {
  saveTransaction(
    event.transaction.hash,
    event.logIndex,
    'WITHDRAW',
    event.params.tokenAddress,
    event.params.user,
    event.params.amount,
    event.block.timestamp
  )

  common.incrementTransactionsCount('WITHDRAW')
}
