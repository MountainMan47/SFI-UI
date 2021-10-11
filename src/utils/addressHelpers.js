import addresses from '../config/constants/contracts.js';
import tokens from '../config/constants/tokens.js';
import { Address } from '../config/constants/types';

export const getAddress = (address) => {
    const mainNetChainId = 43114;
    const chainId = 43113; // will eventually switch this to env variable
    return address[chainId] ? address[chainId] : address[mainNetChainId];
}

export const getStakingRewardsAddress = () => {
    return getAddress(addresses.stakingReward);
}

export const getStakingRewardsPGLAddress = () => {
    return getAddress(addresses.stakingRewardPGL);
}

export const getStakingRewardsSL3Address = () => {
    return getAddress(addresses.stakingRewardSL3)
}

export const getStakingRewardsSL3PGLAddress = () => {
    return getAddress(addresses.stakingRewardSL3PGL)
}

export const getSfiAddress = () => {
    return getAddress(tokens.sfi.address);
}

export const getSfiAvaxPGLAddress = () => {
    return getAddress(tokens.sfiAvax.address);
}

export const getSL3Address = () => {
    return getAddress(tokens.sl3.address);
}

export const getSL3AvaxAddress = () => {
    return getAddress(tokens.sl3Avax.address);
}