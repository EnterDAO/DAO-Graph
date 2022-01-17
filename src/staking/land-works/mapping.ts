import {
  LandWorksDecentralandStaking,
  Staked,
  Withdrawn
} from '../../../generated/LandWorksDecentralandStaking/LandWorksDecentralandStaking';
import { common } from '../../common';
import { constants } from '../../constants';
import { ERC721StakedToken } from '../../../generated/schema';
import { BigInt, log } from '@graphprotocol/graph-ts/index';
import { Address, Bytes, store } from '@graphprotocol/graph-ts';

export function handleStaked(event: Staked): void {
  let landworksContract = getLandWorksContract(event.address);

  common.saveTransaction(
    event.transaction.hash,
    event.logIndex,
    'DEPOSIT',
    landworksContract,
    event.params.user,
    constants.BIGINT_ZERO,
    event.block.timestamp,
    event.params.tokenIds // The staked tokenIds
  );
  common.incrementTransactionsCount('DEPOSIT');

  let tokenIds: Array<BigInt> = event.params.tokenIds;
  for (let i = 0; i < tokenIds.length; i++) {
    let token: BigInt = tokenIds[i];

    let id = token.toString() + '-' + event.address.toHexString();
    let stakedToken = ERC721StakedToken.load(id);

    if (stakedToken == null) {
      stakedToken = new ERC721StakedToken(id);
      stakedToken.tokenId = token;
      stakedToken.contract = landworksContract;
      stakedToken.owner = event.params.user;
      stakedToken.save();
    }
  }
}

export function handleWithdrawn(event: Withdrawn): void {
  let landworksContract = getLandWorksContract(event.address);

  common.saveTransaction(
    event.transaction.hash,
    event.logIndex,
    'WITHDRAW',
    landworksContract,
    event.params.user,
    constants.BIGINT_ZERO,
    event.block.timestamp,
    event.params.tokenIds // The staked tokenIds
  );
  common.incrementTransactionsCount('WITHDRAW');

  let tokenIds: Array<BigInt> = event.params.tokenIds;
  for (let i = 0; i < tokenIds.length; i++) {
    let token: BigInt = tokenIds[i];

    let id = token.toString() + '-' + event.address.toHexString();
    store.remove('ERC721StakedToken', id);
  }
}

function getLandWorksContract(stakingAddress: Address): Address {
  let landworksContract = LandWorksDecentralandStaking.bind(stakingAddress);
  return landworksContract.stakingToken();
}
