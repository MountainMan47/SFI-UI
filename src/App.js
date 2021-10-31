import { verifyMessage } from "@ethersproject/wallet";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "@ethersproject/bignumber";
import { useEffect, useState } from "react";
import Account from "./Components/Account";
import Pool from "./Components/Pool";
import Farm from './Components/NewFarm';
import Launch from './Components/Launch';
import ETHBalance from "./Components/ETHBalance";
import useEagerConnect from "./hooks/useEagerConnect";
import { createClient } from 'url';

export default function Home() {
  const { account, library } = useWeb3React();
  const [locked, setLocked] = useState("true");

  const triedToEagerConnect = useEagerConnect();

  const isConnected = typeof account === "string" && !!library;

  const unlock = () => {
    setLocked("false");
  }

  return (
    <div>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css"
          integrity="sha384-KyZXEAg3QhqLMpG8r+8fhAXLRk2vvoC2f3B09zVXn8CA5QIVfZOJ3BCsw2P0p/We"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href="./Components/CSS/styles.css" />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-U1DAWAznBHeqEIlVSCgzq+c9gqGAJn5c/t99JyeKa9xxaYpSvHU5awsuZVVFIhvj" crossOrigin="anonymous" />
      <main>
        {locked === "true"
          ? <Launch unlock={unlock} />
          : <Farm />
        }
      </main>
    </div>
  );
}
