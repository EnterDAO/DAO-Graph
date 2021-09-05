import {
    AbrogationProposalExecuted,
    AbrogationProposalStarted,
    AbrogationProposalVote, AbrogationProposalVoteCancelled,
    Governance
} from "../../generated/Governance/Governance";
import {Proposal} from "../../generated/schema";
import {BigInt} from "@graphprotocol/graph-ts/index";
import {constants} from "../constants";
import {common} from "../common";

export function handleAbrogationProposalStarted(event: AbrogationProposalStarted): void {
    let proposal = Proposal.load(event.params.proposalId.toString())
    let govContract = Governance.bind(event.address)
    let proposalState = constants.PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

    proposal.state = proposalState as string
    proposal.save()

    // QUEUED --> ABROGATED
    common.saveProposalStateEvent(
        proposal.id, proposalState.toString(), event.block.timestamp, BigInt.fromI32(0), event.transaction.hash.toHex()
    )
}

export function handleAbrogationProposalExecuted(event: AbrogationProposalExecuted): void {
    let proposal = Proposal.load(event.params.proposalId.toString())
    let govContract = Governance.bind(event.address)
    let proposalState = constants.PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

    proposal.state = proposalState as string
    proposal.save()

    // ABROGATED --> CANCELED
    common.saveProposalStateEvent(
        proposal.id, proposalState.toString(), event.block.timestamp, BigInt.fromI32(0), event.transaction.hash.toHex()
    )
}

export function handleAbrogationProposalVote(event: AbrogationProposalVote): void {
    // TODO
    let voter = common.createVoterIfNonExistent(event.params.user)
    voter.votes = voter.votes.plus(BigInt.fromI32(1))
    voter.votingPower = event.params.power
    voter.save()
}

export function handleAbrogationProposalVoteCancelled(event: AbrogationProposalVoteCancelled): void {

}
