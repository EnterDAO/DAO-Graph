import { BigInt, Bytes } from '@graphprotocol/graph-ts'
import { Staked, Withdrawn } from '../../../generated/LandWorksDecentralandStaking/LandWorksDecentralandStaking'
import { Transaction, TransactionCount } from '../../../generated/schema';
import { common } from '../../common';

export function handleStaked(event: Staked): void {
  common.saveTransaction(
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
  common.saveTransaction(
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
