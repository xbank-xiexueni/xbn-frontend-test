import { useDisclosure } from '@chakra-ui/react'
import useLocalStorageState from 'ahooks/lib/useLocalStorageState'
import useRequest from 'ahooks/lib/useRequest'
import dayjs from 'dayjs'
import compact from 'lodash-es/compact'
import isEmpty from 'lodash-es/isEmpty'
import {
  useEffect,
  useState,
  createContext,
  type ReactElement,
  useCallback,
  useMemo,
} from 'react'
import {
  useAccount,
  useConnect,
  useNetwork,
  useDisconnect,
  useBalance,
  useContractRead,
  type Connector,
} from 'wagmi'

import { apiGetActiveCollection, apiGetPools } from '@/api'
import type { NoticeItemType } from '@/components/notice-slider/NoticeSlider'
import {
  ACCOUNT_MODAL_TAB_KEY,
  WETH_CONTRACT_ABI,
  WETH_CONTRACT_ADDRESS,
  XBANK_CONTRACT_ADDRESS,
  COLLECTION_STATUS_ENUM,
} from '@/constants'
import {
  useNftCollectionsByContractAddressesQuery,
  useNotice,
  useSign,
} from '@/hooks'

export const TransactionContext = createContext<{
  connectWallet: (config: { connector?: Connector; chainId?: number }) => void
  currentAccount?: AccountType
  setCurrentAccount: (a?: AccountType) => void
  isConnected: boolean
  connectChanging: boolean
  handleDisconnect: () => void
  collectionList: XBNCollectionItemType[]
  moreCollectionList: CollectionListItemType[]
  collectionLoading: boolean
  noticeConfig: {
    data?: NoticeItemType[]
    refresh: () => void
  }
  accountModalConfig: {
    isOpen: boolean
    onToggle: () => void
    onClose: () => void
    onOpen: (v: ACCOUNT_MODAL_TAB_KEY) => void
    accountModalTab: ACCOUNT_MODAL_TAB_KEY
  }
  myPoolsConfig: {
    data: PoolsListItemType[]
    loading: boolean
    runAsync: () => Promise<PoolsListItemType[]>
    refresh: () => void
  }
  accountConfig: {
    ethConfig: {
      data: string
      loading: boolean
      refreshAsync: (options?: any) => Promise<any>
    }
    wethConfig: {
      data: string
      loading: boolean
      refreshAsync: (options?: any) => Promise<any>
    }
    allowanceConfig: {
      data: string
      loading: boolean
      refreshAsync: (options?: any) => Promise<any>
    }
  }
  runChainCheckAsync: (id?: number) => Promise<boolean>
  chainEnable: boolean
}>({
  connectWallet: async ({}) => {},
  currentAccount: undefined,
  setCurrentAccount: () => undefined,
  handleDisconnect: () => {},
  isConnected: false,
  connectChanging: false,
  collectionList: [],
  moreCollectionList: [],
  collectionLoading: false,
  noticeConfig: {
    data: [],
    refresh: () => undefined,
  },
  accountModalConfig: {
    isOpen: false,
    onToggle: () => undefined,
    onClose: () => undefined,
    onOpen: () => undefined,
    accountModalTab: ACCOUNT_MODAL_TAB_KEY.AVAILABLE_FUNDS_TAB,
  },
  myPoolsConfig: {
    data: [],
    loading: false,
    runAsync: async () => [],
    refresh: () => undefined,
  },
  accountConfig: {
    ethConfig: {
      data: '',
      loading: false,
      refreshAsync: async () => '',
    },
    wethConfig: {
      data: '',
      loading: false,
      refreshAsync: async () => '',
    },
    allowanceConfig: {
      data: '',
      loading: false,
      refreshAsync: async () => '',
    },
  },
  runChainCheckAsync: async () => false,
  chainEnable: false,
})

export const TransactionsProvider = ({
  children,
}: {
  children: ReactElement
}) => {
  // collection 提取到外层
  const [accountModalTab, setAccountModalTab] = useState<ACCOUNT_MODAL_TAB_KEY>(
    ACCOUNT_MODAL_TAB_KEY.AVAILABLE_FUNDS_TAB,
  )
  const {
    isOpen: accountModalVisible,
    onToggle: toggleAccountModal,
    onClose: closeModalAccount,
    onOpen: openAccountModal,
  } = useDisclosure()

  const [collectionAddressArr, setCollectionAddressArr] = useState<string[]>([])
  const { loading, data: xbnCollectionData } = useRequest(
    apiGetActiveCollection,
    {
      debounceWait: 100,
      retryCount: 5,
      onSuccess: (data) => {
        setCollectionAddressArr(data.map((i) => i.contract_addr))
      },
    },
  )

  const { loading: collectionLoading, data: collectionData } =
    useNftCollectionsByContractAddressesQuery({
      variables: {
        assetContractAddresses: collectionAddressArr,
      },
      skip: isEmpty(collectionAddressArr),
    })
  const moreCollectionList = useMemo(() => {
    return xbnCollectionData?.filter((x) => {
      return x.release_status !== COLLECTION_STATUS_ENUM.RELEASED
    })
  }, [xbnCollectionData])

  const collectionList = useMemo(() =>
    // collectionAddressArr.map((item) => {
    //   return {
    //     contractAddress: item,
    //     nftCollection:
    //       collectionData?.nftCollectionsByContractAddresses?.find(
    //         (i) => i.contractAddress.toLowerCase() === item.toLowerCase(),
    //       )?.nftCollection,
    //   }
    // }),
    {
      const collectionFromGraphQL =
        collectionData?.nftCollectionsByContractAddresses || []
      const res = xbnCollectionData?.map((item) => {
        const current = collectionFromGraphQL?.find(
          (i) =>
            i.contractAddress?.toLowerCase() ===
            item.contract_addr?.toLowerCase(),
        )
        if (!current) return
        return {
          ...current,
          ...item,
          priority: item?.priority || 0,
          tags: item?.tags || [],
        }
      })
      return compact(res)
    }, [collectionData, xbnCollectionData])

  const [currentAccount, setCurrentAccount] =
    useLocalStorageState<AccountType>('connect-account')

  const { debounceRunAsync: handleSignDebounce, loading: signLoading } =
    useSign()

  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()
  const { chain } = useNetwork()
  const {
    isConnected: isWagmiConnect,
    connector: activeConnector,
    address,
  } = useAccount({})

  const isConnected = useMemo(() => {
    if (!isWagmiConnect) return false
    if (!currentAccount) return false
    if (isEmpty(currentAccount)) return false
    if (!currentAccount.token || !currentAccount.address) return false

    return dayjs(currentAccount.expires).isAfter(dayjs())
  }, [currentAccount, isWagmiConnect])

  // const connectLoading = useMemo(() => {
  //   return (
  //     signLoading || _connectLoading || switchLoading || isDisconnectLoading
  //   )
  // }, [signLoading, _connectLoading, switchLoading, isDisconnectLoading])

  const { data: noticeData, refresh: refreshNotice } = useNotice(
    currentAccount?.address || '',
    {
      ready: !!currentAccount,
    },
  )

  const handleDisconnect = useCallback(() => {
    disconnectAsync()
    setCurrentAccount(undefined)
  }, [setCurrentAccount, disconnectAsync])

  const connectWallet = useCallback(
    async (args: { connector?: Connector; chainId?: number }) => {
      try {
        let currentAddress = address
        let currentChainId = chain?.id
        if (
          !activeConnector ||
          activeConnector?.id !== args?.connector?.id ||
          !address ||
          args?.connector?.id === 'walletConnect'
        ) {
          await disconnectAsync()
          const { account, chain: currentChain } = await connectAsync({
            ...args,
          })
          console.log(account, 'currentAddress', chain, currentChain)

          currentAddress = account
          currentChainId = currentChain.id
        }

        if (
          !!currentAddress &&
          currentChainId === Number(process.env.REACT_APP_TARGET_CHAIN_ID)
        ) {
          console.log('11111111111111111', currentAddress)
          const res = await handleSignDebounce(currentAddress)
          setCurrentAccount({
            ...res,
            address: currentAddress,
          } as AccountType)
          // getAllTransactions();
        } else {
          setCurrentAccount(undefined)
        }
      } catch (error: any) {
        console.log(
          '🚀 ~ file: TransactionContext.tsx:342 ~ error:',
          error.cause,
        )
      }
    },
    [
      setCurrentAccount,
      handleSignDebounce,
      activeConnector,
      address,
      disconnectAsync,
      connectAsync,
      chain,
    ],
  )

  const { data: chainEnable, runAsync: runChainCheckAsync } = useRequest(
    async (currentChainId) =>
      (currentChainId == process.env.REACT_APP_TARGET_CHAIN_ID) as boolean,
    {},
  )

  useEffect(() => {
    runChainCheckAsync(chain?.id)
  }, [chain, runChainCheckAsync])

  const {
    loading: myPoolsLoading,
    data: myPools,
    runAsync: runMyPoolsAsync,
    refresh: refreshMyPools,
  } = useRequest(
    () =>
      apiGetPools({
        owner: currentAccount?.address,
      }),
    {
      ready: isConnected && !!chainEnable,
      debounceWait: 500,
      refreshDeps: [currentAccount?.address, chainEnable],
      // lending-reminder onRefresh
      manual: true,
    },
  )

  const {
    data: ethData,
    isRefetching: isEthRefetch,
    isLoading: isEthLoading,
    refetch: refreshEthData,
  } = useBalance({
    address: currentAccount?.address,
    chainId: Number(process.env.REACT_APP_TARGET_CHAIN_ID),
    enabled: chainEnable && !!currentAccount?.address,
  })
  const ethLoading = useMemo(() => {
    return isEthRefetch || isEthLoading
  }, [isEthRefetch, isEthLoading])

  const {
    data: wethData,
    isRefetching: isWethRefetch,
    isLoading: isWethLoading,
    refetch: refreshWethData,
  } = useContractRead({
    address: WETH_CONTRACT_ADDRESS,
    abi: [WETH_CONTRACT_ABI.find((i) => i.name === 'balanceOf')],
    functionName: isConnected ? 'balanceOf' : undefined,
    enabled: isConnected,
    args: [currentAccount?.address as `0x${string}`],
    chainId: Number(process.env.REACT_APP_TARGET_CHAIN_ID),
  })

  const wethLoading = useMemo(() => {
    return isWethLoading || isWethRefetch
  }, [isWethLoading, isWethRefetch])

  const {
    data: allowanceData,
    isRefetching: isAllowanceRefetch,
    isLoading: isAllowanceLoading,
    refetch: refreshAllowanceData,
  } = useContractRead({
    address: WETH_CONTRACT_ADDRESS,
    abi: [WETH_CONTRACT_ABI.find((i) => i.name === 'allowance')],
    functionName: isConnected ? 'allowance' : undefined,
    enabled: isConnected,
    args: [
      currentAccount?.address as `0x${string}`,
      XBANK_CONTRACT_ADDRESS as `0x${string}`,
    ],
    chainId: Number(process.env.REACT_APP_TARGET_CHAIN_ID),
  })

  const allowanceLoading = useMemo(() => {
    return isAllowanceRefetch || isAllowanceLoading
  }, [isAllowanceRefetch, isAllowanceLoading])

  const _myPools = useMemo(() => {
    if (!currentAccount?.address || !chainEnable) return []
    return myPools || []
  }, [currentAccount, chainEnable, myPools])

  return (
    <TransactionContext.Provider
      value={{
        myPoolsConfig: {
          data: _myPools,
          loading: myPoolsLoading,
          runAsync: runMyPoolsAsync,
          refresh: refreshMyPools,
        },
        // transactionCount,
        connectWallet,
        // transactions,
        currentAccount,
        setCurrentAccount,
        // isLoading,
        // sendTransaction,
        // handleChange,
        // formData,
        handleDisconnect,
        // @ts-ignore
        collectionList: collectionList as CollectionItemType[],
        moreCollectionList:
          (moreCollectionList as CollectionListItemType[]) || [],
        collectionLoading: loading || collectionLoading,
        noticeConfig: {
          data: noticeData,
          refresh: refreshNotice,
        },
        isConnected,
        connectChanging: signLoading,
        accountModalConfig: {
          isOpen: accountModalVisible,
          onToggle: toggleAccountModal,
          onOpen: (arg: ACCOUNT_MODAL_TAB_KEY) => {
            setAccountModalTab(arg)
            openAccountModal()
          },
          onClose: () => {
            setAccountModalTab(ACCOUNT_MODAL_TAB_KEY.AVAILABLE_FUNDS_TAB)
            closeModalAccount()
          },
          accountModalTab,
        },
        runChainCheckAsync,
        chainEnable: !!chainEnable,
        accountConfig: {
          ethConfig: {
            data: ethData?.value?.toString() || '',
            loading: ethLoading,
            refreshAsync: refreshEthData,
          },
          wethConfig: {
            data: wethData?.toString() || '',
            loading: wethLoading,
            refreshAsync: refreshWethData,
          },
          allowanceConfig: {
            data: allowanceData?.toString() || '',
            loading: allowanceLoading,
            refreshAsync: refreshAllowanceData,
          },
        },
      }}>
      {children}
    </TransactionContext.Provider>
  )
}
