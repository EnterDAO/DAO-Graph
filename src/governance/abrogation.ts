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
    let proposalState = constants.PROPOSAL_EVENTS.get(govContract.state(event.params.proposalId))

    proposal.state = proposalState as string
    proposal.save()
}

export function handleAbrogationProposalExecuted(event: AbrogationProposalExecuted): void {
    let proposal = Proposal.load(event.params.proposalId.toString())
    let proposalState = constants.PROPOSAL_EVENTS.get(3) as string;
    proposal.state = proposalState;
    proposal.save();

    common.saveProposalEvent(proposal.id, event, proposalState);
}

export function handleAbrogationProposalVote(event: AbrogationProposalVote): void {
    common.updateVoterOnVote(event.params.user, event.params.power);
}

export function handleAbrogationProposalVoteCancelled(event: AbrogationProposalVoteCancelled): void { }
