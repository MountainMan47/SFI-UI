import { useState, useEffect, useCallback } from 'react';
import { useWeb3React } from "@web3-react/core";
import { ethers } from 'ethers';
import useContract from "../hooks/useContract";
import BigNumber from 'bignumber.js';
import { RFI_TOKEN_DECIMAL, parseBalance, parseSFIBalance } from '../util';
import { getStakingRewardsAddress, getSfiAddress } from '../utils/addressHelpers.js';
import background from './CSS/ICE-background.png';
import icicles from "./CSS/Icicles.png";
import banner from "./CSS/IceBanner.png";
import '../Components/CSS/styles.css';
import useBlockNumber from "../hooks/useBlockNumber";

// import { AbiItem } from "web3-utils";

// Abis
import stakingrewardsABI from "../config/abi/stakingrewards.json";
import sfiABI from "../config/abi/sfi.json";

// Addresses
const stakingrewardsAddress = getStakingRewardsAddress();
const sfiAddress = getSfiAddress();

const GRAPH_URL = "https://api.thegraph.com/subgraphs/name/dasconnor/pangolin-dex";

const TOKEN = `
query Token($id: String) {
  token(id: $id){
    id
    symbol
    name
    decimals
    derivedETH
  }
}`;

const AVAXPRICE = `
query AVAXPrice($id: Int, $block: Int) {
  bundle(id: $id, block: {number: $block}) {
    ethPrice
  }
}
`;

async function request(query, variables = {}, url = GRAPH_URL) {
  const _ = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const {data} = await _.json();

  return data;
}

const Farm = () => {
    const { account } = useWeb3React();
    const [stakeContract, setStakeContract] = useState();
    const [tokenContract, setTokenContract] = useState();
    const [sfiBalance, setSFIBalance] = useState();
    const [earnedBalance, setEarnedBalance] = useState();
    const [stakedBalance, setStakedBalance] = useState();
    const [priceSFI, setPriceSFI] = useState();

    const fetchStakeContract = useContract(stakingrewardsAddress, stakingrewardsABI, true);
    const fetchTokenContract = useContract(sfiAddress, sfiABI, true);
    
    useEffect(async () => {
        setStakeContract(await fetchStakeContract);
        setTokenContract(await fetchTokenContract);
    }, [fetchStakeContract, fetchTokenContract]);
    
    const setBals = async () => {

        if(!sfiBalance && ! earnedBalance){
            setSFIBalance(parseSFIBalance(await tokenContract.balanceOf(account)));
            setEarnedBalance(parseSFIBalance(await stakeContract.earned(account)));
        }

        setStakedBalance(parseSFIBalance(await stakeContract.balanceOf(account)));
    }

    if(tokenContract && stakeContract){
        setBals();
    }

    console.log("stake contract", stakeContract);
    console.log("sfi contract", tokenContract);

    const blockNumber = useBlockNumber().data


  let rawPriceSFI;
  let ethPrice;

  const graphetch = async () => {
    // const blockNumber = library ? await library.getBlockNumber() : 1788148;

    await request(TOKEN,{
      id: "0x1f1fe1ef06ab30a791d6357fdf0a7361b39b1537"
    })
    .then(res => rawPriceSFI = res.token.derivedETH);

    await request(AVAXPRICE,{
      id: 1,
      block: await blockNumber,
    })
    .then(res => ethPrice = res.bundle.ethPrice);

    setPriceSFI(rawPriceSFI * ethPrice);

    console.log("Price:", rawPriceSFI * ethPrice, "SFI:", priceSFI, "AVAX:", ethPrice, "Blocknumber:", blockNumber);

  }

  if(blockNumber){
    graphetch();
  }

    const handleStake = async (amount) => {
        // await tokenContract.approve(stakeContract.address, new BigNumber(amount).times(RFI_TOKEN_DECIMAL).toString());
        // await stakeContract.stake(new BigNumber(amount).times(RFI_TOKEN_DECIMAL).toString());

        const formattedAmount = new BigNumber(amount).times(RFI_TOKEN_DECIMAL).toString();
        const approvalTxn = await tokenContract.approve(stakeContract.address, formattedAmount);
        console.log(`Approving ${amount} SFI`);
        await approvalTxn.wait();
        await stakeContract.stake(formattedAmount);
        console.log(`Staked ${amount} SFI`);

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
            <p>Price SFI: {priceSFI ? `$${priceSFI}` : "Loading"}</p>
            <div className="Stake1">
            <h1>Stake SFI</h1>
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
                        {earnedBalance !== undefined ? earnedBalance : "Loading"}
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
                        {stakedBalance !== undefined ? stakedBalance : "Loading"}
                        <br/><br/>
                        <form
                            onSubmit={(e) => {
                            e.preventDefault();
                            const target = e.target;
                            const amount = target.amount.value;
                            handleStake(amount);
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