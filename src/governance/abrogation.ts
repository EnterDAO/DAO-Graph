import {
    AbrogationProposalExecuted,
    AbrogationProposalStarted,
    AbrogationProposalVote, AbrogationProposalVoteCancelled,
    Governance
} from "../../generated/Governance/Governance";
import {Proposal, Vote as VoteCast, AbrogationProposal} from "../../generated/schema";
import {constants} from "../constants";
import {common} from "../common";
import {store} from "@graphprotocol/graph-ts/index";

export function handleAbrogationProposalStarted(event: AbrogationProposalStarted): void {
    let apId = event.params.proposalId;
    let governance = Governance.bind(event.address);
    let apData = governance.abrogationProposals(apId);

    let ap = new AbrogationProposal(apId.toString() + '-AP');
    ap.creator = event.transaction.from;
    ap.createTime = event.block.timestamp.toI32();
    ap.description = apData.value2;
    ap.forVotes = constants.BIGINT_ZERO;
    ap.againstVotes = constants.BIGINT_ZERO;
    ap.save();

    let voter = common.createVoterIfNonExistent(event.transaction.from);
    voter.proposals += 1;
    voter.save();
}

export function handleAbrogationProposalExecuted(event: AbrogationProposalExecuted): void {
    let proposal = Proposal.load(event.params.proposalId.toString())
    let proposalState = constants.PROPOSAL_EVENTS.get(3) as string;
    proposal.state = proposalState;
    proposal.save();

    common.saveProposalEvent(proposal.id, event, proposalState);
}

export function handleAbrogationProposalVote(event: AbrogationProposalVote): void {
    let apId = event.params.proposalId.toString() + '-AP';
    let ap = AbrogationProposal.load(apId);
    let governance = Governance.bind(event.address);
    let apData = governance.abrogationProposals(event.params.proposalId);

    ap.forVotes = apData.value3;
    ap.againstVotes = apData.value4;
    ap.save();

    common.updateVoterOnVote(event.params.user);

    // Once voted, Voter can only change support -> true/false
    let voteId = apId + '-' + event.params.user.toHex();
    let vote = VoteCast.load(voteId)
    if (vote == null) {
        vote = new VoteCast(voteId);
        vote.address = event.params.user;
        vote.voter = event.params.user.toString(); // Map for deriveFrom
        vote.power = event.params.power;
        vote.abrogatedProposal = apId;
        vote.proposal = "";
    }
    vote.blockTimestamp = event.block.timestamp;
    vote.support = event.params.support;
    vote.save();
}

export function handleAbrogationProposalVoteCancelled(event: AbrogationProposalVoteCancelled): void {
    let voteId = event.params.proposalId.toString() + '-AP-' + event.params.user.toHex();
    store.remove('Vote', voteId);
}
