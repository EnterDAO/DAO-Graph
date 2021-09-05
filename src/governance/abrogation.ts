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
        proposal.id,
        proposalState.toString(),
        event.block.timestamp,
        BigInt.fromI32(0),
        event.transaction.hash.toHex()
    )
}

export function handleAbrogationProposalExecuted(event: AbrogationProposalExecuted): void {
    let proposal = Proposal.load(event.params.proposalId.toString())
    let govContract = Governance.bind(event.address)
    let proposalState = constants.PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

    proposal.state = proposalState as string
    proposal.save()

    /**
     * Add the missing ABROGATED event
     */
    common.saveProposalStateEvent(
        proposal.id,
        constants.PROPOSAL_STATE_ENUM.get(9) as string,
        event.block.timestamp.minus(constants.BIGINT_ONE),
        constants.BIGINT_ZERO,
        ""
    )

    /**
     * Add CANCELED event
     */
    common.saveProposalStateEvent(
        proposal.id,
        proposalState.toString(),
        event.block.timestamp,
        BigInt.fromI32(0),
        event.transaction.hash.toHex()
    )
}

export function handleAbrogationProposalVote(event: AbrogationProposalVote): void {
    common.updateVoterOnVote(event.params.user, event.params.power);
}

export function handleAbrogationProposalVoteCancelled(event: AbrogationProposalVoteCancelled): void {

}
