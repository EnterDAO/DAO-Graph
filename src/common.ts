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
        // // set endTimestamp of previous proposal state if its unset or greater than current psh startTimestamp
        // if (history.length < 2) return
        // // can't make assumptions about order of history array
        // for (let i = 0; i < history.length; i++) {
        //   let prevPSH = ProposalStateHistory.load(history[i])
        //   if (prevPSH == null) continue
        //   if (prevPSH.id == psh.id) continue
        //   if (!prevPSH.endTimestamp.equals(BigInt.fromI32(0)) && prevPSH.endTimestamp.lt(startTimestamp)) continue
        //   prevPSH.endTimestamp = startTimestamp
        //   prevPSH.save()
        // }
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


