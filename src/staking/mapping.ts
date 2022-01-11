import { Deposit, Withdraw } from '../../generated/Staking/Staking'
import { common } from '../common';

export function handleDeposit(event: Deposit): void {
  common.saveTransaction(
    event.transaction.hash,
    event.logIndex,
    'DEPOSIT',
    event.params.tokenAddress,
    event.params.user,
    event.params.amount,
    event.block.timestamp,
    null
  )

  common.incrementTransactionsCount('DEPOSIT')
}

export function handleWithdraw(event: Withdraw): void {
  common.saveTransaction(
    event.transaction.hash,
    event.logIndex,
    'WITHDRAW',
    event.params.tokenAddress,
    event.params.user,
    event.params.amount,
    event.block.timestamp,
    null
  )

  common.incrementTransactionsCount('WITHDRAW')
}
