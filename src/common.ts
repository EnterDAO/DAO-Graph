import {BigInt} from "@graphprotocol/graph-ts/index";
import {ProposalStateEvent, Voter} from "../generated/schema";
import {Bytes} from "@graphprotocol/graph-ts";

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
            voter.userAddress = userAddress
            voter.tokensStaked = BigInt.fromI32(0)
            voter.lockedUntil = BigInt.fromI32(0)
            voter.delegatedPower = BigInt.fromI32(0)
            voter.votes = BigInt.fromI32(0)
            voter.proposals = BigInt.fromI32(0)
            voter.votingPower = BigInt.fromI32(0)
            voter.hasActiveDelegation = false
            voter.save()
        }
        return voter as Voter
    }
}


