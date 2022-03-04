import {
    Claimed,
} from "../../generated/MerkleDistributor/MerkleDistributor";
import {Claim} from "../../generated/schema";
import {common} from "../common";

export function handleClaim(event: Claimed): void {
    let claim = new Claim(event.params.account.toHexString());
    let overview = common.getOverview();

    claim.claimerIndex = event.params.index;
    claim.claimer = event.params.account;
    claim.claimAmount = event.params.amount;
    claim.adjustedAmount = event.params.adjustedAmount;
    claim.redistributedAmount = claim.claimAmount.minus(claim.adjustedAmount);

    overview.totalAirdropClaimed = overview.totalAirdropClaimed.plus(claim.adjustedAmount);
    overview.totalAirdropRedistributed = overview.totalAirdropRedistributed.plus(claim.redistributedAmount);

    overview.save();
    claim.save();
}