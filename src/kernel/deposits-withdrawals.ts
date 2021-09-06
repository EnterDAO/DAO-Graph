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
    let voter = common.createVoterIfNonExistent(event.params.user);
    voter.tokensStaked = event.params.newBalance;
    voter.save();

    if (voter.votingPower.equals(constants.BIGINT_ZERO)) {
        common.updateKernelUsers(1);
    }
}

export function handleWithdraw(event: Withdraw): void {
    let voter = common.createVoterIfNonExistent(event.params.user);
    voter.tokensStaked = event.params.amountLeft;
    voter.save();

    if (voter.tokensStaked.equals(constants.BIGINT_ZERO) && voter.votingPower.equals(constants.BIGINT_ZERO)) {
        common.updateKernelUsers(-1);
    }
}