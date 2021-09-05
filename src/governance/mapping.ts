import { BigInt, Bytes, TypedMap } from '@graphprotocol/graph-ts'
import {
  Governance,
  ProposalCreated,
  Vote,
  VoteCanceled,
  ProposalQueued,
  ProposalExecuted,
  ProposalCanceled,
  AbrogationProposalStarted,
  AbrogationProposalExecuted,
  AbrogationProposalVote,
  AbrogationProposalVoteCancelled
} from '../../generated/Governance/Governance'
import { Supernova, Deposit, Withdraw, Lock, Delegate, DelegatedPowerIncreased, DelegatedPowerDecreased } from '../../generated/Supernova/Supernova'
import { Proposal, ProposalStateHistory, Voter } from '../../generated/schema'

let PROPOSAL_STATE_ENUM = new TypedMap<i32, string>()
PROPOSAL_STATE_ENUM.set(0, 'WARMUP')
PROPOSAL_STATE_ENUM.set(1, 'ACTIVE')
PROPOSAL_STATE_ENUM.set(2, 'CANCELED')
PROPOSAL_STATE_ENUM.set(3, 'FAILED')
PROPOSAL_STATE_ENUM.set(4, 'ACCEPTED')
PROPOSAL_STATE_ENUM.set(5, 'QUEUED')
PROPOSAL_STATE_ENUM.set(6, 'GRACE')
PROPOSAL_STATE_ENUM.set(7, 'EXPIRED')
PROPOSAL_STATE_ENUM.set(8, 'EXECUTED')
PROPOSAL_STATE_ENUM.set(9, 'ABROGATED')

function saveProposalStateHistory(
  proposalId: string, proposalState: string, startTimestamp: BigInt, endTimestamp: BigInt, txHash: string
): void {
  let id = proposalId + '-' + proposalState
  let psh = ProposalStateHistory.load(id)
  if (psh == null) psh = new ProposalStateHistory(id)
  psh.proposal = proposalId
  psh.name = proposalState
  psh.startTimestamp = startTimestamp
  psh.endTimestamp = endTimestamp
  psh.txHash = txHash
  psh.save()

  // add to proposal state history array
  let proposal = Proposal.load(proposalId)
  if (proposal == null) return
  let history = proposal.history
  // sanity check for duplicates (updates)
  for (let i = 0; i < history.length; i++) { if (history[i] === psh.id) return }
  history.push(psh.id)
  proposal.history = history
  proposal.save()

  // set endTimestamp of previous proposal state if its unset or greater than current psh startTimestamp
  if (history.length < 2) return
  // can't make assumptions about order of history array
  for (let i = 0; i < history.length; i++) {
    let prevPSH = ProposalStateHistory.load(history[i])
    if (prevPSH == null) continue
    if (prevPSH.id == psh.id) continue
    if (!prevPSH.endTimestamp.equals(BigInt.fromI32(0)) && prevPSH.endTimestamp.lt(startTimestamp)) continue
    prevPSH.endTimestamp = startTimestamp
    prevPSH.save()
  }
}

export function createVoterIfNonExistent(userAddress: Bytes): Voter {
  let voter = Voter.load(userAddress.toHex())
  if (voter == null) {
    voter = new Voter(userAddress.toHex())
    voter.userAddress = userAddress
    voter.tokensStaked = BigInt.fromI32(0)
    voter.lockedUntil = BigInt.fromI32(0)
    voter.delegatedPower = BigInt.fromI32(0)
    voter.votes = BigInt.fromI32(0)
    voter.proposals = BigInt.fromI32(0)
    voter.votingPower = BigInt.fromI32(0)
    voter.hasActiveDelegation = false
    voter.save()
  }
  return voter as Voter
}

export function handleProposalCreated(event: ProposalCreated): void {
  let proposal = new Proposal(event.params.proposalId.toString())
  let govContract = Governance.bind(event.address)  
  let proposalData = govContract.proposals(event.params.proposalId)
  let proposalParams = govContract.getProposalParameters(event.params.proposalId)
  let proposalActions = govContract.getActions(event.params.proposalId)
  let proposalState = PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))
  
  proposal.proposer = proposalData.value1
  proposal.description = proposalData.value2
  proposal.title = proposalData.value3
  proposal.createTime = proposalData.value4
  proposal.eta = proposalData.value5 // 0
  proposal.forVotes = proposalData.value6 // 0
  proposal.againstVotes = proposalData.value7 // 0
  proposal.blockTimestamp = event.block.timestamp // ?
  proposal.state = proposalState as string
  proposal.history = []
  // proposal params
  proposal.warmUpDuration = proposalParams.warmUpDuration
  proposal.activeDuration = proposalParams.activeDuration
  proposal.queueDuration = proposalParams.queueDuration
  proposal.gracePeriodDuration = proposalParams.gracePeriodDuration
  proposal.acceptanceThreshold = proposalParams.acceptanceThreshold
  proposal.minQuorum = proposalParams.minQuorum
  // proposal action
  proposal.targets = proposalActions.value0 as Array<Bytes>
  proposal.values = proposalActions.value1
  proposal.signatures = proposalActions.value2
  proposal.calldatas = proposalActions.value3
  proposal.save()

  // --> WARMUP
  saveProposalStateHistory(
    proposal.id,
    proposalState.toString(),
    proposal.createTime,
    proposal.createTime.plus(proposal.warmUpDuration),
    ''
  )

  let voter = createVoterIfNonExistent(event.transaction.from)
  voter.proposals = voter.proposals.plus(BigInt.fromI32(1))
  voter.save()
}

export function handleVote(event: Vote): void {
  let proposal = Proposal.load(event.params.proposalId.toString())
  let govContract = Governance.bind(event.address)
  let proposalData = govContract.proposals(event.params.proposalId)
  let proposalState = PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

  proposal.forVotes = proposalData.value6
  proposal.againstVotes = proposalData.value7
  proposal.state = proposalState as string
  proposal.save()

  // WARMUP --> ACTIVE
  saveProposalStateHistory(
    proposal.id,
    proposalState.toString(),
    proposal.createTime.plus(proposal.warmUpDuration),
    proposal.createTime.plus(proposal.warmUpDuration).plus(proposal.activeDuration),
    ''
  )

  let voter = createVoterIfNonExistent(event.params.user)
  voter.votes = voter.votes.plus(BigInt.fromI32(1))
  voter.votingPower = event.params.power
  voter.save()
}

export function handleVoteCanceled(event: VoteCanceled): void {
  let proposal = Proposal.load(event.params.proposalId.toString())
  let govContract = Governance.bind(event.address)  
  let proposalState = PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

  proposal.state = proposalState as string
  proposal.save()

  // ACTIVE --> CANCELED
  saveProposalStateHistory(
    proposal.id, proposalState.toString(), event.block.timestamp, BigInt.fromI32(0), event.transaction.hash.toHex()
  )
}

export function handleProposalQueued(event: ProposalQueued): void {
  let proposal = Proposal.load(event.params.proposalId.toString())
  let govContract = Governance.bind(event.address)
  let proposalData = govContract.proposals(event.params.proposalId)
  let proposalState = PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

  proposal.eta = proposalData.value5
  proposal.state = proposalState as string
  proposal.save()

  // ACTIVE --> QUEUED
  saveProposalStateHistory(
    proposal.id, proposalState.toString(), event.block.timestamp, proposal.eta, event.transaction.hash.toHex()
  )
}

export function handleProposalExecuted(event: ProposalExecuted): void {
  let proposal = Proposal.load(event.params.proposalId.toString())
  let govContract = Governance.bind(event.address)  
  let proposalState = PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

  proposal.state = proposalState as string
  proposal.save()

  // QUEUED --> EXECUTED
  saveProposalStateHistory(
    proposal.id, proposalState.toString(), event.block.timestamp, BigInt.fromI32(0), event.transaction.hash.toHex()
  )
}

export function handleProposalCanceled(event: ProposalCanceled): void {
  let proposal = Proposal.load(event.params.proposalId.toString())
  let govContract = Governance.bind(event.address)  
  let proposalState = PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

  proposal.state = proposalState as string
  proposal.save()

  // QUEUED --> CANCELED
  saveProposalStateHistory(
    proposal.id, proposalState.toString(), event.block.timestamp, BigInt.fromI32(0), event.transaction.hash.toHex()
  )
}

export function handleAbrogationProposalStarted(event: AbrogationProposalStarted): void {
  let proposal = Proposal.load(event.params.proposalId.toString())
  let govContract = Governance.bind(event.address)  
  let proposalState = PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

  proposal.state = proposalState as string
  proposal.save()

  // QUEUED --> ABROGATED
  saveProposalStateHistory(
    proposal.id, proposalState.toString(), event.block.timestamp, BigInt.fromI32(0), event.transaction.hash.toHex()
  )
}

export function handleAbrogationProposalExecuted(event: AbrogationProposalExecuted): void {
  let proposal = Proposal.load(event.params.proposalId.toString())
  let govContract = Governance.bind(event.address)  
  let proposalState = PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

  proposal.state = proposalState as string
  proposal.save()

  // ABROGATED --> CANCELED
  saveProposalStateHistory(
    proposal.id, proposalState.toString(), event.block.timestamp, BigInt.fromI32(0), event.transaction.hash.toHex()
  )
}

export function handleAbrogationProposalVote(event: AbrogationProposalVote): void {
  let voter = createVoterIfNonExistent(event.params.user)
  voter.votes = voter.votes.plus(BigInt.fromI32(1))
  voter.votingPower = event.params.power
  voter.save()
}

export function handleAbrogationProposalVoteCancelled(event: AbrogationProposalVoteCancelled): void {}

export function handleDeposit(event: Deposit): void {
  let supernovaContract = Supernova.bind(event.address)
  let voter = createVoterIfNonExistent(event.params.user)
  voter.tokensStaked = supernovaContract.balanceOf(event.params.user)
  voter.save()
}

export function handleWithdraw(event: Withdraw): void {
  let supernovaContract = Supernova.bind(event.address)
  let voter = createVoterIfNonExistent(event.params.user)
  voter.tokensStaked = supernovaContract.balanceOf(event.params.user)
  voter.save()
}

export function handleLock(event: Lock): void {
  let supernovaContract = Supernova.bind(event.address)
  let voter = createVoterIfNonExistent(event.params.user)
  voter.lockedUntil = supernovaContract.userLockedUntil(event.params.user)
  voter.save()
}

export function handleDelegate(event: Delegate): void {
  let supernovaContract = Supernova.bind(event.address)
  let voter = createVoterIfNonExistent(event.params.from)
  voter.hasActiveDelegation = !(supernovaContract.userDelegatedTo(event.params.from)
    .equals(Bytes.fromHexString('0x0000000000000000000000000000000000000000')))
  // for sanity, covered by following two handler as well
  voter.delegatedPower = supernovaContract.delegatedPower(event.params.to)
  voter.save()
}

export function handleDelegatedPowerIncreased(event: DelegatedPowerIncreased): void {
  let supernovaContract = Supernova.bind(event.address)
  let voter = createVoterIfNonExistent(event.params.from)
  voter.delegatedPower = supernovaContract.delegatedPower(event.params.to)
  voter.save()
}

export function handleDelegatedPowerDecreased(event: DelegatedPowerDecreased): void {
  let supernovaContract = Supernova.bind(event.address)
  let voter = createVoterIfNonExistent(event.params.from)
  voter.delegatedPower = supernovaContract.delegatedPower(event.params.to)
  voter.save()
}
