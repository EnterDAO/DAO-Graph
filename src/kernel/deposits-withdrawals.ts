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
import {constants} from "../constants";

export function handleDeposit(event: Deposit): void {
    let kernel = Kernel.bind(event.address);
    let voter = common.createVoterIfNonExistent(event.params.user);
    voter.tokensStaked = kernel.balanceOf(event.params.user);
    voter.save();

    if (voter.votingPower.equals(constants.BIGINT_ZERO)) {
        common.updateKernelUsers(1);
    }
}

export function handleWithdraw(event: Withdraw): void {
    let supernovaContract = Kernel.bind(event.address);
    let voter = common.createVoterIfNonExistent(event.params.user);
    voter.tokensStaked = supernovaContract.balanceOf(event.params.user);
    voter.save();

    if (voter.tokensStaked.equals(constants.BIGINT_ZERO) && voter.votingPower.equals(constants.BIGINT_ZERO)) {
        common.updateKernelUsers(-1);
    }
}