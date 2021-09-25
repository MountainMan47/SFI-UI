import { Contract } from "@ethersproject/contracts";
import { ethers } from 'ethers';
import { useWeb3React } from "@web3-react/core";
import { useMemo } from "react";

export default async function useContract(address, ABI, withSigner = false) {
  const { library, account } = useWeb3React();

  // console.log("Libby", !!library ? library.getSigner(account)._address : "waiting for lib");
  const contract =  useMemo(
    () =>
      !!address && !!ABI && !!library
        ? new Contract(
            address,
            ABI,
            withSigner ? library.getSigner().connectUnchecked() : library
          )
        : undefined,
    [address, ABI, withSigner, library, account]
  );

  return contract;
}
