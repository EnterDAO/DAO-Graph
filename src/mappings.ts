import {
    handleProposalCreated,
    handleProposalCanceled,
    handleProposalExecuted,
    handleProposalQueued } from "./governance/proposals";
import { handleVote, handleVoteCanceled } from './governance/votes';
import { handleAbrogationProposalStarted,
    handleAbrogationProposalVote,
    handleAbrogationProposalVoteCancelled,
    handleAbrogationProposalExecuted } from './governance/abrogation';
import {handleDelegate, handleDelegatedPowerIncreased, handleDelegatedPowerDecreased} from './kernel/delegations';
import {handleDeposit, handleWithdraw} from './kernel/deposits-withdrawals';
import {handleLock} from './kernel/locks';
import {handleTransfer} from "./token/transfers";
import {handleClaim} from "./airdrop/claims";

/**
 * GOVERNANCE
 */
export {
    /**
     * Proposal Events
     */
    handleProposalCreated,
    handleProposalCanceled,
    handleProposalExecuted,
    handleProposalQueued,

    /**
     * Vote Events
     */
    handleVote,
    handleVoteCanceled,

    /**
     * Abrogation Events
     */
    handleAbrogationProposalStarted,
    handleAbrogationProposalVote,
    handleAbrogationProposalVoteCancelled,
    handleAbrogationProposalExecuted,
}

/**
 * KERNEL
 */
export {
    handleDeposit,
    handleWithdraw,
    handleLock,
    handleDelegate,
    handleDelegatedPowerIncreased,
    handleDelegatedPowerDecreased
}

/** TOKEN */
export {
    handleTransfer
}

/**
 * Airdrop
 */
 export {
    handleClaim,
}