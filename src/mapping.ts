import { Deposit, Withdraw } from '../generated/Staking/Staking'
import { Transaction, TransactionCount } from '../generated/schema'
import { BigInt } from '@graphprotocol/graph-ts'

export function handleDeposit(event: Deposit): void {
  let txn = new Transaction(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  txn.actionType = "DEPOSIT"
  txn.tokenAddress = event.params.tokenAddress
  txn.userAddress = event.params.user
  txn.amount = event.params.amount
  txn.transactionHash = event.transaction.hash.toHex()
  txn.blockTimestamp = event.block.timestamp
  let allTransactions = TransactionCount.load("all")
  if (allTransactions == null) {
    allTransactions = new TransactionCount("all")
    allTransactions.count = BigInt.fromI32(0)
  }
  allTransactions.count = allTransactions.count.plus(BigInt.fromI32(1))
  let depositTransactions = TransactionCount.load("deposit")
  if (depositTransactions == null) {
    depositTransactions = new TransactionCount("deposit")
    depositTransactions.count = BigInt.fromI32(0)
  }
  depositTransactions.count = depositTransactions.count.plus(BigInt.fromI32(1))

  txn.save()
  allTransactions.save()
  depositTransactions.save()
}

export function handleWithdraw(event: Withdraw): void {
  let txn = new Transaction(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  txn.actionType = "WITHDRAW"
  txn.tokenAddress = event.params.tokenAddress
  txn.userAddress = event.params.user
  txn.amount = event.params.amount
  txn.transactionHash = event.transaction.hash.toHex()
  txn.blockTimestamp = event.block.timestamp

  let allTransactions = TransactionCount.load("all")
  if (allTransactions == null) {
    allTransactions = new TransactionCount("all");
    allTransactions.count = BigInt.fromI32(0)
  }
  allTransactions.count = allTransactions.count.plus(BigInt.fromI32(1))
  let withdrawTransactions = TransactionCount.load("withdraw")
  if (withdrawTransactions == null) {
    withdrawTransactions = new TransactionCount("withdraw");
    withdrawTransactions.count = BigInt.fromI32(0)
  }
  withdrawTransactions.count = withdrawTransactions.count.plus(BigInt.fromI32(1))

  txn.save()
  allTransactions.save()
  withdrawTransactions.save()
}
