import {
    Deposit,
    Withdraw
} from "../../generated/Kernel/Kernel";
import {common} from "../common";
import {constants} from "../constants";

export function handleDeposit(event: Deposit): void {
    let voter = common.createVoterIfNonExistent(event.params.user);
    voter.tokensStaked = event.params.newBalance;
    voter._tokensStakedWithoutDecimals = event.params.newBalance.div(constants.TEN_TO_THE_EIGHTEEN).toI32();

    // First time depositing && does not have delegated power yet
    if (event.params.newBalance.equals(event.params.amount) && voter.delegatedPower.equals(constants.BIGINT_ZERO)) {
        voter.isKernelUser = true;
        common.updateKernelUsers(1);
    }
    voter.save();
}

export function handleWithdraw(event: Withdraw): void {
    let voter = common.createVoterIfNonExistent(event.params.user);
    voter.tokensStaked = event.params.amountLeft;
    voter._tokensStakedWithoutDecimals = event.params.amountLeft.div(constants.TEN_TO_THE_EIGHTEEN).toI32();

    // Removed all deposits && does no have delegated power
    if (voter.tokensStaked.equals(constants.BIGINT_ZERO) && voter.delegatedPower.equals(constants.BIGINT_ZERO)) {
        voter.isKernelUser = false;
        common.updateKernelUsers(-1);
    }
    voter.save();
}