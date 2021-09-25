import { verifyMessage } from "@ethersproject/wallet";
import { useWeb3React } from "@web3-react/core";
import { BigNumber } from "@ethersproject/bignumber";
import { useEffect, useState } from "react";
import Account from "./Components/Account";
import Pool from "./Components/Pool";
import Farm from './Components/Farm';
import ETHBalance from "./Components/ETHBalance";
import useEagerConnect from "./hooks/useEagerConnect";
import { createClient } from 'url';

export default function Home() {
  const { account, library } = useWeb3React();

  const triedToEagerConnect = useEagerConnect();

  const isConnected = typeof account === "string" && !!library;

  return (
    <div>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css"
          integrity="sha384-KyZXEAg3QhqLMpG8r+8fhAXLRk2vvoC2f3B09zVXn8CA5QIVfZOJ3BCsw2P0p/We"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href="./Components/CSS/styles.css" />
      <header>
        <nav>
          <Account triedToEagerConnect={triedToEagerConnect} />
        </nav>
      </header>
      <main>
        {/* <h1>
          SFI Staking Demo
        </h1>
        {isConnected && (
          <section>
            <ETHBalance />
            <button onClick={handleSign}>Personal Sign</button>
          </section>
        )} */}
        <Farm />
      </main>
    </div>
  );
}
