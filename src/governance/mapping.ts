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
import { Proposal, ProposalStateHistory } from '../../generated/schema'

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
  proposal.eta = proposalData.value5
  proposal.forVotes = proposalData.value6
  proposal.againstVotes = proposalData.value7
  proposal.blockTimestamp = event.block.timestamp
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

  let proposalStateHistory = new ProposalStateHistory(
    event.params.proposalId.toHex() + '-' + proposalState.toString() + '-' + event.block.number.toString()
  )
  proposalStateHistory.proposal = proposal.id
  proposalStateHistory.name = "WARMUP"
  proposalStateHistory.startTimestamp = proposal.createTime
  proposalStateHistory.endTimestamp = proposal.createTime.plus(proposal.warmUpDuration).plus(proposal.activeDuration)
  proposalStateHistory.txHash = '';
  proposalStateHistory.save();

  let history = proposal.history;
  history.push(proposalStateHistory.id);
  proposal.history = history;
  proposal.save()
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
}

// export function handleVoteCanceled(event: VoteCanceled): void {
//   let proposal = Proposal.load(event.params.proposalId.toString())
//   let govContract = Governance.bind(event.address)  
//   let proposalState = PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

//   proposal.state = proposalState as string
//   proposal.save()
// }

// export function handleProposalQueued(event: ProposalQueued): void {
//   let proposal = Proposal.load(event.params.proposalId.toString())
//   let govContract = Governance.bind(event.address)  
//   let proposalState = PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

//   proposal.state = proposalState as string
//   proposal.save()
// }

// export function handleProposalExecuted(event: ProposalExecuted): void {
//   let proposal = Proposal.load(event.params.proposalId.toString())
//   let govContract = Governance.bind(event.address)  
//   let proposalState = PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

//   proposal.state = proposalState as string
//   proposal.save()
// }

// export function handleProposalCanceled(event: ProposalCanceled): void {
//   let proposal = Proposal.load(event.params.proposalId.toString())
//   let govContract = Governance.bind(event.address)  
//   let proposalState = PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

//   proposal.state = proposalState as string
//   proposal.save()
// }

// export function handleAbrogationProposalStarted(event: AbrogationProposalStarted): void {
//   let proposal = Proposal.load(event.params.proposalId.toString())
//   let govContract = Governance.bind(event.address)  
//   let proposalState = PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

//   proposal.state = proposalState as string
//   proposal.save()
// }

// export function handleAbrogationProposalExecuted(event: AbrogationProposalExecuted): void {}

// export function handleAbrogationProposalVote(event: AbrogationProposalVote): void {}

// export function handleAbrogationProposalVoteCancelled(event: AbrogationProposalVoteCancelled): void {}
