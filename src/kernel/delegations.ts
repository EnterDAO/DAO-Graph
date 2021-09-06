import {Delegate, DelegatedPowerDecreased, DelegatedPowerIncreased, Kernel} from "../../generated/Kernel/Kernel";
import {common} from "../common";
import {Address} from "@graphprotocol/graph-ts";
import {constants} from "../constants";

export function handleDelegate(event: Delegate): void {
    let voter = common.createVoterIfNonExistent(event.params.from);
    voter.hasActiveDelegation = !event.params.to.equals(Address.fromHexString('0x0000000000000000000000000000000000000000'));
    voter.save();
}

export function handleDelegatedPowerIncreased(event: DelegatedPowerIncreased): void {
    let voter = common.createVoterIfNonExistent(event.params.to);
    voter.delegatedPower = event.params.to_newDelegatedPower;
    voter.save();

    let overview = common.getOverview();
    overview.totalDelegatedPower = overview.totalDelegatedPower.plus(event.params.amount);
    overview.save();

    // First time getting delegation && does not have tokens staked yet
    if (voter.tokensStaked.equals(constants.BIGINT_ZERO) && event.params.amount.equals(event.params.to_newDelegatedPower)) {
        common.updateKernelUsers(1);
    }
}

export function handleDelegatedPowerDecreased(event: DelegatedPowerDecreased): void {
    let voter = common.createVoterIfNonExistent(event.params.to);
    voter.delegatedPower = event.params.to_newDelegatedPower;
    voter.save();

    let overview = common.getOverview();
    overview.totalDelegatedPower = overview.totalDelegatedPower.minus(event.params.amount);
    overview.save();

    // if (voter.tokensStaked.equals(constants.BIGINT_ZERO) && voter.delegatedPower.equals(constants.BIGINT_ZERO)) {
    //     common.updateKernelUsers(-1);
    // }
}