import {common} from "../common";
import {constants} from "../constants";
import {Token, Transfer} from "../../generated/Token/Token";

export function handleTransfer(event: Transfer): void {
    let token = Token.bind(event.address);
    let fromBalance = token.balanceOf(event.params.from);
    let toBalance = token.balanceOf(event.params.to);

    let change = 0;
    if (fromBalance.equals(constants.BIGINT_ZERO)) {
        change -= 1;
    }
    if (toBalance.equals(event.params.value)) {
        change += 1;
    }
    if (change != 0) {
        common.updateHolders(change);
    }
}