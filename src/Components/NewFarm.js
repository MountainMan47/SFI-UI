import '../Components/CSS/styles.css';
import { useState, useEffect, useCallback } from 'react';
import { useWeb3React } from "@web3-react/core";
import { ethers } from 'ethers';
import useContract from "../hooks/useContract";
import BigNumber from 'bignumber.js';
import * as QUERIES from '../utils/queries'
import * as gql from '../utils/gql'
import { RFI_TOKEN_DECIMAL, TOKEN_DECIMAL, parseBalance, parseSFIBalance } from '../util';
import { getStakingRewardsAddress, getStakingRewardsPGLAddress, getStakingRewardsSL3Address, getStakingRewardsSL3PGLAddress, getSfiAddress, getSfiAvaxPGLAddress, getSL3Address, getSL3AvaxAddress } from '../utils/addressHelpers.js';
import background from './CSS/ICE-background.png';
import banner from './CSS/Artboard 1.png';
import useBlockNumber from "../hooks/useBlockNumber";
import useEagerConnect from '../hooks/useEagerConnect';
import Account from '../Components/Account';
// import { AbiItem } from "web3-utils";

// Abis
import stakingrewardsABI from "../config/abi/stakingrewards.json";
import sfiABI from "../config/abi/sfi.json";
import sl3ABI from "../config/abi/sl3.json"
import pglABI from "../config/abi/pgl.json";
import contracts from '../config/constants/contracts';

// Addresses
const stakingRewardsAddress = getStakingRewardsAddress();
const stakingRewardsPGLAddress = getStakingRewardsPGLAddress();
const stakingRewardsSL3Address = getStakingRewardsSL3Address();
const stakingRewardsSL3AvaxAddress = getStakingRewardsSL3PGLAddress()
const sfiAddress = getSfiAddress();
const sfiAvaxAddress = getSfiAvaxPGLAddress();
const sl3Address = getSL3Address();
const sl3AvaxAddress = getSL3AvaxAddress();

const Farm = () => {
    const { account } = useWeb3React();
    const [stakeContract, setStakeContract] = useState();
    const [stakeSL3Contract, setStakeSL3Contract] = useState();
    const [stakePGLContract, setStakePGLContract] = useState();
    const [stakeSL3PGLContract, setStakeSL3PGLContract] = useState();
    const [tokenContract, setTokenContract] = useState();
    const [sl3Contract, setSL3Contract] = useState();
    const [sfiAvaxContract, setSfiAvaxContract] = useState();
    const [sl3AvaxContract, setSL3AvaxContract] = useState();
    const [sfiBalance, setSFIBalance] = useState();
    const [sl3Balance, setSL3Balance] = useState();
    const [earnedBalanceFromSFI, setEarnedBalanceFromSFI] = useState();
    const [earnedBalanceFromSL3, setEarnedBalanceFromSL3] = useState();
    const [earnedBalanceFromPGL, setEarnedBalanceFromPGL] = useState();
    const [earnedBalanceFromSL3PGL, setEarnedBalanceFromSL3PGL] = useState();
    const [stakedSFIBalance, setStakedSFIBalance] = useState();
    const [stakedSL3Balance, setStakedSL3Balance] = useState();
    const [stakedPGLBalance, setStakedPGLBalance] = useState();
    const [stakedSL3PGLBalance, setStakedSL3PGLBalance] = useState();
    const [sfiAvaxBalance, setSfiAvaxBalance] = useState();
    const [sl3AvaxBalance, setSL3AvaxBalance] = useState();
    const [priceSFI, setPriceSFI] = useState();
    const [priceSL3, setPriceSL3] = useState();
    const [priceAvax, setPriceAvax] = useState();
    const [burnedSFI, setBurnedSFI] = useState();
    const [burnedSL3, setBurnedSL3] = useState();
    const [apr, setApr] = useState();
    const [sl3Apr, setSL3Apr] = useState();
    const [sfiAvaxApr, setSFIAvaxApr] = useState();
    const [sl3AvaxApr, setSL3AvaxApr] = useState();
    const [sfiTVL, setSfiTVL] = useState();
    const [yourSFITVL, setYourSFITVL] = useState();
    const [sl3TVL, setSL3TVL] = useState();
    const [yourSL3TVL, setYourSL3TVL] = useState();
    const [sfiMC, setSFIMC] = useState();
    const [sl3MC, setSL3MC] = useState();
    const [sfiTotalLiq, setSfiTotalLiq] = useState();
    const [sl3TotalLiq, setSl3TotalLiq] = useState();
    const [sfiAvaxTVL, setSfiAvaxTVL] = useState();
    const [yourSfiAvaxTVL, setYourSfiAvaxTVL] = useState();
    const [sl3AvaxTVL, setSL3AvaxTVL] = useState();
    const [yourSL3AvaxTVL, setYourSL3AvaxTVL] = useState();

    const fetchStakeContract = useContract(stakingRewardsAddress, stakingrewardsABI, true);
    const fetchStakeSL3Contract = useContract(stakingRewardsSL3Address, stakingrewardsABI, true);
    const fetchStakePGLContract = useContract(stakingRewardsPGLAddress, stakingrewardsABI, true);
    const fetchStakeSL3PGLContract = useContract(stakingRewardsSL3AvaxAddress, stakingrewardsABI, true);
    const fetchTokenContract = useContract(sfiAddress, sfiABI, true);
    const fetchSL3Contract = useContract(sl3Address, sl3ABI, true);
    const fetchSfiAvaxContract = useContract(sfiAvaxAddress, pglABI, true);
    const fetchSl3AvaxContract = useContract(sl3AvaxAddress, pglABI, true);

    const blockNumber = useBlockNumber().data;
    const triedToEagerConnect = useEagerConnect();

    
    useEffect(async () => {
        setSfiAvaxContract(await fetchSfiAvaxContract);
        setSL3AvaxContract(await fetchSl3AvaxContract);
        setStakeContract(await fetchStakeContract);
        setStakeSL3Contract(await fetchStakeSL3Contract);
        setStakePGLContract(await fetchStakePGLContract);
        setStakeSL3PGLContract(await fetchStakeSL3PGLContract);
        setTokenContract(await fetchTokenContract);
        setSL3Contract(await fetchSL3Contract);
    }, [
      fetchStakeContract, 
      fetchTokenContract, 
      fetchSfiAvaxContract, 
      fetchStakePGLContract, 
      fetchSl3AvaxContract, 
      fetchStakeSL3Contract, 
      fetchStakeSL3PGLContract, 
      fetchSL3Contract]);

    const graphetch = async () => {
        let rawPriceSFI;
        let rawPriceSL3;
        let ethPrice;
        let totalLiquiditySFI;
        let totalLiquiditySL3;

        await gql.request(QUERIES.TOKEN,{
        id: "0x1f1fe1ef06ab30a791d6357fdf0a7361b39b1537"
        })
        .then(res => {
          rawPriceSFI = res.token.derivedETH;
          totalLiquiditySFI = res.token.totalLiquidity;
        });

        await gql.request(QUERIES.TOKEN,{
          id: "0x2841a8a2ce98a9d21ad8c3b7fc481527569bd7bb"
          })
          .then(res => {
            rawPriceSL3 = res.token.derivedETH
            totalLiquiditySL3 = res.token.totalLiquidity
          });

        await gql.request(QUERIES.AVAXPRICE,{
        id: 1,
        block: await blockNumber,
        })
        .then(res => ethPrice = res.bundle.ethPrice);

        setPriceSFI(rawPriceSFI * ethPrice);
        setPriceSL3(rawPriceSL3 * ethPrice);
        setPriceAvax(ethPrice);
        setSfiTotalLiq(totalLiquiditySFI * (rawPriceSFI * ethPrice));
        setSl3TotalLiq(totalLiquiditySL3 * (rawPriceSL3 * ethPrice));
    }

    if(blockNumber){
        graphetch();
    }

    const setBals = async () => {

      // TO DO: Make this one multiuse function for SFI/SL3 
      const getTokenAndEarnedBalanced = async() => {

      }

      if(!sfiBalance && !earnedBalanceFromSFI && !sfiAvaxBalance){
          setSFIBalance(parseSFIBalance(await tokenContract.balanceOf(account)));
          setEarnedBalanceFromSFI(parseSFIBalance(await stakeContract.earned(account)));
          setEarnedBalanceFromPGL(parseSFIBalance(await stakePGLContract.earned(account)))
          setSfiAvaxBalance((await sfiAvaxContract.balanceOf(account) / 10**18));
      }

      setStakedSFIBalance(parseSFIBalance(await stakeContract.balanceOf(account)) * .98);
      setStakedPGLBalance(parseBalance(await stakePGLContract.balanceOf(account)));

      if(!sl3Balance && !earnedBalanceFromSL3 && !sl3AvaxBalance){
        setSL3Balance(parseSFIBalance(await sl3Contract.balanceOf(account)));
        setEarnedBalanceFromSL3(parseSFIBalance(await stakeSL3Contract.earned(account)));
        setEarnedBalanceFromSL3PGL(parseSFIBalance(await stakeSL3PGLContract.earned(account)))
        setSL3AvaxBalance((await sl3AvaxContract.balanceOf(account) / 10**18));
      }
    
      setStakedSL3Balance(parseSFIBalance(await stakeSL3Contract.balanceOf(account)) * .95);
      setStakedSL3PGLBalance(parseBalance(await stakeSL3PGLContract.balanceOf(account)));
  
      // Pretty sure this should be replaced with Vitalik's address to calc burn on mainnet... ?
      await tokenContract.balanceOf("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B")
      .then(balance =>
          tokenContract.decimals()
          .then((decimals) => {
              let burned = balance.div(10**decimals);
              setBurnedSFI(burned.toString());
          })
      );

      await sl3Contract.balanceOf("0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B")
      .then(balance =>
          tokenContract.decimals()
          .then((decimals) => {
              let burned = balance.div(10**decimals);
              setBurnedSL3(burned.toString());
          })
        );

      // Calc APR and TVL for SFI single asset pool

      const getAPRandTVLforRFI = async (
        contract, 
        tokenContract, 
        price, 
        burnedToken, 
        yourStaked, 
        addAprToState, 
        addTvlToState, 
        addYourTvlToState, 
        addMCToState) => { 

          const rewardRateSFI = await contract.rewardRate();
          const totalStakedSFI = await contract.totalSupply();
          const sfiTVL = ((await contract.totalSupply()) / 10**9) * price;
          const lSfiApr = ((rewardRateSFI.toString() * 10**9) * 31536000 * 100) / (totalStakedSFI.toString() * 10**9);
          const marketCap = (((await tokenContract.totalSupply()).toString() / 10**9) - burnedToken) * price;
          const yourTVL = ((yourStaked/totalStakedSFI) *  sfiTVL) * 10**9;          
          addAprToState(lSfiApr);
          addTvlToState(sfiTVL);
          addYourTvlToState(yourTVL);
          addMCToState(marketCap);
        }

      // Set SFI and SL3 stats
      getAPRandTVLforRFI(stakeContract, tokenContract, priceSFI, burnedSFI, stakedSFIBalance, setApr, setSfiTVL, setYourSFITVL, setSFIMC);
      getAPRandTVLforRFI(stakeSL3Contract, sl3Contract, priceSL3, burnedSL3, stakedSL3Balance, setSL3Apr, setSL3TVL, setYourSL3TVL, setSL3MC);

      // Calc APR and TVL for PGL pools

      const getAPRandTVLforPair = async (
        pairContract, 
        pairStakingContractAddress, 
        stakeContract, 
        priceToken,
        yourStaked,
        pairStakeContract,
        addPairTVLtoState,
        addYourTvlToState,
        addPairAPRtoState) => {
        const reserves = await pairContract.getReserves();

        const lockedSFI = reserves[0].toString();
        const lockedAvax = reserves[1].toString();
  
        const sfiAvaxTotalSupply = (await pairContract.totalSupply()).toString() / 10**18;
        const sfiAvaxStaked = (await pairContract.balanceOf(pairStakingContractAddress)) * 10**18;
        const lSfiAvaxApr = (((await stakeContract.rewardRate()).toString() * 31536000*100)/(2 * lockedSFI));

        const totalStakedSFIAvax = parseBalance(await pairStakeContract.totalSupply());
        const yourTVL = (yourStaked/sfiAvaxStaked) * totalStakedSFIAvax;
        const rewardRateSFIAvax = await pairStakeContract.rewardRate();        
  
        addPairTVLtoState((parseSFIBalance(lockedSFI) * priceToken) + (parseBalance(lockedAvax) * priceAvax)*(totalStakedSFIAvax * sfiAvaxTotalSupply))
        addYourTvlToState(yourTVL)
  
        addPairAPRtoState(lSfiAvaxApr);
      }

      getAPRandTVLforPair(
        sfiAvaxContract, 
        stakingRewardsPGLAddress, 
        stakePGLContract, 
        priceSFI, 
        stakedPGLBalance,
        stakeContract,
        setSfiAvaxTVL,
        setYourSfiAvaxTVL,
        setSFIAvaxApr);

      getAPRandTVLforPair(
        sl3AvaxContract,
        stakingRewardsSL3AvaxAddress,
        stakeSL3PGLContract,
        priceSL3,
        stakedSL3PGLBalance,
        stakeSL3Contract,
        setSL3AvaxTVL,
        setYourSL3AvaxTVL,
        setSL3AvaxApr
      )
    }

    if(tokenContract && sl3Contract && stakeContract && stakeSL3Contract){
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

    const handleGetReward = async (contract) => {
        await contract.getReward();
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
      <Account triedToEagerConnect={triedToEagerConnect} />
    <div className="banner">
      
     
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
        <p className="centerT">{priceSFI ? `$${priceSFI.toFixed(5)}` : "Loading"}</p>
        </div>
      </div>
      <div className="SFILiq">
        <p>
          SFI Liquidity
        </p>
        <div className="linebreakHome">
        </div>
        <div className="homebarbox">
          <p className="centerT">{sfiTotalLiq ? `$${parseInt(sfiTotalLiq).toFixed(2)}` : "Loading"}</p>
        </div>
      </div>
      <div className="SFIMC">
        <p>
          SFI Market Cap
        </p>
        <div className="linebreakHome">
        </div>
        <div className="homebarbox">
        <p className="centerT">{sfiMC ? `$${sfiMC.toFixed(2)}` : "Loading"}</p>
        </div>
      </div>
      <div className="SFIBurned">
        <p>
          SFI Burned
        </p>
        <div className="linebreakHome">
        </div>
        <div className="homebarbox">
        <p className="centerT">{burnedSFI ? burnedSFI : "Loading"}</p>
        </div>
      </div>
    </div>
    <div className="HomeSL3">
      <div className="SFIprice">
        <p>
          SL3 Price
        </p>
        <div className="linebreakHome">
        </div>
        <div className="homebarbox">
        <p className="centerT">{priceSL3 ? `$${priceSL3.toFixed(5)}` : "Loading"}</p>
        </div>
      </div>
      <div className="SFILiq">
        <p>
          SL3 Liquidity
        </p>
        <div className="linebreakHome">
        </div>
        <div className="homebarbox">
          <p className="centerT">{sl3TotalLiq ? `$${parseInt(sl3TotalLiq).toFixed(2)}` : "Loading"}</p>
        </div>
      </div>
      <div className="SFIMC">
        <p>
          SL3 Market Cap
        </p>
        <div className="linebreakHome">
        </div>
        <div className="homebarbox">
          <p className="centerT">{sl3MC ? `$${sl3MC.toFixed(2)}` : "Loading"}</p>
        </div>
      </div>

      <div className="SFIBurned">
        <p>
          SL3 Burned
        </p>
        <div className="linebreakHome">
        </div>
        <div className="homebarbox">
        <p className="centerT">{burnedSL3 ? burnedSL3 : "Loading"}</p>
        </div>
      </div>
    </div>
    <main className="Parent1">
      <div className="Stake1">
        <h1>Stake SFI</h1>

        <div className="APR-Earned">



          <p className="lowertextAPR">
            APR
          </p>
          <div className="APRprint">
          <p className="centerT">{apr ? apr.toFixed(2) + '%' : "Loading"}</p>
          </div>
          <div className="linebreak">
          </div>
          <p className="lowertextEarned">
            Earned SFI
          </p>
          <div className="Earnprint">
          <p className="centerT">{earnedBalanceFromSFI !== undefined ? parseInt(earnedBalanceFromSFI).toFixed(2) : "Loading"}</p>
          </div>
          <input className="bluebut2" type="submit" onClick={() => handleGetReward(stakeContract)} value="Claim" />
        </div>
        <div className="TVLs">
          <p className="lowertextTVL">
          Farm 
          <br/>
          TVL
          </p>
          <div className="TVLprint">
            <p className="centerT">{sfiTVL ? `$${sfiTVL.toFixed(2)}` : "Loading"}</p>
          </div>
          <div className="linebreak">
          </div>
          <p className="lowertextTVL2">
            Your
            <br/>
             TVL
            </p>
            <div className="TVLprint2">
              <p className="centerT">{yourSFITVL !== undefined ? `$${yourSFITVL.toFixed(4)}` : "Loading"}</p>              
            </div>
        </div>
        <div className="StakePGL">
          <p className="lowertextAPR">
            Available SFI:
          </p>
          <div className="availabletokens">
              <p className="centerT">{sfiBalance !== undefined ? parseInt(sfiBalance).toFixed() : "Loading"}</p>
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
        <p className="centerT">{stakedSFIBalance !== undefined ? stakedSFIBalance.toFixed(4) : "Loading"}</p>
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
            <p className="centerT">{sfiAvaxApr ? sfiAvaxApr.toFixed(2) + "%" : "Loading"}</p>
          </div>
          <div className="linebreak">
          </div>
          <p className="lowertextEarned">
            Earned SFI
          </p>
          <div className="Earnprint">
            <p className="centerT">{earnedBalanceFromPGL !== undefined ? parseInt(earnedBalanceFromPGL).toFixed(2) : "Loading"}</p>
          </div>
          <input className="bluebut2" type="submit" onClick={() => handleGetReward(stakePGLContract)} value="Claim" />
        </div>
        <div className="TVLs">
          <p className="lowertextTVL">
          Farm 
          <br/>
          TVL
          </p>
          <div className="TVLprint">
            <p className="centerT">{sfiAvaxTVL ? `$${sfiAvaxTVL.toFixed(2)}` : "Loading"}</p>
          </div>
          <div className="linebreak">
          </div>
          <p className="lowertextTVL2">
            Your
            <br/>
             TVL
            </p>
            <div className="TVLprint2">
              <p className="centerT">{yourSfiAvaxTVL !== undefined ? `$${yourSfiAvaxTVL.toFixed()}` : "Loading"}</p>              
            </div>
        </div>
        <div className="StakePGL">
          <p className="lowertextAPR">
            Available PGL:
          </p>
          <div className="availabletokens">
            <p className="centerT">{sfiAvaxBalance ? sfiAvaxBalance.toFixed(6) : "Loading"}</p>
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
                    <p className="centerT">{stakedPGLBalance !== undefined ? stakedPGLBalance : "Loading"}</p>
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
          handleWithdraw(amount, stakePGLContract, TOKEN_DECIMAL);}}>
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
    </main>
    <main className="Parent2">
      <div className="Stake3">
        <h1>Stake SL3</h1>
        <div className="APR-Earned">
          <p className="lowertextAPR">
            APR
          </p>
          <div className="APRprint">
            <p className="centerT">{sl3Apr !== undefined ? sl3Apr.toFixed(2) + '%' : "Loading"}</p>
          </div>
          <div className="linebreak">
          </div>
          <p className="lowertextEarned">
            Earned SFI
          </p>
          <div className="Earnprint">
          <p className="centerT">{earnedBalanceFromSL3 !== undefined ? parseInt(earnedBalanceFromSL3).toFixed(2) : "Loading"}</p>
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
            <p className="centerT">{sl3TVL ? `$${sl3TVL.toFixed(2)}` : "Loading"}</p>
          </div>
          <div className="linebreak">
          </div>
          <p className="lowertextTVL2">
            Your
            <br/>
             TVL
            </p>
            <div className="TVLprint2">
              <p className="centerT">{yourSL3TVL !== undefined ? `$${yourSL3TVL.toFixed()}` : "Loading"}</p>              
            </div>
        </div>
        <div className="StakePGL">
          <p className="lowertextAPR">
            Available SL3:
          </p>
          <div className="availabletokens">
          <p className="centerT">{sl3Balance !== undefined ? parseInt(sl3Balance).toFixed() : "Loading"}</p>
          </div>
          <div className="linebreak2">
          </div>
          <div>
            <p className="lowertext2">
              Stake:
            </p>
            <form
              className="Stakeform"
              onSubmit={(e) => {
              e.preventDefault();
              const target = e.target;
              const amount = target.amount.value;
              handleStake(amount, RFI_TOKEN_DECIMAL, sl3Contract, stakeSL3Contract)}}>
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
            Staked SL3:
        </p>
        <div className="stakedtokens">
          <p className="centerT">{stakedSL3Balance !== undefined ? stakedSL3Balance : "Loading"}</p>
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
              handleWithdraw(amount, stakeSL3Contract, RFI_TOKEN_DECIMAL);}}>
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

      <div className="Stake4">
        <h1>SL3-AVAX PGL</h1>

        <div className="APR-Earned">



          <p className="lowertextAPR">
            APR
          </p>
          <div className="APRprint">
            <p className="centerT">{sl3AvaxApr !== undefined ? sl3AvaxApr.toFixed(2) + "%" : "Loading"}</p>
          </div>
          <div className="linebreak">
          </div>
          <p className="lowertextEarned">
            Earned SFI
          </p>
          <div className="Earnprint">
            <p className="centerT">{earnedBalanceFromSL3PGL !== undefined ? parseInt(earnedBalanceFromSL3PGL).toFixed(2) : "Loading"}</p>            
          </div>
          <input className="bluebut2" type="submit" onClick={() => handleGetReward(stakeSL3PGLContract)} value="Claim" />
        </div>
        <div className="TVLs">
          <p className="lowertextTVL">
          Farm 
          <br/>
          TVL
          </p>
          <div className="TVLprint">
            <p className="centerT">{sl3AvaxTVL !== undefined ? `$${sl3AvaxTVL.toFixed(2)}` : "Loading"}</p>
          </div>
          <div className="linebreak">
          </div>
          <p className="lowertextTVL2">
            Your
            <br/>
             TVL
            </p>
            <div className="TVLprint2">
              <p className="centerT">{yourSL3AvaxTVL !== undefined ? `$${yourSL3AvaxTVL.toFixed()}` : "Loading"}</p>
            </div>
        </div>
        <div className="StakePGL">
          <p className="lowertextAPR">
            Available PGL:
          </p>
          <div className="availabletokens">
          <p className="centerT">{sl3AvaxBalance ? sl3AvaxBalance.toFixed(6) : "Loading"}</p>
          </div>
          <div className="linebreak2">
          </div>
          <div>
            <p className="lowertext2">
              Stake:
            </p>
            <form
                className="Stakeform"
                onSubmit={(e) => {
                e.preventDefault();
                const target = e.target;
                const amount = target.amount.value;
                handleStake(amount, TOKEN_DECIMAL, sl3AvaxContract, stakeSL3PGLContract)}}>
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
          <p className="centerT">{stakedSL3PGLBalance !== undefined ? stakedSL3PGLBalance : "Loading"}</p>
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
                handleWithdraw(amount, stakeSL3PGLContract, TOKEN_DECIMAL);}}>
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

    </main>

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