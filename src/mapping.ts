import { Deposit, Withdraw } from '../generated/Staking/Staking'
import { Transaction } from '../generated/schema'

export function handleDeposit(event: Deposit): void {
  let txn = new Transaction(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  txn.type = "Deposit"
  txn.farmingContract = event.params.tokenAddress
  txn.user = event.params.user
  txn.amount = event.params.amount
  txn.txHash = event.transaction.hash.toHex()

  txn.save()
}

export function handleWithdraw(event: Withdraw): void {
  let txn = new Transaction(event.transaction.hash.toHex() + "-" + event.logIndex.toString())
  txn.type = "Withdraw"
  txn.farmingContract = event.params.tokenAddress
  txn.user = event.params.user
  txn.amount = event.params.amount
  txn.txHash = event.transaction.hash.toHex()

  txn.save()
}
