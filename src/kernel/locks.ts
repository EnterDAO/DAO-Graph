import {Kernel, Lock} from "../../generated/Kernel/Kernel";
import {common} from "../common";
import {constants} from "../constants";

export function handleLock(event: Lock): void {
    let kernel = Kernel.bind(event.address);
    let lockTimestamp = kernel.userLockedUntil(event.params.user);
    let voter = common.createVoterIfNonExistent(event.params.user);
    let overview = common.getOverview();

    let startTs = constants.BIGINT_ZERO;
    // The voter already locked. Use the difference in locking time
    if (voter.lockedUntil.gt(event.block.timestamp)) {
        startTs = voter.lockedUntil;
    } else {
        startTs = event.block.timestamp;
    }
    let lockTimeDelta = lockTimestamp.minus(startTs);
    overview._numberOfLocks = overview._numberOfLocks.plus(constants.BIGINT_ONE);
    overview._sumLockTime = overview._sumLockTime.plus(lockTimeDelta);
    overview.avgLockTimeSeconds = overview._sumLockTime.div(overview._numberOfLocks);
    overview.save();

    voter.lockedUntil = lockTimestamp;
    voter.save();
}