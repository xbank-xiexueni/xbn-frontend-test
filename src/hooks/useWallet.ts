import { useDisclosure } from '@chakra-ui/react'
import { useCallback, useContext } from 'react'

import { TransactionContext } from '@/context/TransactionContext'

const useWallet = () => {
  const { currentAccount, isConnected, ...rest } =
    useContext(TransactionContext)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const interceptFn = useCallback(
    async (fn?: () => void) => {
      // 是否连接账户
      // if (!isConnected) {
      //   if (!!connector) {
      //     connectWallet({ connector })
      //   } else {
      //     openConnectWalletModal()
      //   }
      // }
      if (!isConnected) {
        onOpen()
        return
      }

      if (fn) {
        fn()
      }
    },
    [isConnected, onOpen],
  )

  const handleOpenEtherscan = useCallback(() => {
    interceptFn(async () => {
      window.open(
        `${process.env.REACT_APP_TARGET_CHAIN_BASE_URL}/address/${currentAccount?.address
        }`,
      )
    })
  }, [interceptFn, currentAccount])
  return {
    isOpen,
    onOpen,
    onClose,
    interceptFn,
    currentAccount,
    handleOpenEtherscan,
    isConnected,
    ...rest,
  }
}

export default useWallet
