import MetaMaskOnboarding from "@metamask/onboarding";
import { useWeb3React } from "@web3-react/core";
import { UserRejectedRequestError } from "@web3-react/injected-connector";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { injected } from "../connectors";
import useENSName from "../hooks/useENSName";
import { formatEtherscanLink, shortenHex } from "../util";

const Account = ({ triedToEagerConnect }) => {
  const {
    active,
    error,
    activate,
    chainId,
    account,
    setError,
  } = useWeb3React();
  
  // initialize metamask onboarding
  const onboarding = useRef();

  useLayoutEffect(() => {
    onboarding.current = new MetaMaskOnboarding();
  }, []);

  // manage connecting state for injected connector
  const [connecting, setConnecting] = useState(false);
  useEffect(() => {
    if (active || error) {
      setConnecting(false);
      onboarding.current?.stopOnboarding();
    }
  }, [active, error]);

  const RenderConnectButton = () => {
    const hasMetaMaskOrWeb3Available =
    MetaMaskOnboarding.isMetaMaskInstalled() ||
    window?.ethereum ||
    window?.web3;

  return (
    <div>
    {hasMetaMaskOrWeb3Available ? (
      <button
        className="metabut"
        onClick={() => {
          setConnecting(true);

          activate(injected, undefined, true).catch((error) => {
            // ignore the error if it's a user rejected request
            if (error instanceof UserRejectedRequestError) {
              setConnecting(false);
            } else {
              setError(error);
            }
          });
        }}
      >
        {MetaMaskOnboarding.isMetaMaskInstalled()
          ? "Connect"
          : "Connect"}
      </button>
    ) : (
      <button onClick={() => onboarding.current?.startOnboarding()}>
        Install Metamask
      </button>
    )}
  </div>
  );
  }

  const ENSName = useENSName(account);

  if (error) {
    return (
    <>
      <RenderConnectButton />
      <p>Make sure you're connected to FUJI</p>
    </>
    )
  }

  if (!triedToEagerConnect) {
    return null;
  }

  if (typeof account !== "string") {
    const hasMetaMaskOrWeb3Available =
      MetaMaskOnboarding.isMetaMaskInstalled() ||
      window?.ethereum ||
      window?.web3;

    return <RenderConnectButton />;
  }

  return (
    // <a
    //   {...{
    //     href: formatEtherscanLink("Account", [chainId, account]),
    //     target: "_blank",
    //     rel: "noopener noreferrer",
    //   }}
    // >
    //   {ENSName || `${shortenHex(account, 4)}`}
    // </a>
    <button className="metabut">{`${shortenHex(account, 4)}`}</button>
  );
};

export default Account;
