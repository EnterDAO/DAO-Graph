import {
    Delegate, DelegatedPowerDecreased,
    DelegatedPowerIncreased,
    Deposit,
    Lock,
    Kernel,
    Withdraw
} from "../../generated/Kernel/Kernel";
import {common} from "../common";
import {Bytes} from "@graphprotocol/graph-ts";

export function handleDeposit(event: Deposit): void {
    let supernovaContract = Kernel.bind(event.address)
    let voter = common.createVoterIfNonExistent(event.params.user)
    voter.tokensStaked = supernovaContract.balanceOf(event.params.user)
    voter.save()
}

export function handleWithdraw(event: Withdraw): void {
    let supernovaContract = Kernel.bind(event.address)
    let voter = common.createVoterIfNonExistent(event.params.user)
    voter.tokensStaked = supernovaContract.balanceOf(event.params.user)
    voter.save()
}

export function handleLock(event: Lock): void {
    let supernovaContract = Kernel.bind(event.address)
    let voter = common.createVoterIfNonExistent(event.params.user)
    voter.lockedUntil = supernovaContract.userLockedUntil(event.params.user)
    voter.save()
}

export function handleDelegate(event: Delegate): void {
    let supernovaContract = Kernel.bind(event.address)
    let voter = common.createVoterIfNonExistent(event.params.from)
    voter.hasActiveDelegation = !(supernovaContract.userDelegatedTo(event.params.from)
        .equals(Bytes.fromHexString('0x0000000000000000000000000000000000000000')))
    // for sanity, covered by following two handler as well
    voter.delegatedPower = supernovaContract.delegatedPower(event.params.to)
    voter.save()
}

export function handleDelegatedPowerIncreased(event: DelegatedPowerIncreased): void {
    let supernovaContract = Kernel.bind(event.address)
    let voter = common.createVoterIfNonExistent(event.params.from)
    voter.delegatedPower = supernovaContract.delegatedPower(event.params.to)
    voter.save()
}

export function handleDelegatedPowerDecreased(event: DelegatedPowerDecreased): void {
    let supernovaContract = Kernel.bind(event.address)
    let voter = common.createVoterIfNonExistent(event.params.from)
    voter.delegatedPower = supernovaContract.delegatedPower(event.params.to)
    voter.save()
}