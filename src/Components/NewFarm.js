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
    const [sfiAvaxApr, setSFIAvaxApr] = useState();
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

        const rewardRateSFI = await stakeContract.rewardRate();
        const totalStakedSFI = await stakeContract.totalSupply();
        const sfiTVL = ((await stakeContract.totalSupply()) / 10**9) * priceSFI;
        const lSfiApr = ((rewardRateSFI.toString() * 10**9) * 31536000 * 100) / (totalStakedSFI.toString() * 10**9);

        setApr(lSfiApr);

        setSfiTVL(sfiTVL);

        // Calc APR and TVL for SFI/AVAX pool

        const lockedSFI = parseSFIBalance((await sfiAvaxContract.getReserves())[0].toString());
        const sfiAvaxTotalSupply = (await sfiAvaxContract.totalSupply()).toString() / 10**18;
        const sfiAvaxStaked = (await sfiAvaxContract.balanceOf(stakingRewardsPGLAddress)) * 10**18;
        const lSfiAvaxApr = ((rewardRateSFI.toString()) * 31536000 * 100) / ((sfiAvaxStaked/sfiAvaxTotalSupply) * (2 * lockedSFI));
        console.log("lSfiAvaxApr:", lSfiAvaxApr);


        setSfiAvaxTVL((sfiAvaxStaked / sfiAvaxTotalSupply) * lockedSFI * priceSFI);

        // const reserves = await sfiAvaxContract.getReserves();
        // const sfiReserves = parseSFIBalance(reserves[0].toString());
        const totalStakedSFIAvax = parseBalance(await stakePGLContract.totalSupply());

        // setSfiAvaxTVL(sfiTVL / (sfiReserves / totalStakedSFIAvax));

        const rewardRateSFIAvax = await stakePGLContract.rewardRate();
        // console.log("rewardRateSFIAvax", rewardRateSFIAvax.toString())
        // console.log("SFIAPR", ((rewardRateSFI.toString() * 10**9) * 31536000 * 100) / (totalStakedSFI.toString() * 10**9));

        // setSFIAvaxApr(((rewardRateSFIAvax.toString() * 10**9) * 31536000 * 100) / (totalStakedSFIAvax.toString() * 10**18));
        // console.log("sfi in pgl", (lockedSFI / totalStakedSFIAvax))
        

        setSFIAvaxApr(lSfiAvaxApr);

        // setSFIAvaxApr(lSfiApr / (lockedSFI / totalStakedSFIAvax));
        // setSFIAvaxApr(((rewardRateSFI.toString() * 10**9) * 31536000 * 100) / (totalStakedSFI.toString() * 10**9) / (lockedSFI / totalStakedSFIAvax));

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

    const handleWithdraw = async (amount, stake, decimal) => {
      await stake.withdraw(new BigNumber(amount).times(decimal).toString());
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
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-U1DAWAznBHeqEIlVSCgzq+c9gqGAJn5c/t99JyeKa9xxaYpSvHU5awsuZVVFIhvj" crossOrigin="anonymous" />
    <div className="FarmsScreen"> 
    <img src={background} className="FarmsScreen" alt="background" />
    <div className="NavICE">
      <div className="NavigationBar">
        <ul className="NavButtons">
          <li><a href="farms.html">Farms</a></li>
          <li><a href="https://iceagefinance.medium.com/"target="_blank">Medium</a></li>
        </ul>
      </div>
    <div className="banner">
      
      <p className="bannername">ICE AGE FINANCE</p>
      <img className="banner" src={banner} alt="banner" />
    </div>

    <div className="HomeSFI">
      <div className="SFIprice">
        <p>
          SFI Price
        </p>
        <div className="linebreakHome">
        </div>
        <div className="homebarbox">
        <p>{priceSFI ? `$${priceSFI}` : "Loading"}</p>
        </div>
      </div>
      <div className="SFILiq">
        <p>
          SFI Liquidity
        </p>
        <div className="linebreakHome">
        </div>
        <div className="homebarbox">
        </div>
      </div>
      <div className="SFIMC">
        <p>
          SFI Market Cap
        </p>
        <div className="linebreakHome">
        </div>
        <div className="homebarbox">
        </div>
      </div>
      <div className="SFIBurned">
        <p>
          SFI Burned
        </p>
        <div className="linebreakHome">
        </div>
        <div className="homebarbox">
            <p>{burnedSFI ? burnedSFI : "Loading"}</p>
        </div>
      </div>
    </div>
    {/* <div className="HomeSL3">
      <div className="SFIprice">
        <p>
          SL3 Price
        </p>
        <div className="linebreakHome">
        </div>
        <div className="homebarbox">
        </div>
      </div>
      <div className="SFILiq">
        <p>
          SL3 Liquidity
        </p>
        <div className="linebreakHome">
        </div>
        <div className="homebarbox">
        </div>
      </div>
      <div className="SFIMC">
        <p>
          SL3 Market Cap
        </p>
        <div className="linebreakHome">
        </div>
        <div className="homebarbox">
        </div>
      </div>

      <div className="SFIBurned">
        <p>
          SL3 Burned
        </p>
        <div className="linebreakHome">
        </div>
        <div className="homebarbox">
        </div>
      </div>
    </div> */}



    <main className="Parent1">
      <div className="Stake1">
        <h1>Stake SFI</h1>

        <div className="APR-Earned">



          <p className="lowertextAPR">
            APR
          </p>
          <div className="APRprint">
          <p>{apr ? apr + '%' : "Loading"}</p>
          </div>
          <div className="linebreak">
          </div>
          <p className="lowertextEarned">
            Earned SFI
          </p>
          <div className="Earnprint">
            <p>{earnedBalanceFromSFI !== undefined ? earnedBalanceFromSFI : "Loading"}</p>
          </div>
          <input className="bluebut2"type="submit" value="Claim" />
        </div>
        <div className="TVLs">
          <p className="lowertextTVL">
          Farm 
          <br/>
          TVL
          </p>
          <div className="TVLprint">
              <p>${sfiTVL ? sfiTVL : "Loading"}</p>
          </div>
          <div className="linebreak">
          </div>
          <p className="lowertextTVL2">
            Your
            <br/>
             TVL
            </p>
            <div className="TVLprint2">
            </div>
        </div>
        <div className="StakePGL">
          <p className="lowertextAPR">
            Available SFI:
          </p>
          <div className="availabletokens">
              <p>{sfiBalance !== undefined ? sfiBalance : "Loading"}</p>
          </div>
          <div className="linebreak2">
          </div>
          <div>
            <p className="lowertext2">
              Stake:
            </p>
    {/* <form className="Stakeform" action="">

        <input type="text" id="Stake SFI" name="Stake SFI" placeholder="Amount" />

        <input className="bluebut"type="submit" value="Submit" />
        </form> */}

        <form
        className="Stakeform"
        onSubmit={(e) => {
        e.preventDefault();
        const target = e.target;
        const amount = target.amount.value;
        handleStake(amount, RFI_TOKEN_DECIMAL, tokenContract, stakeContract);
        }}>
        <input
            type="text"
            id="Stake SFI"
            name="amount" 
            placeholder="Amount to Stake"
            required
        />
        <button className="bluebut">Stake</button>
        </form>
        
        <p className="lowertext4">
            Staked SFI:
        </p>
        <div className="stakedtokens">
        {stakedSFIBalance !== undefined ? stakedSFIBalance : "Loading"}
        </div>
    </div>
        </div>

        <div className="WithdrawPGL">
          
          
          <div>
            <p className="lowertext3">
              Withdraw:
            </p>
      <form
        className="StakeformW"
        onSubmit={(e) => {
        e.preventDefault();
        const target = e.target;
        const amount = target.amount.value;
        handleWithdraw(amount, stakeContract, RFI_TOKEN_DECIMAL);}}>
    <input
        type="text"
        id="Stake SFI"
        name="amount" 
        placeholder="Amount to Unstake"
        required
    />
    <button className="bluebut">Unstake</button>
        </form>
      </div>
        </div>
      </div>


      <div className="Stake2">
        <h1>SFI-AVAX PGL</h1>

        <div className="APR-Earned">



          <p className="lowertextAPR">
            APR
          </p>
          <div className="APRprint">
              <p>{sfiAvaxApr ? sfiAvaxApr + "%" : "Loading"}</p>
          </div>
          <div className="linebreak">
          </div>
          <p className="lowertextEarned">
            Earned SFI
          </p>
          <div className="Earnprint">
              <p>{earnedBalanceFromPGL !== undefined ? earnedBalanceFromPGL : "Loading"}</p>
          </div>
          <input className="bluebut2"type="submit" value="Claim" />
        </div>
        <div className="TVLs">
          <p className="lowertextTVL">
          Farm 
          <br/>
          TVL
          </p>
          <div className="TVLprint">
              <p>${sfiAvaxTVL ? sfiAvaxTVL : "Loading"}</p>
          </div>
          <div className="linebreak">
          </div>
          <p className="lowertextTVL2">
            Your
            <br/>
             TVL
            </p>
            <div className="TVLprint2">
            </div>
        </div>
        <div className="StakePGL">
          <p className="lowertextAPR">
            Available PGL:
          </p>
          <div className="availabletokens">
              <p>{sfiAvaxBalance ? sfiAvaxBalance : "Loading"}</p>
          </div>
          <div className="linebreak2">
          </div>
          <div>
            <p className="lowertext2">
              Stake:
            </p>
            {/* <form className="Stakeform" action="">

                <input type="text" id="Stake SFI" name="Stake SFI" placeholder="Amount" />

                <input className="bluebut"type="submit" value="Submit" />
            </form> */}

            <form
                className="Stakeform"
                onSubmit={(e) => {
                e.preventDefault();
                const target = e.target;
                const amount = target.amount.value;
                handleStake(amount, TOKEN_DECIMAL, sfiAvaxContract, stakePGLContract)}}>
            <input
                type="text"
                id="Stake SFI"
                name="amount" 
                placeholder="Amount to Stake"
                required
            />
            <button className="bluebut">Stake</button>
            </form>

            <p className="lowertext4">
                Staked PGL:
            </p>
                <div className="stakedtokens">
                    <p>{stakedPGLBalance !== undefined ? stakedPGLBalance : "Loading"}</p>
                </div>
            </div>
        </div>

        <div className="WithdrawPGL">
          <div>
            <p className="lowertext3">
              Withdraw:
            </p>
      <form className="StakeformW" action="">
      <input type="text" id="Stake SFI" name="Stake SFI" placeholder="Amount" />
      <input className="bluebut" type="submit" value="Submit" />
      </form>
      </div>
        </div>
        </div>
    </main>
    {/* <main className="Parent2">
      <div className="Stake3">
        <h1>Stake SL3</h1>
        <div className="APR-Earned">
          <p className="lowertextAPR">
            APR
          </p>
          <div className="APRprint">
          </div>
          <div className="linebreak">
          </div>
          <p className="lowertextEarned">
            Earned SFI
          </p>
          <div className="Earnprint">
          </div>
          <input className="bluebut2"type="submit" value="Claim" />
        </div>
        <div className="TVLs">
          <p className="lowertextTVL">
          Farm 
          <br/>
          TVL
          </p>
          <div className="TVLprint">
          </div>
          <div className="linebreak">
          </div>
          <p className="lowertextTVL2">
            Your
            <br/>
             TVL
            </p>
            <div className="TVLprint2">
            </div>
        </div>
        <div className="StakePGL">
          <p className="lowertextAPR">
            Available SL3:
          </p>
          <div className="availabletokens">
          </div>
          <div className="linebreak2">
          </div>
          <div>
            <p className="lowertext2">
              Stake:
            </p>
        <form className="Stakeform" action="">

            <input type="text" id="Stake SFI" name="Stake SFI" placeholder="Amount" />

            <input className="purpbut"type="submit" value="Submit" />
        </form>
        <p className="lowertext4">
            Staked SL3:
        </p>
        <div className="stakedtokens">
        </div>
        </div>
        </div>

        <div className="WithdrawPGL">
          
          
          <div>
            <p className="lowertext3">
              Withdraw:
            </p>
      <form className="StakeformW" action="">

      <input type="text" id="Stake SFI" name="Stake SFI" placeholder="Amount" />

      <input className="purpbut" type="submit" value="Submit" />
      </form>
      </div>
        </div>


      </div>

      <div className="Stake4">
        <h1>SL3-AVAX PGL</h1>

        <div className="APR-Earned">



          <p className="lowertextAPR">
            APR
          </p>
          <div className="APRprint">
          </div>
          <div className="linebreak">
          </div>
          <p className="lowertextEarned">
            Earned SFI
          </p>
          <div className="Earnprint">
          </div>
          <input className="bluebut2"type="submit" value="Claim" />
        </div>
        <div className="TVLs">
          <p className="lowertextTVL">
          Farm 
          <br/>
          TVL
          </p>
          <div className="TVLprint">
          </div>
          <div className="linebreak">
          </div>
          <p className="lowertextTVL2">
            Your
            <br/>
             TVL
            </p>
            <div className="TVLprint2">
            </div>
        </div>
        <div className="StakePGL">
          <p className="lowertextAPR">
            Available PGL:
          </p>
          <div className="availabletokens">
          </div>
          <div className="linebreak2">
          </div>
          <div>
            <p className="lowertext2">
              Stake:
            </p>
        <form className="Stakeform" action="">

            <input type="text" id="Stake SFI" name="Stake SFI" placeholder="Amount" />

            <input className="purpbut"type="submit" value="Submit" />
        </form>
        <p className="lowertext4">
            Staked PGL:
        </p>
        <div className="stakedtokens">
        </div>
        </div>
        </div>

        <div className="WithdrawPGL">
          
          
          <div>
            <p className="lowertext3">
              Withdraw:
            </p>
      <form className="StakeformW" action="">

      <input type="text" id="Stake SFI" name="Stake SFI" placeholder="Amount" />

      <input className="purpbut" type="submit" value="Submit" />
      </form>
      </div>
        </div>


      </div>

    </main> */}

    <div className="SocialBar">
      <ul className="NavButtons">
        <li><a href="https://twitter.com/IceAgeFinance"target="_blank">Telegram</a></li>
        <li><a href="https://twitter.com/SledFinance"target="_blank">Twitter</a></li>
        <li><a href="https://discord.gg/K8xzyNtXfV"target="_blank">Discord</a></li>
      </ul>
    </div>
  </div>
  </div>
    </>
    );
}

export default Farm;