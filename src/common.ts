import {BigInt} from "@graphprotocol/graph-ts/index";
import {Overview, ProposalStateEvent, Voter} from "../generated/schema";
import {Address, Bytes} from "@graphprotocol/graph-ts";
import {constants} from "./constants";

export namespace common {

    export function saveProposalStateEvent(
        proposalId: string,
        proposalState: string,
        startTimestamp: BigInt,
        endTimestamp: BigInt,
        txHash: string
    ): void {
        let id = proposalId + '-' + proposalState
        let psh = ProposalStateEvent.load(id)
        if (psh == null) psh = new ProposalStateEvent(id)
        psh.proposal = proposalId
        psh.name = proposalState
        psh.startTimestamp = startTimestamp
        psh.endTimestamp = endTimestamp
        psh.txHash = txHash
        psh.save()
    }

    export function createVoterIfNonExistent(userAddress: Bytes): Voter {
        let voter = Voter.load(userAddress.toHex())
        if (voter == null) {
            voter = new Voter(userAddress.toHex())
            voter.tokensStaked = constants.BIGINT_ZERO;
            voter.lockedUntil = constants.BIGINT_ZERO;
            voter.delegatedPower = constants.BIGINT_ZERO;
            voter.votes = constants.BIGINT_ZERO;
            voter.proposals = constants.BIGINT_ZERO;
            voter.votingPower = constants.BIGINT_ZERO;
            voter.hasActiveDelegation = false
            voter.save()
        }
        return voter as Voter
    }

    export function getOverview(): Overview {
        let overview = Overview.load("OVERVIEW");
        if (overview == null) {
            overview = new Overview("OVERVIEW");
            overview.avgLockTimeSeconds = constants.BIGINT_ZERO;
            // overview.holders = 0;
            overview.totalDelegatedPower = constants.BIGINT_ZERO;
            overview.totalVEntr = constants.BIGINT_ZERO;
            overview.voters = 0
            overview.kernelUsers = 0;
            // overview.holdersStakingExcluded = 0;
            overview._sumLockTime = constants.BIGINT_ZERO;
            overview._numberOfLocks = constants.BIGINT_ZERO;
            overview.save();
        }
        return overview as Overview;
    }

    export function incrementVoterCount(): void {
        let overview = getOverview();
        overview.voters += 1;
        overview.save();
    }

    export function updateVoterOnVote(user: Address, power: BigInt): void {
        let voter = common.createVoterIfNonExistent(user);
        if (voter.votes.equals(constants.BIGINT_ZERO)) {
            common.incrementVoterCount();
        }
        voter.votes = voter.votes.plus(BigInt.fromI32(1));
        voter.votingPower = power;
        voter.save();
    }

    // @ts-ignore
    export function updateKernelUsers(change: i32): void {
        let overview = getOverview();
        overview.kernelUsers += change;
        overview.save();
    }
}


