import {Governance, Vote, VoteCanceled} from "../../generated/Governance/Governance";
import {Proposal, Vote as VoteCast } from "../../generated/schema";
import {store} from "@graphprotocol/graph-ts";
import {common} from "../common";

export function handleVote(event: Vote): void {
    let proposal = Proposal.load(event.params.proposalId.toString());
    let govContract = Governance.bind(event.address);
    let proposalData = govContract.proposals(event.params.proposalId);

    proposal.forVotes = proposalData.value6;
    proposal.againstVotes = proposalData.value7;
    proposal.save();

    common.updateVoterOnVote(event.params.user);

    // Once voted, Voter can only change support -> true/false
    let voteId = event.params.proposalId.toString() + '-' + event.params.user.toHex();
    let vote = VoteCast.load(voteId)
    if (vote == null) {
        vote = new VoteCast(voteId);
        vote.address = event.params.user;
        vote.voter = event.params.user.toString(); // Map for deriveFrom
        vote.proposalId = event.params.proposalId;
        vote.proposal = vote.proposalId.toString(); // Map for deriveFrom
        vote.power = event.params.power;
        vote.abrogatedProposal = "";
    }
    vote.blockTimestamp = event.block.timestamp;
    vote.support = event.params.support;
    vote.save();
}

export function handleVoteCanceled(event: VoteCanceled): void {
    let voteId = event.params.proposalId.toString() + '-' + event.params.user.toHex();
    store.remove('Vote', voteId);
}


