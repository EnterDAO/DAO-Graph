import {BigInt, TypedMap} from "@graphprotocol/graph-ts";

// @ts-ignore
let proposalEvents = new TypedMap<i32, string>()
proposalEvents.set(0, 'CREATED')
proposalEvents.set(1, 'QUEUED')
proposalEvents.set(2, 'EXECUTED')
proposalEvents.set(3, 'CANCELED')

export namespace constants {
    export let BIGINT_ZERO = BigInt.fromI32(0);
    export let BIGINT_ONE = BigInt.fromI32(1);
    export let PROPOSAL_EVENTS = proposalEvents;
}