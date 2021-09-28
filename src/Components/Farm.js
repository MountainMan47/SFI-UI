import { useState, useEffect, useCallback } from 'react';
import { useWeb3React } from "@web3-react/core";
import { ethers } from 'ethers';
import useContract from "../hooks/useContract";
import BigNumber from 'bignumber.js';
import * as QUERIES from '../utils/queries'
import * as gql from '../utils/gql'
import { RFI_TOKEN_DECIMAL, TOKEN_DECIMAL, parseBalance, parseSFIBalance } from '../util';
import { getStakingRewardsAddress, getStakingRewardsPGLAddress, getSfiAddress, getSfiAvaxPGLAddress } from '../utils/addressHelpers.js';
import background from './CSS/ICE-background.png';
import icicles from "./CSS/Icicles.png";
import banner from "./CSS/IceBanner.png";
import '../Components/CSS/styles.css';
import useBlockNumber from "../hooks/useBlockNumber";
// import { AbiItem } from "web3-utils";

// Abis
import stakingrewardsABI from "../config/abi/stakingrewards.json";
import sfiABI from "../config/abi/sfi.json";
import pglABI from "../config/abi/pgl.json";
import contracts from '../config/constants/contracts';

// Addresses
const stakingRewardsAddress = getStakingRewardsAddress();
const stakingRewardsPGLAddress = getStakingRewardsPGLAddress();
const sfiAddress = getSfiAddress();
const sfiAvaxAddress = getSfiAvaxPGLAddress();

const Farm = () => {
    const { account } = useWeb3React();
    const [stakeContract, setStakeContract] = useState();
    const [stakePGLContract, setStakePGLContract] = useState();
    const [tokenContract, setTokenContract] = useState();
    const [sfiAvaxContract, setSfiAvaxContract] = useState();
    const [sfiBalance, setSFIBalance] = useState();
    const [earnedBalanceFromSFI, setEarnedBalanceFromSFI] = useState();
    const [earnedBalanceFromPGL, setEarnedBalanceFromPGL] = useState();
    const [stakedSFIBalance, setStakedSFIBalance] = useState();
    const [stakedPGLBalance, setStakedPGLBalance] = useState();
    const [sfiAvaxBalance, setSfiAvaxBalance] = useState();
    const [priceSFI, setPriceSFI] = useState();
    const [burnedSFI, setBurnedSFI] = useState();
    const [apr, setApr] = useState();
    const [sfiTVL, setSfiTVL] = useState();
    const [sfiAvaxTVL, setSfiAvaxTVL] = useState();

    const fetchStakeContract = useContract(stakingRewardsAddress, stakingrewardsABI, true);
    const fetchStakePGLContract = useContract(stakingRewardsPGLAddress, stakingrewardsABI, true);
    const fetchTokenContract = useContract(sfiAddress, sfiABI, true);
    const fetchSfiAvaxContract = useContract(sfiAvaxAddress, pglABI, true);

    const blockNumber = useBlockNumber().data;

    
    useEffect(async () => {
        setSfiAvaxContract(await fetchSfiAvaxContract);
        setStakeContract(await fetchStakeContract);
        setStakePGLContract(await fetchStakePGLContract);
        setTokenContract(await fetchTokenContract);
    }, [fetchStakeContract, fetchTokenContract, fetchSfiAvaxContract, fetchStakePGLContract]);

    const graphetch = async () => {
        let rawPriceSFI;
        let ethPrice;

        await gql.request(QUERIES.TOKEN,{
        id: "0x1f1fe1ef06ab30a791d6357fdf0a7361b39b1537"
        })
        .then(res => rawPriceSFI = res.token.derivedETH);

        await gql.request(QUERIES.AVAXPRICE,{
        id: 1,
        block: await blockNumber,
        })
        .then(res => ethPrice = res.bundle.ethPrice);

        setPriceSFI(rawPriceSFI * ethPrice);

        // console.log("Price:", rawPriceSFI * ethPrice, "SFI:", priceSFI, "AVAX:", ethPrice, "Blocknumber:", blockNumber);

    }

    if(blockNumber){
        graphetch();
    }

    const setBals = async () => {

        if(!sfiBalance && !earnedBalanceFromSFI && !sfiAvaxBalance){
            setSFIBalance(parseSFIBalance(await tokenContract.balanceOf(account)));
            setEarnedBalanceFromSFI(parseSFIBalance(await stakeContract.earned(account)));
            setEarnedBalanceFromPGL(parseSFIBalance(await stakePGLContract.earned(account)))
            setSfiAvaxBalance((await sfiAvaxContract.balanceOf(account) / 10**18));
        }
    
        setStakedSFIBalance(parseSFIBalance(await stakeContract.balanceOf(account)));
        setStakedPGLBalance(parseBalance(await stakePGLContract.balanceOf(account)));
    
        // Pretty sure this should be replaced with Vitalik's address to calc burn on mainnet... ?
        await tokenContract.balanceOf("0xCCA162Fe23AB614174bC99A9e9019d211133a8d1")
        .then(balance =>
            tokenContract.decimals()
            .then((decimals) => {
                let burned = balance.div(10**decimals);
                setBurnedSFI(burned.toString());
            })
        );

        // Calc APR and TVL for single asset pool

        let rewardRateSFI = await stakeContract.rewardRate();
        let totalStakedSFI = await tokenContract.balanceOf(stakeContract.address);

        setApr((rewardRateSFI.toString() * 52) / (totalStakedSFI.toString() * 10**9));

        setSfiTVL(((await stakeContract.totalSupply()) / 10**9) * priceSFI);

        // Calc APR and TVL for SFI/AVAX pool

        const lockedSFI = parseSFIBalance((await sfiAvaxContract.getReserves())[0].toString());
        const sfiAvaxTotalSupply = (await sfiAvaxContract.totalSupply()).toString() / 10**18;
        const sfiAvaxStaked = (await sfiAvaxContract.balanceOf(stakingRewardsPGLAddress)) * 10**18; // just using this to test while 100% of pgl is "staked"

        // console.log(lockedSFI, sfiAvaxTotalSupply, await sfiAvaxBalance);
        // console.log("TVL:", (sfiAvaxStaked / sfiAvaxTotalSupply) * lockedSFI * priceSFI);

        setSfiAvaxTVL((sfiAvaxStaked / sfiAvaxTotalSupply) * lockedSFI * priceSFI);

        

    }

    if(tokenContract && stakeContract){
        setBals();
    }

    const handleStake = async (amount, decimal, token, stake) => {

        const formattedAmount = new BigNumber(amount).times(decimal).toString();
        const approvalTxn = await token.approve(stake.address, formattedAmount);
        console.log(`Approving ${amount} SFI`);
        await approvalTxn.wait();
        await stake.stake(formattedAmount);
        console.log(`Staked ${amount} SFI`);

    }

    // const handleStake = async (amount, decimal, token, stake) => {

    //     const formattedAmount = new BigNumber(amount).times(RFI_TOKEN_DECIMAL).toString();
    //     const approvalTxn = await tokenContract.approve(stakeContract.address, formattedAmount);
    //     console.log(`Approving ${amount} SFI`);
    //     await approvalTxn.wait();
    //     await stakeContract.stake(formattedAmount);
    //     console.log(`Staked ${amount} SFI`);

    // }

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

    return (
        <>
         <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-U1DAWAznBHeqEIlVSCgzq+c9gqGAJn5c/t99JyeKa9xxaYpSvHU5awsuZVVFIhvj" crossOrigin="anonymous"></script>
        <div className="FarmsScreen">
        <img src={background} className="FarmsScreen" alt="background" />
        <div className="NavICE">
            <div className="NavigationBar">
            <ul className="NavButtons">
                <li><a href="Home.html">Home</a></li>
                <li><a href="farms.html">Farms</a></li>
                <li><a href="contact.asp">NFTs</a></li>
                <li><a href="about.asp">Tokenomics</a></li>
            </ul>
            </div>
            <div>
            <img className="Icicles1" src={icicles} />
            <img className="Icicles2" src={icicles} />
            <img className="Icicles3" src={icicles} />
            <img className="Icicles4" src={icicles} />
            </div>
        </div>

        <div className="banner">
            <img className="banner" src={banner} alt="banner" />
        </div>

        <main className="Parent1">
            <p>Price SFI: {priceSFI ? `$${priceSFI}` : "Loading"}
            Burned SFI: {burnedSFI ? burnedSFI : "Loading"}
            APR: {apr ? apr : "Loading"}</p>
            <div className="Stake1">
            <h1>Stake SFI</h1>
            <p><b>TVL:</b>${sfiTVL}</p>
            <div className="AvailabePGL">

                <p className="lowertext">
                Available SFI
                </p>

                <div className="linebreak">
                    <br/>
                    <center>
                        {sfiBalance !== undefined ? sfiBalance : "Loading"}
                    </center>
                </div>
                <div className="enterbox">
                </div>
            </div>
            <div className="EarnedPGL">
                <p className="lowertext">
                Earned SFI
                </p>
                <div className="linebreak">
                    <br/>
                    <center>
                        {earnedBalanceFromSFI !== undefined ? earnedBalanceFromSFI : "Loading"}
                    </center>
                </div>
            </div>
            <div className="StakePGL">
                <p className="lowertext">
                Staked SFI
                </p>
                <div className="linebreak">
                    <br/>
                    <center>
                        {stakedSFIBalance !== undefined ? stakedSFIBalance : "Loading"}
                        <br/><br/>
                        <form
                            onSubmit={(e) => {
                            e.preventDefault();
                            const target = e.target;
                            const amount = target.amount.value;
                            handleStake(amount, RFI_TOKEN_DECIMAL, tokenContract, stakeContract);
                            }}>
                        <input
                            type="amount"
                            name="amount" 
                            placeholder="Amount to Stake"
                            required
                        />
                        <button>Stake</button>
                        </form>
                    </center>
                </div>
            </div>

            <div className="WithdrawPGL">
                <p className="lowertext">
                Withdraw SFI
                </p>
                <div className="linebreak">
                </div>

            </div>

            </div>


            <div className="Stake2">
            <h1>SFI-AVAX PGL</h1>
            <p><b>TVL:</b>${sfiAvaxTVL}</p>
            <div className="AvailabePGL">



                <p className="lowertext">
                Available PGL
                </p>

                <div className="linebreak">
                    <br/>
                    {sfiAvaxBalance}
                </div>
                <div className="enterbox">
                </div>
            </div>

            <div className="EarnedPGL">
                <p className="lowertext">
                Earned SFI
                </p>
                <div className="linebreak">
                <br/>
                <center>
                        {earnedBalanceFromPGL !== undefined ? earnedBalanceFromPGL : "Loading"}
                    </center>
                </div>
            </div>
            <div className="StakePGL">
                <p className="lowertext">
                Staked PGL
                </p>
                <div className="linebreak">
                <br/>
                    <center>
                        {stakedPGLBalance !== undefined ? stakedPGLBalance : "Loading"}
                        <br/><br/>
                        <form
                            onSubmit={(e) => {
                            e.preventDefault();
                            const target = e.target;
                            const amount = target.amount.value;
                            handleStake(amount, TOKEN_DECIMAL, sfiAvaxContract, stakePGLContract);
                            }}>
                        <input
                            type="amount"
                            name="amount" 
                            placeholder="Amount to Stake"
                            required
                        />
                        <button>Stake</button>
                        </form>
                    </center>
                </div>
            </div>

            <div className="WithdrawPGL">
                <p className="lowertext">
                Withdraw PGL
                </p>
                <div className="linebreak">
                </div>
            </div>


            </div>
        </main>


        {/* <main className="Parent2">

            <div className="Stake3">
            <h1>Stake SL3 </h1>

            <div className="AvailabePGL">



                <p className="lowertext">
                Available SFI
                </p>

                <div className="linebreak">
                </div>
                <div className="enterbox">
                </div>
            </div>

            <div className="EarnedPGL">
                <p className="lowertext">
                Earned SFI
                </p>
                <div className="linebreak">
                </div>
            </div>
            <div className="StakePGL">
                <p className="lowertext">
                Staked SFI
                </p>
                <div className="linebreak">
                </div>
            </div>

            <div className="WithdrawPGL">
                <p className="lowertext">
                Withdraw SFI
                </p>
                <div className="linebreak">
                </div>
            </div>


            </div>

            <div className="Stake4">
            <h1>SL3-AVAX PGL</h1>

            <div className="AvailabePGL">



                <p className="lowertext">
                Available SFI
                </p>

                <div className="linebreak">
                </div>
                <div className="enterbox">
                </div>
            </div>

            <div className="EarnedPGL">
                <p className="lowertext">
                Earned SFI
                </p>
                <div className="linebreak">
                </div>
            </div>
            <div className="StakePGL">
                <p className="lowertext">
                Staked SFI
                </p>
                <div className="linebreak">
                </div>
            </div>

            <div className="WithdrawPGL">
                <p className="lowertext">
                Withdraw SFI
                </p>
                <div className="linebreak">
                </div>
            </div>


            </div>

        </main> */}

        <div className="SocialBar">
            <ul className="NavButtons">
            <li><a href="https://t.me/sled_finance">Telegram</a></li>
            <li><a href="https://twitter.com/SledFinance">Twitter</a></li>
            <li><a href="contact.asp">Discord</a></li>
            <li><a href="about.asp">Medium</a></li>
            </ul>
        </div>
        </div>
      </>
    );
}

export default Farm;