import {BigInt, TypedMap} from "@graphprotocol/graph-ts";

// @ts-ignore
let proposalStates = new TypedMap<i32, string>()
proposalStates.set(0, 'WARMUP')
proposalStates.set(1, 'ACTIVE')
proposalStates.set(2, 'CANCELED')
proposalStates.set(3, 'FAILED')
proposalStates.set(4, 'ACCEPTED')
proposalStates.set(5, 'QUEUED')
proposalStates.set(6, 'GRACE')
proposalStates.set(7, 'EXPIRED')
proposalStates.set(8, 'EXECUTED')
proposalStates.set(9, 'ABROGATED')


export namespace constants {
    export let BIGINT_ZERO = BigInt.fromI32(0);
    export let BIGINT_ONE = BigInt.fromI32(1);
    export let PROPOSAL_STATE_ENUM = proposalStates;
}