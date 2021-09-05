import {
    Governance,
    ProposalCanceled,
    ProposalCreated,
    ProposalExecuted,
    ProposalQueued
} from "../../generated/Governance/Governance";
import {Proposal, ProposalStateEvent} from "../../generated/schema";
import {BigInt, Bytes} from "@graphprotocol/graph-ts/index";
import {constants} from "../constants";
import {common} from "../common";

export function handleProposalCreated(event: ProposalCreated): void {
    let proposal = new Proposal(event.params.proposalId.toString())
    let govContract = Governance.bind(event.address)
    let proposalData = govContract.proposals(event.params.proposalId)
    let proposalParams = govContract.getProposalParameters(event.params.proposalId)
    let proposalActions = govContract.getActions(event.params.proposalId)
    let proposalState = constants.PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

    proposal.proposer = proposalData.value1
    proposal.description = proposalData.value2
    proposal.title = proposalData.value3
    proposal.createTime = proposalData.value4
    proposal.eta = proposalData.value5 // 0
    proposal.forVotes = proposalData.value6 // 0
    proposal.againstVotes = proposalData.value7 // 0
    proposal.blockTimestamp = event.block.timestamp
    proposal.state = proposalState as string

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

    // --> Add CREATED event to State History
    common.saveProposalStateEvent(
        proposal.id,
        "CREATED",
        proposal.createTime,
        constants.BIGINT_ZERO,
        event.transaction.hash.toHex()
    )

    // --> WARMUP state starts immediately. Adding it to State Events
    let warmEndTimestamp = proposal.createTime.plus(proposal.warmUpDuration);
    common.saveProposalStateEvent(
        proposal.id,
        proposalState.toString(),
        proposal.createTime,
        warmEndTimestamp,
        ''
    )

    /**
     * Add `ACTIVE` state to Events history. start=warm's endTimestamp + 1
     * Otherwise we will need to have a constant mapping running every X blocks to
     * update the state of every proposal, thus increasing sync time.
     */
    let activeStartTime = proposal.createTime.plus(proposal.warmUpDuration).plus(constants.BIGINT_ONE);
    let activeEndTime = proposal.createTime.plus(proposal.warmUpDuration).plus(proposalParams.activeDuration);
    common.saveProposalStateEvent(
        proposal.id,
        constants.PROPOSAL_STATE_ENUM.get(1) as string,
        activeStartTime,
        activeEndTime,
        ''
    )

    let voter = common.createVoterIfNonExistent(event.transaction.from)
    voter.proposals = voter.proposals.plus(BigInt.fromI32(1))
    voter.save()
}

export function handleProposalQueued(event: ProposalQueued): void {
    let proposal = Proposal.load(event.params.proposalId.toString())
    let govContract = Governance.bind(event.address)
    let proposalData = govContract.proposals(event.params.proposalId)
    let proposalState = constants.PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

    proposal.eta = event.params.eta
    proposal.state = proposalState as string
    proposal.save()

    /**
     * Add ACCEPTED Event
     * If proposal was queued, it means that it passed its vote
     */
    let activeEvent = ProposalStateEvent.load(proposal.id + "-" + (constants.PROPOSAL_STATE_ENUM.get(1) as string));
    common.saveProposalStateEvent(
        proposal.id,
        constants.PROPOSAL_STATE_ENUM.get(4) as string,
        activeEvent.endTimestamp.plus(constants.BIGINT_ONE),
        constants.BIGINT_ZERO,
        ""
    )

    /**
     * Add the QUEUED Event
     */
    common.saveProposalStateEvent(
        proposal.id,
        proposalState.toString(),
        activeEvent.endTimestamp.plus(constants.BIGINT_ONE), // This is the Timestamp at which the Queued duration begins to be counted
        proposal.eta,
        event.transaction.hash.toHex()
    )
}

export function handleProposalExecuted(event: ProposalExecuted): void {
    let proposal = Proposal.load(event.params.proposalId.toString())
    let govContract = Governance.bind(event.address)
    let proposalState = constants.PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId))

    proposal.state = proposalState as string
    proposal.save()

    /**
     * Add GRACE Event
     * If the proposal was executed, we can safely assume that the GRACE period went by as-well.
     * We must end the GRACE period right before the execution.
     */
    let queueEvent = ProposalStateEvent.load(proposal.id + "-" + (constants.PROPOSAL_STATE_ENUM.get(5) as string));
    common.saveProposalStateEvent(
        proposal.id,
        constants.PROPOSAL_STATE_ENUM.get(6) as string,
        queueEvent.endTimestamp.plus(constants.BIGINT_ONE),
        event.block.timestamp.minus(constants.BIGINT_ONE),
        ""
    )

    /**
     * Add the Executed Event
     */
    common.saveProposalStateEvent(
        proposal.id,
        proposalState.toString(),
        event.block.timestamp,
        BigInt.fromI32(0),
        event.transaction.hash.toHex()
    )
}

export function handleProposalCanceled(event: ProposalCanceled): void {
    let proposal = Proposal.load(event.params.proposalId.toString());
    let govContract = Governance.bind(event.address);
    let proposalState = constants.PROPOSAL_STATE_ENUM.get(govContract.state(event.params.proposalId));

    proposal.state = proposalState as string;
    proposal.save();

    common.saveProposalStateEvent(
        proposal.id,
        proposalState.toString(),
        event.block.timestamp,
        BigInt.fromI32(0),
        event.transaction.hash.toHex()
    );
}