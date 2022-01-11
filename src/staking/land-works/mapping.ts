import { Staked, Withdrawn } from '../../../generated/LandWorksDecentralandStaking/LandWorksDecentralandStaking'
import { common } from '../../common';
import { constants } from '../../constants';
import BIGINT_ZERO = constants.BIGINT_ZERO;

export function handleStaked(event: Staked): void {
  common.saveTransaction(
    event.transaction.hash,
    event.logIndex,
    'DEPOSIT',
    event.address, // Тhe address of the Staking Contract -> has to be mapped to LandWorks contract
    event.params.user,
    BIGINT_ZERO,
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
    BIGINT_ZERO,
    event.block.timestamp,
    event.params.tokenIds, // The staked tokenIds
  )

  common.incrementTransactionsCount('WITHDRAW')
}
