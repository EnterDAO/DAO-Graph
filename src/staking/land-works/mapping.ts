import { Staked, Withdrawn } from '../../../generated/LandWorksDecentralandStaking/LandWorksDecentralandStaking';
import { common } from '../../common';
import { constants } from '../../constants';
import { ERC721StakedToken } from '../../../generated/schema';
import { BigInt } from '@graphprotocol/graph-ts/index';
import { Address, Bytes, store } from '@graphprotocol/graph-ts';

export function handleStaked(event: Staked): void {
  common.saveTransaction(
    event.transaction.hash,
    event.logIndex,
    'DEPOSIT',
    event.address, // Тhe address of the Staking Contract -> has to be mapped to LandWorks contract
    event.params.user,
    constants.BIGINT_ZERO,
    event.block.timestamp,
    event.params.tokenIds // The staked tokenIds
  );

  event.params.tokenIds.forEach((tokenId, index) => {
    createStakedTokenIfNotExistent(tokenId, event.address, event.params.user);
  });

  common.incrementTransactionsCount('DEPOSIT');
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
    event.params.tokenIds // The staked tokenIds
  );

  event.params.tokenIds.forEach((tokenId, index) => {
    let id = tokenId.toString() + '-' + event.address.toHexString();
    store.remove('ERC721StakedToken', id);
  });

  common.incrementTransactionsCount('WITHDRAW');
}

function createStakedTokenIfNotExistent(tokenId: BigInt, address: Address, owner: Bytes): void {
  let id = tokenId.toString() + '-' + address.toHexString();
  let stakedToken = ERC721StakedToken.load(id);
  if (stakedToken == null) {
    stakedToken = new ERC721StakedToken(id);
    stakedToken.tokenId = tokenId;
    stakedToken.contract = address;
    stakedToken.owner = owner;
    stakedToken.save();
  }
}
