import { Staked, Withdrawn } from '../../../generated/LandWorksDecentralandStaking/LandWorksDecentralandStaking'
import { common } from '../../common';
import { constants } from '../../constants';
import { ERC721StakedToken, TransactionCount } from '../../../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts/index';
import { Address, Bytes } from '@graphprotocol/graph-ts';

export function handleStaked(event: Staked): void {
  common.saveTransaction(
    event.transaction.hash,
    event.logIndex,
    'DEPOSIT',
    event.address, // Тhe address of the Staking Contract -> has to be mapped to LandWorks contract
    event.params.user,
    constants.BIGINT_ZERO,
    event.block.timestamp,
    event.params.tokenIds, // The staked tokenIds
  )

  event.params.tokenIds.forEach((tokenId, index) => {
    let stakedToken = createStakedTokenIfNotExistent(tokenId, event.address)
    stakedToken.owner = event.params.user
    stakedToken.save()
  })

  common.incrementTransactionsCount('DEPOSIT')
}

export function handleWithdrawn(event: Withdrawn): void {
  common.saveTransaction(
    event.transaction.hash,
    event.logIndex,
    'WITHDRAW',
    event.address, // Тhe address of the Staking Contract -> has to be mapped to LandWorks contract
    event.params.user,
    constants.BIGINT_ZERO,
    event.block.timestamp,
    event.params.tokenIds, // The staked tokenIds
  )

  event.params.tokenIds.forEach((tokenId, index) => {
    let stakedToken = createStakedTokenIfNotExistent(tokenId, event.address)
    stakedToken.owner = constants.ZERO_ADDRESS as Bytes
    stakedToken.save()
  })

  common.incrementTransactionsCount('WITHDRAW')
}

function createStakedTokenIfNotExistent(tokenId: BigInt, address: Address): ERC721StakedToken {
  let id = tokenId.toString() + '-' + address.toHexString()
  let stakedToken = ERC721StakedToken.load(id)
  if (stakedToken == null) {
    stakedToken = new ERC721StakedToken(id)
    stakedToken.tokenId = tokenId
    stakedToken.contract = address
    stakedToken.save()
  }

  return stakedToken as ERC721StakedToken
}
