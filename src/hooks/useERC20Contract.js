import useContract from "./useContract";

const ABI = [
  "function balanceOf(address owner) view returns (uint)",
  "function transfer(address to, uint amount)",
  "event Transfer(address indexed from, address indexed to, uint amount)",
];

import sfiABI from "../config/abi/sfi.json";
import stakingrewardsABI from "../config/abi/stakingrewards.json";


/**
 * @name useERC20Contract
 * @description Uses the new Human-Readable ABI format from ethers v5. Supports ERC20 contract functions of 'balanceOf', 'transfer', and the 'Transfer' event itself.
 * @param {string} tokenAddress
 */
export function useSFIContract(tokenAddress) {
  return useContract(tokenAddress, sfiABI, true);
}

export function useStakingRewardsContract(contractAddress) {
  return useContract(contractAddress, stakingrewardsABI, true);
}