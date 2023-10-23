import {
  Button,
  Flex,
  Text,
  type ButtonProps,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  PopoverArrow,
  Image,
  useToast,
  Box,
} from '@chakra-ui/react'
import { getContract, getWalletClient } from '@wagmi/core'
import useRequest from 'ahooks/lib/useRequest'
import BigNumber from 'bignumber.js'
import {
  useCallback,
  useState,
  useMemo,
  type FunctionComponent,
  useEffect,
} from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useFeeData,
  useNetwork,
  useWaitForTransaction,
  useContractWrite,
  useSwitchNetwork,
} from 'wagmi'

import ImgStyledArrow from '@/assets/icon-styled-arrow.png'
import {
  ACCOUNT_MODAL_TAB_KEY,
  WETH_CONTRACT_ABI,
  WETH_CONTRACT_ADDRESS,
  XBANK_CONTRACT_ADDRESS,
} from '@/constants'
import { useWallet } from '@/hooks'
import UpdatePoolAmountButton from '@/pages/lending/components/UpdatePoolAmountButton'
import { formatFloat, formatBalance, formatWagmiErrorMsg } from '@/utils/format'
import { eth2Wei, wei2Eth } from '@/utils/unit-conversion'

import CustomNumberInput from '../custom-number-input/CustomNumberInput'
import ImageWithFallback from '../image-with-fallback/ImageWithFallback'
import LoadingComponent from '../loading/LoadingComponent'
import SvgComponent from '../svg-component/SvgComponent'
import TooltipComponent from '../tooltip-component/TooltipComponent'

const EDIT_SVG = (
  <svg
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z'
      fill='#EBEBFF'
    />
    <path
      d='M14.2295 7.29124C14.9236 6.57811 16.049 6.57811 16.7431 7.29124V7.29124C17.4372 8.00437 17.4372 9.16058 16.7431 9.87372L16.5636 10.0582L14.05 7.4757L14.2295 7.29124Z'
      stroke='#0000FF'
      strokeLinejoin='round'
    />
    <path
      d='M14.0498 7.47559L16.5634 10.0581L10.4063 16.3839L7.7642 16.5159L7.89275 13.8014L14.0498 7.47559Z'
      stroke='#0000FF'
      strokeLinejoin='round'
    />
    <path
      d='M6 18H17.172'
      stroke='#0000FF'
      strokeLinecap='round'
    />
  </svg>
)
const BUTTON_PROPS: ButtonProps = {
  lineHeight: 1,
  flexWrap: 'wrap',
  p: '8px',
  h: '50px',
  justifyContent: 'start',
  flex: 1,
  borderRadius: 4,
  _hover: {
    background:
      'linear-gradient(0deg, #FFF 0%, #FFF 100%), linear-gradient(136deg, #638FFF 0%, #AFDCFF 100%), linear-gradient(192deg, #B3B3FF 0%, #F0F0FF 100%)',
  },
  _active: {
    background:
      'linear-gradient(0deg, #FFF 0%, #FFF 100%), linear-gradient(136deg, #638FFF 0%, #AFDCFF 100%), linear-gradient(192deg, #B3B3FF 0%, #F0F0FF 100%)',
  },
  background:
    'linear-gradient(0deg, #FFF 0%, #FFF 100%), linear-gradient(136deg, #638FFF 0%, #AFDCFF 100%), linear-gradient(192deg, #B3B3FF 0%, #F0F0FF 100%)',
  boxShadow: 'var(--chakra-shadows-default)',
}

const PRIORITY_FEE = BigNumber(1.5).multipliedBy(BigNumber(10).pow(9))

enum SWAP_DIRECTION {
  ETH2WETH,
  WETH2Eth,
}

const MAX_POOL_LENGTH = 4

const AccountModal: FunctionComponent<ButtonProps> = (p) => {
  const navigate = useNavigate()
  const { chain } = useNetwork()
  const [swapValue, setSwapValue] = useState<string>('')
  const [swapDirection, setSwapDirection] = useState<SWAP_DIRECTION>(
    SWAP_DIRECTION.ETH2WETH,
  )
  const { switchNetworkAsync: handleSwitchNetwork } = useSwitchNetwork({
    chainId: Number(process.env.REACT_APP_TARGET_CHAIN_ID),
  })

  const toast = useToast()
  const {
    isConnected,
    collectionList,
    accountModalConfig: {
      isOpen,
      onClose,
      onToggle,
      onOpen,
      accountModalTab = ACCOUNT_MODAL_TAB_KEY.AVAILABLE_FUNDS_TAB,
    },
    myPoolsConfig: {
      data: pools,
      loading: poolsLoading,
      refresh: refreshPools,
    },
    runChainCheckAsync,
    chainEnable,
    accountConfig: {
      ethConfig: {
        data: ethData,
        loading: ethLoading,
        refreshAsync: refreshEthData,
      },
      wethConfig: {
        data: wethData,
        loading: wethLoading,
        refreshAsync: refreshWethData,
      },
      allowanceConfig: {
        data: allowanceData,
        loading: allowanceLoading,
        refreshAsync: refreshAllowanceData,
      },
    },
  } = useWallet()

  const fetchEstimatedGas: () => Promise<string> = useCallback(async () => {
    const walletClient = await getWalletClient()

    const contract = getContract({
      address: WETH_CONTRACT_ADDRESS,
      abi: WETH_CONTRACT_ABI,
      walletClient,
    })
    return contract.estimateGas.deposit([], {
      value: eth2Wei(0)?.toString(),
    })
  }, [])

  const poolList = useMemo(() => {
    if (!pools) return
    if (!pools?.length) return []
    return pools
      .slice(0, MAX_POOL_LENGTH)
      ?.map(({ collateral_contract, ...rest }) => {
        const nftCollection = collectionList.find(
          (i: any) =>
            i.contractAddress.toLowerCase() ===
            collateral_contract.toLowerCase(),
        )?.nftCollection
        return {
          ...rest,
          collateral_contract,
          nftCollection,
        }
      })
  }, [pools, collectionList])

  // 第二个 tab
  const {
    data: gasData,
    loading: gasLoading,
    refreshAsync: refreshGasAsync,
  } = useRequest(fetchEstimatedGas, {
    ready: accountModalTab === ACCOUNT_MODAL_TAB_KEY.SWAP_TAB && isOpen,
  })

  const {
    data: feeData,
    isLoading: isFeeDataLoading,
    refetch: refreshBaseFeeAsync,
    isRefetching: isFeeDataRefetching,
  } = useFeeData({
    chainId: process.env.REACT_APP_TARGET_CHAIN_ID,
    watch: true,
    enabled: accountModalTab === ACCOUNT_MODAL_TAB_KEY.SWAP_TAB && isOpen,
  })
  const baseFeeLoading = useMemo(() => {
    return isFeeDataLoading || isFeeDataRefetching
  }, [isFeeDataLoading, isFeeDataRefetching])

  const {
    writeAsync: runApproveAsync,
    data: approveData,
    isLoading: isWriteApproveLoading,
  } = useContractWrite({
    address: WETH_CONTRACT_ADDRESS,
    abi: [WETH_CONTRACT_ABI.find((i) => i.name === 'approve')],
    functionName: 'approve',
    args: [
      XBANK_CONTRACT_ADDRESS as `0x${string}`,
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    ],
    onError: (err: any) => {
      toast({
        status: 'error',
        title: formatWagmiErrorMsg(err?.cause?.message),
        duration: 3000,
      })
    },
  })
  const { isLoading: isWaitApproveLoading } = useWaitForTransaction({
    hash: approveData?.hash,
    onSuccess() {
      toast({
        status: 'success',
        title: 'approve successfully.',
      })
      refreshAllowanceData()
    },
  })
  const approveLoading = useMemo(() => {
    return isWaitApproveLoading || isWriteApproveLoading
  }, [isWaitApproveLoading, isWriteApproveLoading])

  const estimateUseGasFee = useMemo(() => {
    const baseFeeData = feeData?.lastBaseFeePerGas?.toString()

    // （( 基本费 * 2 ) + 优先费 ）x 所用 Gas 单位数 * 1.5?? ）
    if (gasData === undefined || baseFeeData === undefined) return
    const pre = BigNumber(baseFeeData).multipliedBy(2).plus(PRIORITY_FEE)
    return pre.multipliedBy(gasData).multipliedBy(10)
  }, [gasData, feeData])

  const maxEth = useMemo(() => {
    if (ethData === undefined || estimateUseGasFee === undefined) return

    const currentEth = wei2Eth(ethData)

    const currentFeeEth = wei2Eth(estimateUseGasFee)

    if (currentEth === undefined || currentFeeEth === undefined) return

    return BigNumber(
      BigNumber(currentEth)
        .minus(currentFeeEth)
        .toFixed(4, BigNumber.ROUND_FLOOR),
    )
  }, [ethData, estimateUseGasFee])

  const maxWeth = useMemo(() => {
    if (wethData === undefined) return
    const wethBalance = wei2Eth(wethData)
    if (!wethBalance) return BigNumber(0)
    return BigNumber(wethBalance)
  }, [wethData])
  const maxSwapValue = useMemo(() => {
    if (swapDirection === SWAP_DIRECTION.ETH2WETH) {
      return formatFloat(maxEth, 4, true)
    }
    if (swapDirection === SWAP_DIRECTION.WETH2Eth) {
      return formatFloat(maxWeth, 4, true)
    }
  }, [maxEth, maxWeth, swapDirection])

  const swapBtnStatus = useMemo(() => {
    if (!swapValue) {
      return {
        isDisabled: true,
        title: `Enter ${
          swapDirection === SWAP_DIRECTION.ETH2WETH ? 'ETH' : 'WETH'
        } amount`,
      }
    }
    if (swapDirection === SWAP_DIRECTION.ETH2WETH) {
      if (!swapValue) {
        return {
          isDisabled: true,
          title: `Enter ETH amount`,
        }
      }
      if (maxEth && BigNumber(swapValue).gt(maxEth)) {
        return {
          isDisabled: true,
          title: `Insufficient ETH Balance`,
        }
      }
      return {
        isDisabled: false,
        title: 'Wrap',
      }
    } else {
      if (!swapValue) {
        return {
          isDisabled: true,
          title: `Enter WETH amount`,
        }
      }
      if (maxWeth && BigNumber(swapValue).gt(maxWeth)) {
        return {
          isDisabled: true,
          title: `Insufficient WETH Balance`,
        }
      }
      return {
        isDisabled: false,
        title: 'Unwrap',
      }
    }
  }, [swapDirection, swapValue, maxEth, maxWeth])

  const {
    write: runDepositAsync,
    data: depositData,
    isLoading: isWriteDepositLoading,
    isError: isWriteDepositError,
    error: writeDepositError,
  } = useContractWrite({
    address: WETH_CONTRACT_ADDRESS,
    abi: [WETH_CONTRACT_ABI.find((i) => i.name === 'deposit')],
    functionName: 'deposit',
  })
  const { isLoading: isWaitDepositLoading } = useWaitForTransaction({
    hash: depositData?.hash,
    onSuccess() {
      toast({
        status: 'success',
        title: 'wrap successfully.',
      })
      refreshEthData()
      refreshWethData()
      setSwapValue('')
    },
    onError(err: any) {
      console.log('🚀 ~ file: AccountModal.tsx:336 ~ onError ~ err:', err)
    },
  })
  const depositLoading = useMemo(() => {
    return isWaitDepositLoading || isWriteDepositLoading
  }, [isWaitDepositLoading, isWriteDepositLoading])

  const {
    writeAsync: runWithdrawAsync,
    data: withdrawData,
    isLoading: isWriteWithdrawLoading,
    isError: isWriteWithdrawError,
    error: writeWithdrawError,
  } = useContractWrite({
    address: WETH_CONTRACT_ADDRESS,
    abi: [WETH_CONTRACT_ABI.find((i) => i.name === 'withdraw')],
    functionName: 'withdraw',
  })
  const { isLoading: isWaitWithdrawLoading } = useWaitForTransaction({
    hash: withdrawData?.hash,
    onSuccess() {
      toast({
        status: 'success',
        title: 'Unwrap successfully.',
      })
      refreshEthData()
      refreshWethData()
      setSwapValue('')
    },
  })

  const withdrawLoading = useMemo(() => {
    return isWaitWithdrawLoading || isWriteWithdrawLoading
  }, [isWaitWithdrawLoading, isWriteWithdrawLoading])

  // const { runAsync: runDepositAsync, loading: depositLoading } = useRequest(
  //   depositWeth,
  //   {
  //     manual: true,
  //   },
  // )

  const inputsData = useMemo(() => {
    const initialData = [
      {
        key: 1,
        name: 'ETH',
        data: ethData,
      },
      {
        key: 2,
        name: 'WETH',
        data: wethData,
      },
    ]
    if (swapDirection === SWAP_DIRECTION.ETH2WETH) return initialData
    return initialData.reverse()
  }, [ethData, wethData, swapDirection])

  useEffect(() => {
    if (!isOpen) {
      setSwapValue('')
      return
    }
  }, [isOpen])

  const totalBalance = useMemo(() => {
    const ethBalance = ethData || 0
    const wethBalance = wethData || 0

    return wei2Eth(BigNumber(ethBalance).plus(wethBalance))
  }, [ethData, wethData])

  if (!isConnected) return null

  return (
    <Popover
      offset={[0, 2]}
      arrowSize={10}
      isOpen={isOpen}
      onClose={onClose}>
      <PopoverTrigger>
        <Button
          onClick={async () => {
            if (!chainEnable) {
              await handleSwitchNetwork?.()
              await runChainCheckAsync(chain?.id)
              return
            }
            onToggle()
          }}
          variant={'ghost'}
          className='custom-hover-style'
          leftIcon={
            chainEnable ? (
              <SvgComponent
                svgId='icon-eth'
                fontSize={'10px'}
                marginInlineEnd={0}
                fill={isOpen ? 'blue.1' : 'black.1'}
                mt='2px'
              />
            ) : undefined
          }
          as={Button}
          borderRadius={4}
          iconSpacing={0}
          fontSize={'12px'}
          borderRightRadius={0}
          h='32px'
          bg={'gray.5'}
          _hover={{
            bg: 'gray.5',
            color: 'blue.1',
          }}
          _active={{
            bg: 'gray.5',
          }}
          fontWeight={'700'}
          color={isOpen ? 'blue.1' : 'black.1'}
          isLoading={ethLoading || wethLoading}
          minW={'82px'}
          {...p}>
          {chainEnable ? formatFloat(totalBalance, 4, true) : 'Switch network'}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        py='16px'
        w='340px'
        boxShadow={'var(--chakra-shadows-default)'}
        border={'none'}
        cursor={'initial'}>
        <PopoverArrow boxShadow={'none'} />

        <PopoverBody p='0'>
          <Flex
            px='10px'
            boxShadow='0px 8px 16px 0px rgba(155, 172, 196, 0.12)'
            position={'relative'}>
            {[
              ACCOUNT_MODAL_TAB_KEY.AVAILABLE_FUNDS_TAB,
              ACCOUNT_MODAL_TAB_KEY.SWAP_TAB,
            ].map((i) => (
              <Flex
                flex={1}
                cursor={'pointer'}
                py='10px'
                key={i}
                color={accountModalTab === i ? 'blue.1' : 'black.1'}
                justify={'center'}
                alignItems={'center'}
                fontWeight={'700'}
                transition={'all .5s'}
                onClick={() => {
                  onOpen(i)
                }}>
                {i}
              </Flex>
            ))}
            <Box
              pos='absolute'
              bg='blue.1'
              zIndex={120}
              w={'160px'}
              h='1px'
              transition={'left .5s ease-out'}
              mx='10px'
              bottom={0}
              left={
                accountModalTab === ACCOUNT_MODAL_TAB_KEY.SWAP_TAB ? '160px' : 0
              }
            />
          </Flex>

          <Flex px='10px'>
            {accountModalTab === ACCOUNT_MODAL_TAB_KEY.AVAILABLE_FUNDS_TAB && (
              <Flex
                direction={'column'}
                mt='16px'>
                <Flex
                  direction={'column'}
                  gap={'8px'}>
                  <Flex
                    gap='4px'
                    w='100%'>
                    <Button
                      isLoading={wethLoading}
                      onClick={() => {
                        if (Number(wethData) !== 0) {
                          navigate('/lending/create')
                          return
                        }
                        onOpen(ACCOUNT_MODAL_TAB_KEY.SWAP_TAB)
                      }}
                      {...BUTTON_PROPS}>
                      {formatBalance(wei2Eth(wethData))}&nbsp;WETH
                      <Text
                        fontSize={'12px'}
                        transform={'scale(0.83333)'}
                        color={'gray.1'}
                        fontWeight={'400'}
                        transformOrigin={'0 0'}>
                        {Number(wethData) !== 0
                          ? 'Available to Create Pools'
                          : 'Swap Your ETH for WETH'}
                      </Text>
                    </Button>
                    <Button
                      onClick={runApproveAsync}
                      isLoading={allowanceLoading || approveLoading}
                      isDisabled={approveLoading || allowanceLoading}
                      _disabled={{
                        ':hover': {
                          bg: 'linear-gradient(0deg, #F3F6F9 0%, #F3F6F9 100%), linear-gradient(136deg, #638FFF 0%, #AFDCFF 100%), linear-gradient(192deg, #B3B3FF 0%, #F0F0FF 100%)',
                        },
                        cursor: 'not-allowed',
                        bg: 'linear-gradient(0deg, #F3F6F9 0%, #F3F6F9 100%), linear-gradient(136deg, #638FFF 0%, #AFDCFF 100%), linear-gradient(192deg, #B3B3FF 0%, #F0F0FF 100%)',
                      }}
                      {...BUTTON_PROPS}>
                      {formatBalance(wei2Eth(allowanceData))}
                      &nbsp;WETH
                      <Text
                        fontSize={'12px'}
                        transform={'scale(0.83333)'}
                        color={'gray.1'}
                        transformOrigin={'0 0'}
                        fontWeight={'400'}>
                        Your Wallet Allowance
                      </Text>
                    </Button>
                  </Flex>
                  <Button
                    isLoading={ethLoading}
                    lineHeight={1}
                    display={'block'}
                    textAlign={'left'}
                    onClick={() => {
                      navigate('/market')
                    }}
                    _hover={{
                      background:
                        'conic-gradient(from 205deg at 76.88% -11.32%, rgba(255, 255, 255, 0.50) 0deg, rgba(255, 255, 255, 0.00) 360deg), linear-gradient(204deg, #EFF4FF 0%, #D6E2FF 25.52%, #F0F4FF 100%)',
                    }}
                    _active={{
                      background:
                        'conic-gradient(from 205deg at 76.88% -11.32%, rgba(255, 255, 255, 0.50) 0deg, rgba(255, 255, 255, 0.00) 360deg), linear-gradient(204deg, #EFF4FF 0%, #D6E2FF 25.52%, #F0F4FF 100%)',
                    }}
                    borderRadius={4}
                    h='54px'
                    p='8px'
                    background='conic-gradient(from 205deg at 76.88% -11.32%, rgba(255, 255, 255, 0.50) 0deg, rgba(255, 255, 255, 0.00) 360deg), linear-gradient(204deg, #EFF4FF 0%, #D6E2FF 25.52%, #F0F4FF 100%)'
                    position={'relative'}>
                    <Image
                      pos={'absolute'}
                      src={ImgStyledArrow}
                      boxSize={'50px'}
                      right={'30px'}
                      top={'50%'}
                      transform={'translate(0%,-50%)'}
                    />
                    <Text>{formatBalance(wei2Eth(ethData))} ETH</Text>
                    <Text
                      fontSize={'12px'}
                      color={'gray.1'}
                      fontWeight={'400'}
                      mt='4px'>
                      Available to Buy NFTs
                    </Text>
                  </Button>
                </Flex>

                <Flex
                  direction={'column'}
                  gap={'10px'}
                  mt='8px'
                  position={'relative'}>
                  <LoadingComponent
                    loading={poolsLoading}
                    top={0}
                    minH={'80px'}
                    spinnerProps={{
                      marginTop: '30px',
                      w: '40px',
                      h: '40px',
                    }}
                    borderRadius={4}
                  />
                  {!poolList?.length ? (
                    <Flex
                      direction={'column'}
                      justify={'center'}
                      alignItems={'center'}>
                      <Text
                        fontSize={'12px'}
                        color={'gray.4'}
                        fontWeight={'700'}
                        mt='20px'
                        mb='16px'>
                        Create a Pool to Unlock Earnings！
                      </Text>
                      <Button
                        mb='10px'
                        h='28px'
                        onClick={() => navigate('/lending/create')}
                        variant={'secondary'}
                        pb='2px'>
                        + Create New Pool
                      </Button>
                    </Flex>
                  ) : (
                    <>
                      <Flex>
                        {['Collection', 'Amount Lent/Supply Caps'].map(
                          (label, index) => (
                            <Flex
                              key={label}
                              w={index == 0 ? '100px' : '146px'}
                              justify={!index ? 'flex-start' : 'center'}
                              fontSize={'12px'}
                              fontWeight={'500'}
                              color='gray.4'>
                              {label}
                            </Flex>
                          ),
                        )}
                      </Flex>
                      {poolList.map((item) => (
                        <Flex
                          key={item?.nonce}
                          alignItems={'center'}
                          h='28px'>
                          <TooltipComponent
                            label={item?.nftCollection?.name}
                            placement='top'>
                            <Flex
                              gap='4px'
                              alignItems={'center'}
                              w='100px'>
                              <ImageWithFallback
                                src={item?.nftCollection?.imagePreviewUrl}
                                boxSize={'24px'}
                                fit='contain'
                                borderRadius={4}
                              />
                              <Text
                                transform={'scale(0.83333)'}
                                fontSize={'12px'}
                                noOfLines={1}
                                fontWeight={'500'}>
                                {item?.nftCollection?.name || '---'}
                              </Text>
                              {item?.nftCollection?.safelistRequestStatus ===
                                'verified' && (
                                <SvgComponent svgId='icon-verified-fill' />
                              )}
                            </Flex>
                          </TooltipComponent>
                          <Flex
                            alignItems={'center'}
                            flex={1}
                            justify={'center'}>
                            <SvgComponent
                              svgId='icon-eth'
                              fontSize={'12px'}
                              mt='2px'
                            />
                            <Text
                              transform={'scale(0.83333)'}
                              textAlign={'center'}
                              fontSize={'12px'}
                              fontWeight={'500'}>
                              {formatFloat(
                                wei2Eth(item.supply_used || 0),
                                4,
                                true,
                              )}
                              /{formatFloat(wei2Eth(item.supply_cap), 4, true)}
                            </Text>
                          </Flex>

                          <Flex
                            justify={'flex-end'}
                            boxSize={'24px'}
                            w='74px'>
                            <UpdatePoolAmountButton
                              poolData={{ ...item }}
                              collectionSlug={item.nftCollection?.slug}
                              onSuccess={refreshPools}
                              borderRadius={'24px'}
                              bg='blue.2'
                              minW={'24px'}
                              w='24px'
                              h='24px'
                              p={0}>
                              {EDIT_SVG}
                            </UpdatePoolAmountButton>
                          </Flex>
                        </Flex>
                      ))}
                      <Flex justify={'center'}>
                        <Button
                          variant={'secondary'}
                          onClick={() => navigate('/lending/my-pools')}
                          hidden={poolList?.length < MAX_POOL_LENGTH}
                          marginTop={'10px'}
                          borderRadius={'40px'}
                          height={'20px'}
                          fontSize={'12px'}
                          pb='2px'>
                          Show More
                        </Button>
                      </Flex>
                    </>
                  )}
                </Flex>
              </Flex>
            )}

            {accountModalTab === ACCOUNT_MODAL_TAB_KEY.SWAP_TAB && (
              <Flex mt='16px'>
                <Flex
                  direction={'column'}
                  alignItems={'center'}
                  gap={'8px'}
                  position={'relative'}>
                  <Flex
                    position={'absolute'}
                    top={'110px'}
                    cursor={'pointer'}
                    onClick={() => {
                      setSwapValue('')
                      if (swapDirection === SWAP_DIRECTION.ETH2WETH) {
                        setSwapDirection(SWAP_DIRECTION.WETH2Eth)
                        return
                      }
                      if (swapDirection === SWAP_DIRECTION.WETH2Eth) {
                        setSwapDirection(SWAP_DIRECTION.ETH2WETH)
                        return
                      }
                    }}>
                    <SvgComponent
                      transform={`rotate(${
                        swapDirection === SWAP_DIRECTION.ETH2WETH ? 0 : 360
                      }deg)`}
                      svgId='icon-swap'
                      transition={
                        'transform 0.25s ease-in-out 0s, background-color 0.25s ease-in-out 0s'
                      }
                      fill={'pink'}
                      fontSize={'32px'}
                    />
                  </Flex>
                  {inputsData.map((item, index) => (
                    <Flex
                      borderRadius={'16px'}
                      bg='gray.5'
                      alignItems={'center'}
                      h='120px'
                      pl='14px'
                      pr='30px'
                      py='20px'
                      key={item.key}>
                      <CustomNumberInput
                        onSetValue={(e) => {
                          setSwapValue(e)
                        }}
                        precious={4}
                        maxValue={9999}
                        cursor={!!index ? 'initial' : 'text'}
                        isReadOnly={!!index}
                        isDisabled={
                          gasLoading ||
                          baseFeeLoading ||
                          ethLoading ||
                          wethLoading
                        }
                        color={'gray.3'}
                        fontWeight={'700'}
                        fontSize={'36px'}
                        value={swapValue}
                        placeholder='0.0'
                        border={'none'}
                        _focus={{
                          border: 'none',
                        }}
                        _focusVisible={{
                          boxShadow: 'none',
                        }}
                      />

                      <Flex
                        direction={'column'}
                        alignItems={'end'}
                        w='160px'
                        justify={index ? 'flex-end' : 'space-between'}
                        h='100%'>
                        <Button
                          variant={'link'}
                          minW={'0'}
                          hidden={!!index}
                          isLoading={baseFeeLoading}
                          isDisabled={gasLoading || baseFeeLoading}
                          onClick={async () => {
                            await refreshGasAsync()
                            await refreshBaseFeeAsync()
                            setSwapValue(maxSwapValue || '')
                          }}
                          lineHeight={'normal'}>
                          Max
                        </Button>
                        <Flex
                          direction={'column'}
                          alignItems={'end'}>
                          <Text
                            fontSize={'20px'}
                            fontWeight={'700'}
                            color={'gray.3'}
                            lineHeight={'normal'}>
                            {item.name}
                          </Text>
                          <Text
                            color={'gray.1'}
                            fontSize={'14px'}
                            lineHeight={'normal'}>
                            Balance:&nbsp;
                            {formatFloat(wei2Eth(item.data), 4, true)}
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>
                  ))}
                  {swapDirection === SWAP_DIRECTION.ETH2WETH &&
                    isWriteDepositError && (
                      <Text
                        color={'red.1'}
                        wordBreak={'break-word'}
                        textAlign={'left'}
                        w='100%'>
                        {formatWagmiErrorMsg(
                          (writeDepositError?.cause as any)?.message,
                        )}
                      </Text>
                    )}
                  {swapDirection === SWAP_DIRECTION.WETH2Eth &&
                    isWriteWithdrawError && (
                      <Text
                        color={'red.1'}
                        wordBreak={'break-word'}
                        textAlign={'left'}
                        w='100%'>
                        {formatWagmiErrorMsg(
                          (writeWithdrawError?.cause as any)?.message,
                        )}
                      </Text>
                    )}
                  <Button
                    variant={'primary'}
                    w='100%'
                    h='52px'
                    isDisabled={swapBtnStatus.isDisabled}
                    mt='8px'
                    isLoading={
                      depositLoading ||
                      withdrawLoading ||
                      gasLoading ||
                      baseFeeLoading ||
                      ethLoading ||
                      wethLoading
                    }
                    onClick={() => {
                      try {
                        const swapWei = eth2Wei(swapValue)
                        if (!swapWei) return
                        if (swapDirection === SWAP_DIRECTION.ETH2WETH) {
                          runDepositAsync?.({
                            value: BigInt(eth2Wei(swapValue) || 0),
                          })
                          return
                        }
                        runWithdrawAsync?.({
                          args: [BigInt(eth2Wei(swapValue) || 0)],
                        })
                      } catch (error) {
                        console.log(
                          '🚀 ~ file: AccountModal.tsx:910 ~ error:',
                          error,
                        )
                      }
                    }}>
                    {swapBtnStatus.title}
                  </Button>
                </Flex>
              </Flex>
            )}
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}

export default AccountModal
