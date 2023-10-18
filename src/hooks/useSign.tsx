import useDebounceFn from 'ahooks/lib/useDebounceFn'
import useRequest from 'ahooks/lib/useRequest'
import dayjs from 'dayjs'
import { useCallback } from 'react'
import { useSignMessage } from 'wagmi'

import { apiPostAuthChallenge, apiPostAuthLogin } from 'api/user'

import useWallet from './useWallet'

const useSign = () => {
  const { currentAccount } = useWallet()
  const { signMessageAsync } = useSignMessage()

  const signAuthPromise = useCallback(
    async (address: string) => {
      try {
        if (
          currentAccount &&
          currentAccount?.expires &&
          currentAccount.address === address
        ) {
          const expiresTimes = dayjs(currentAccount.expires).unix()
          const currentTime = dayjs().unix()
          if (expiresTimes > currentTime) return undefined
        }
        const messageToSign = await apiPostAuthChallenge(address)

        const message = messageToSign?.login_message

        // const msg = strToHex(message)

        const signature = await signMessageAsync({
          message,
        })

        const tokenData = await apiPostAuthLogin({
          address,
          message,
          signature,
        })
        // if (!tokenData) return
        // handleSetCurrentAccount({
        //   address: address,
        //   ...tokenData,
        // })
        // console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
        return tokenData
      } catch (e: any) {
        console.log(e?.cause?.message, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
      }
    },
    [currentAccount, signMessageAsync],
  )

  const {
    runAsync: handleSign,
    loading: signLoading,
    ...rest
  } = useRequest(signAuthPromise, {
    manual: true,
    debounceWait: 1000,
  })

  const { run: handleSignDebounce } = useDebounceFn(handleSign, {
    wait: 1000,
  })

  return {
    runAsync: handleSign,
    loading: signLoading,
    debounceRunAsync: handleSignDebounce,
    ...rest,
  }
}

export default useSign
