import {Governance, Vote, VoteCanceled} from "../../generated/Governance/Governance";
import {Proposal, Vote as VoteCast } from "../../generated/schema";
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

    common.updateVoterOnVote(event.params.user, event.params.power);

    let voteId = event.params.proposalId.toString() + '-' + event.params.user.toHex();
    let vote = VoteCast.load(voteId)
    if (vote == null) {
        vote = new VoteCast(voteId);
    }
    vote.address = event.params.user;
    vote.voter = event.params.user.toString(); // Map for deriveFrom
    vote.proposalId = event.params.proposalId;
    vote.proposal = vote.proposalId.toString(); // Map for deriveFrom
    vote.blockTimestamp = event.block.timestamp;
    vote.power = event.params.power;
    vote.support = event.params.support;
    vote.save();
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


