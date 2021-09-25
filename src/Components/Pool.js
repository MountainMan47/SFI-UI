import { useState, useEffect, useCallback } from 'react';
import { useWeb3React } from "@web3-react/core";
import { ethers } from 'ethers';
import useContract from "../hooks/useContract";
import BigNumber from 'bignumber.js';
import { RFI_TOKEN_DECIMAL, parseSFIBalance, parseBalance } from '../util';
import { getStakingRewardsAddress, getSfiAddress } from '../utils/addressHelpers.js';
// import { AbiItem } from "web3-utils";

// Abis
import stakingrewardsABI from "../config/abi/stakingrewards.json";
import sfiABI from "../config/abi/sfi.json";

// Addresses
const stakingrewardsAddress = getStakingRewardsAddress();
const sfiAddress = getSfiAddress();

const Pool = () => {
    const { account } = useWeb3React();
    const [stakeContract, setStakeContract] = useState();
    const [tokenContract, setTokenContract] = useState();
    const [balance, setBalance] = useState(0);

    const fetchStakeContract = useContract(stakingrewardsAddress, stakingrewardsABI, true);
    const fetchTokenContract = useContract(sfiAddress, sfiABI, true);
    
    // const getBalance = stakeContract.balanceOf(account);

    useEffect(async () => {
        setStakeContract(await fetchStakeContract);
        setTokenContract(await fetchTokenContract);
        // console.log("Balance?", await stakeContract.balanceOf(account).call())
        
    }, [fetchStakeContract, fetchTokenContract]);

    const handleApprove = async () => {
        console.log("account", account);
        await tokenContract.approve(stakeContract.address, ethers.constants.MaxUint256);
    }

    const handleStake = async (amount) => {
        await stakeContract.stake(new BigNumber(amount).times(RFI_TOKEN_DECIMAL).toString());
    }

    const handleGetReward = async () => {
        await stakeContract.getReward();
    }

    const handleEarned = async () => {
      const earned = await stakeContract.earned(account);
      alert(`You have earned: ${earned > 0 ? parseBalance(earned) : 0} SFI`);
    }

    const handleWithdraw = async (amount) => {
      await stakeContract.withdraw(new BigNumber(amount).times(RFI_TOKEN_DECIMAL).toString());
    }

    const handleGetBalance = async () => {
      const balance = parseSFIBalance(await stakeContract.balanceOf(account));

      alert(`You have ${balance} SFI available to withdraw`);
    }

    const handleExit = async () => {
      await stakeContract.exit();
    }

    console.log("stake contract", stakeContract);
    console.log("sfi contract", tokenContract);

    return (
        <>
            <p>Pool address: {stakingrewardsAddress}</p>
            <p>SFI address: {sfiAddress}</p>
            <button onClick={handleApprove}>Approve SFI</button>
            <br/><br/>
            <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target;
                  const amount = target.amount.value;
                  handleStake(amount);
                }}
              >
                <input
                  type="amount"
                  name="amount"
                  placeholder={"Amount to stake"}
                  required
                />
                <br />
                <input type="submit" value="Stake" />
                <br/><br />
              </form>
              <button onClick={handleEarned}>Check Reward Balance</button>
              <br/><br/>              
              <button onClick={handleGetReward}>Claim Reward</button>
              <br/><br/>
              <button onClick={handleGetBalance}>Check SFI Balance</button>
              <br/><br/>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target;
                  const amount = target.amount.value;
                  handleWithdraw(amount);
                }}
              >
                <input
                  type="amount"
                  name="amount"
                  placeholder={"Amount to withdraw"}
                  required
                />
                <br />
                <input type="submit" value="Withdraw" />
                <br/><br />
              </form>
              <button onClick={handleExit}>Exit</button><br/>
        </>
    );
}

export default Pool;