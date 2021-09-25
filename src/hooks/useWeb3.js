import { useEffect, useState, useRef } from 'react'
import Web3 from 'web3'
import { useWeb3React } from '@web3-react/core'

/**
 * Provides a web3 instance using the provider provided by useWallet
 * with a fallback of an httpProver
 * Recreate web3 instance only if the provider change
 */

const useWeb3 = () => {
  const { library } = useWeb3React()
  const refEth = useRef(library)
  const [web3, setweb3] = useState(new Web3(library))

  useEffect(() => {
    if (library !== refEth.current) {
      setweb3(new Web3(library))
      refEth.current = library
    }
  }, [library])

  return web3
}

// const useWeb3 = async () => {
//   await window.web3.currentProvider.enable();
//   const web3 = new Web3(window.web3.currentProvider);

//   return web3;
// }


export default useWeb3
