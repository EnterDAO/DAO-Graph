import {BigInt} from "@graphprotocol/graph-ts/index";
import {ProposalStateEvent} from "../generated/schema";

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
}


