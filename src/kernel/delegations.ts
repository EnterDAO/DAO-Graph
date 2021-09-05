import {Delegate, DelegatedPowerDecreased, DelegatedPowerIncreased, Kernel} from "../../generated/Kernel/Kernel";
import {common} from "../common";
import {Bytes} from "@graphprotocol/graph-ts/index";

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
    let kernel = Kernel.bind(event.address);
    let voter = common.createVoterIfNonExistent(event.params.from);
    voter.delegatedPower = kernel.delegatedPower(event.params.to);
    voter.save();

    let overview = common.getOverview();
    overview.totalDelegatedPower = overview.totalDelegatedPower.plus(event.params.amount);
    overview.save();
}

export function handleDelegatedPowerDecreased(event: DelegatedPowerDecreased): void {
    let supernovaContract = Kernel.bind(event.address);
    let voter = common.createVoterIfNonExistent(event.params.from);
    voter.delegatedPower = supernovaContract.delegatedPower(event.params.to);
    voter.save();

    let overview = common.getOverview();
    overview.totalDelegatedPower = overview.totalDelegatedPower.minus(event.params.amount);
    overview.save();
}