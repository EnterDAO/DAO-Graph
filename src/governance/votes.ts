import {Governance, Vote, VoteCanceled} from "../../generated/Governance/Governance";
import {Proposal} from "../../generated/schema";
import {BigInt} from "@graphprotocol/graph-ts/index";
import {constants} from "../constants";
import {common} from "../common";

export function handleVote(event: Vote): void {
    let proposal = Proposal.load(event.params.proposalId.toString())
    let govContract = Governance.bind(event.address)
    let proposalData = govContract.proposals(event.params.proposalId)
    let proposalState = constants.PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

    proposal.forVotes = proposalData.value6
    proposal.againstVotes = proposalData.value7
    proposal.state = proposalState as string
    proposal.save()

    // WARMUP --> ACTIVE
    common.saveProposalStateEvent(
        proposal.id,
        proposalState.toString(),
        proposal.createTime.plus(proposal.warmUpDuration).plus(constants.BIGINT_ONE),
        proposal.createTime.plus(proposal.warmUpDuration).plus(proposal.activeDuration),
        ''
    )
}

export function handleVoteCanceled(event: VoteCanceled): void {
    let proposal = Proposal.load(event.params.proposalId.toString())
    let govContract = Governance.bind(event.address)
    let proposalState = constants.PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

    proposal.state = proposalState as string
    proposal.save()

    // ACTIVE --> CANCELED
    common.saveProposalStateEvent(
        proposal.id, proposalState.toString(), event.block.timestamp, BigInt.fromI32(0), event.transaction.hash.toHex()
    )
}


