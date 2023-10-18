import {
  Box,
  Text,
  Flex,
  Button,
  SlideFade,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Highlight,
  VStack,
  Divider,
  Skeleton,
  type FlexProps,
  useToast,
} from '@chakra-ui/react'
import { watchContractEvent } from '@wagmi/core'
import useDebounce from 'ahooks/lib/useDebounce'
import useRequest from 'ahooks/lib/useRequest'
import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import { isEmpty } from 'lodash'
import { minBy } from 'lodash'
import { range } from 'lodash'
import { round } from 'lodash'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  type FunctionComponent,
} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  useContractRead,
  useContractWrite,
  useSignTypedData,
  useWaitForTransaction,
} from 'wagmi'

import {
  apiGetAssetPrice,
  apiGetFloorPrice,
  apiGetPools,
  apiPostOffers,
} from 'api'
import imgOnOffer from 'assets/img-no-offer.png'
import {
  ConnectWalletModal,
  NotFound,
  SvgComponent,
  NftMedia,
  H5SecondaryHeader,
  MiddleStatus,
  CustomLoader,
  TooltipComponent,
} from 'components'
import {
  FORMAT_NUMBER,
  UNIT,
  MARKET_TYPE_ENUM,
  XBANK_CONTRACT_ADDRESS,
  XBANK_CONTRACT_ABI,
  WETH_CONTRACT_ADDRESS,
} from 'constants/index'
import { TENOR_VALUES, COLLATERAL_VALUES } from 'constants/interest'
import { useWallet, useAssetQuery, useExchangeRatesQuery } from 'hooks'
import RootLayout from 'layouts/RootLayout'
import { amortizationCalByDays } from 'utils/calculation'
import {
  formatFloat,
  formatPluralUnit,
  formatWagmiErrorMsg,
  getFullNum,
} from 'utils/format'
import { eth2Wei, wei2Eth } from 'utils/unit-conversion'
import { getBuyerExactInterest, isAddressEqual } from 'utils/utils'

import BelongToCollection from './components/BelongToCollection'
import DetailComponent from './components/DetailComponent'
import EmptyPools from './components/EmptyPools'
import ImageToolBar from './components/ImageToolBar'
import LabelComponent from './components/LabelComponent'
import NftStatusModal, { NFT_STATUS } from './components/NftStatusModal'
import PlanItem from './components/PlanItem'
import RadioCard from './components/RadioCard'
import generateTypedData from './utils/generateTypedData'
import getFilteredPools from './utils/getFilteredPools'
import getMinAPRPool from './utils/getMinAPRPool'

const COLLATERAL = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000]
const BAD_REQUEST_WARN = 'bad_request_warning'

export enum LOAN_DAYS_ENUM {
  LOAN1Days = 1 * 3600 * 24,
  LOAN3Days = 3 * 3600 * 24,
  Loan7Days = 7 * 3600 * 24,
  Loan14Days = 14 * 3600 * 24,
  Loan30Days = 30 * 3600 * 24,
  Loan60Days = 60 * 3600 * 24,
  Loan90Days = 90 * 3600 * 24,
}

type PoolType = {
  tenor: number
  lender: string
  apr: number
  offerHash: string
}

const NFTDetailContainer: FunctionComponent<FlexProps> = ({
  children,
  ...rest
}) => (
  <RootLayout
    px={{
      xl: '20px',
    }}>
    <Flex
      justify={{
        lg: 'space-between',
      }}
      alignItems='flex-start'
      flexWrap={{ lg: 'nowrap', md: 'wrap' }}
      gap={{
        md: '40px',
        sm: 0,
        xs: 0,
      }}
      mb={{ md: '80px' }}
      flexDir={{
        md: 'row',
        sm: 'column',
        xs: 'column',
      }}
      {...rest}>
      {children}
    </Flex>
  </RootLayout>
)

const NftAssetDetail = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [loanStep, setLoanStep] = useState<
    'loading' | 'success' | 'timeout' | undefined
  >()
  const {
    isOpen,
    onClose,
    currentAccount,
    interceptFn,
    noticeConfig: { refresh: refreshNotice },
    chainEnable,
    collectionList,
    collectionLoading,
    accountConfig: {
      banbanConfig: { refreshAsync: refreshMetadata },
    },
  } = useWallet()

  const [platform, setPlatform] = useState<MARKET_TYPE_ENUM | undefined>()

  const assetVariable = useParams() as {
    contractAddress: string
    tokenID: string
  }

  // 读取利差 X 0.1
  const { loading: protocolFeeRateLoading, data: protocolFeeRate } = useRequest(
    () => Promise.resolve(50),
  )

  const [commodityWeiPrice, setCommodityWeiPrice] = useState(BigNumber(0))

  const collection:
    | {
        name: string
        imagePreviewUrl: string
        safelistRequestStatus: string
        slug: string
        id: string
      }
    | undefined = useMemo(() => {
    const nftCollection = collectionList?.find((i) =>
      isAddressEqual(i.contractAddress, assetVariable?.contractAddress),
    )?.nftCollection
    if (!nftCollection) return
    const { name, slug, imagePreviewUrl, safelistRequestStatus, id } =
      nftCollection
    return {
      name,
      imagePreviewUrl,
      slug,
      safelistRequestStatus,
      id,
    }
  }, [collectionList, assetVariable?.contractAddress])

  const { data: detail, loading: assetFetchLoading } = useAssetQuery({
    variables: {
      assetContractAddress: assetVariable?.contractAddress,
      assetTokenId: assetVariable?.tokenID,
    },
  })

  const [nftStatus, setNftStatus] = useState<NFT_STATUS>()

  const { loading: poolsLoading, data: originPoolList } = useRequest(
    () =>
      apiGetPools({
        collateral_contract: detail?.asset?.assetContractAddress,
      }),
    {
      debounceWait: 100,
      ready: !!detail && nftStatus === NFT_STATUS.NORMAL,
      refreshDeps: [detail?.asset?.assetContractAddress],
    },
  )

  const {
    loading: floorPriceLoading,
    data: floorPrice,
    // error: floorPriceError,
  } = useRequest(
    () =>
      apiGetFloorPrice({
        slug: collection?.slug || '',
      }),
    {
      ready: !!collection && !!detail,
      refreshDeps: [collection],
      onError: () => {
        toast({
          title: 'Network problems, please refresh and try again',
          status: 'error',
          duration: 3000,
        })
      },
    },
  )

  const { loading: ordersPriceFetchLoading, refresh: refreshOrderPrice } =
    useRequest(apiGetAssetPrice, {
      ready: !!assetVariable,
      defaultParams: [
        {
          contract_address: assetVariable.contractAddress,
          token_id: assetVariable.tokenID,
        },
      ],
      onSuccess({ data }) {
        if (!data || !data?.length) {
          setCommodityWeiPrice(BigNumber(0))
          setNftStatus(NFT_STATUS.SOLD_OUT)
          return
        }
        const formatData = data.map((item) => ({
          marketplace: item.marketplace,
          amount: item.opensea_price?.amount || item.blur_price?.amount,
        }))
        const minMarketPrice = minBy(formatData, (item) => item?.amount)

        const minOpenSeaPrice = data.find((i) => i.marketplace === 'OPENSEA')
          ?.opensea_price?.amount
        if (!minMarketPrice) {
          setCommodityWeiPrice(BigNumber(0))
          setNftStatus(NFT_STATUS.SOLD_OUT)
          return
        }
        if (
          minOpenSeaPrice !== undefined &&
          minMarketPrice?.amount === minOpenSeaPrice
        ) {
          const openseaWei = eth2Wei(minOpenSeaPrice)
          if (!openseaWei) {
            setCommodityWeiPrice(BigNumber(0))
            setNftStatus(NFT_STATUS.SOLD_OUT)
            return
          }
          setCommodityWeiPrice(BigNumber(openseaWei))
          setNftStatus(NFT_STATUS.NORMAL)
          setPlatform(MARKET_TYPE_ENUM.OPENSEA)
        } else {
          const weiPrice = eth2Wei(Number(minMarketPrice.amount))
          if (!weiPrice) {
            setCommodityWeiPrice(BigNumber(0))
            setNftStatus(NFT_STATUS.SOLD_OUT)
            return
          }
          setCommodityWeiPrice(BigNumber(weiPrice))
          setNftStatus(NFT_STATUS.NORMAL)
          setPlatform(MARKET_TYPE_ENUM.BLUR)
        }
      },
      onError() {
        setCommodityWeiPrice(BigNumber(0))
      },
      debounceWait: 100,
    })

  const [percentage, setPercentage] = useState(COLLATERAL[4])
  const loanPercentage = useMemo(() => 10000 - percentage, [percentage])

  // 首付价格
  const downPaymentWei = useMemo(() => {
    if (!commodityWeiPrice) return BigNumber(0)
    return commodityWeiPrice.multipliedBy(percentage).dividedBy(10000)
  }, [commodityWeiPrice, percentage])

  // 贷款价格
  const loanWeiAmount = useMemo(() => {
    return commodityWeiPrice.minus(downPaymentWei)
  }, [commodityWeiPrice, downPaymentWei])

  const [selectedPool, setSelectedPool] = useState<PoolType>()

  useEffect(() => {
    if (!originPoolList || isEmpty(originPoolList)) {
      return
    }
    if (!nftStatus || nftStatus !== NFT_STATUS.NORMAL) {
      return
    }
    if (!chainEnable) {
      return
    }
    if (!floorPrice) {
      return
    }

    const res = getFullNum(floorPrice)

    const floorPriceWei = eth2Wei(res)
    if (floorPriceWei === undefined) {
      return
    }
    const minPools = getFilteredPools(
      commodityWeiPrice.multipliedBy(COLLATERAL_VALUES[0]).dividedBy(10000),
      COLLATERAL_VALUES[0],
      {
        originPoolList,
        floorPriceWei,
      },
    )
    if (!minPools.length) {
      setNftStatus(NFT_STATUS.NO_OFFER)
    }
  }, [originPoolList, floorPrice, chainEnable, commodityWeiPrice, nftStatus])

  const pools = useMemo(() => {
    if (!originPoolList || isEmpty(originPoolList)) {
      setSelectedPool(undefined)
      return []
    }
    if (!nftStatus || nftStatus !== NFT_STATUS.NORMAL) {
      setSelectedPool(undefined)
      return []
    }
    if (!chainEnable) {
      setSelectedPool(undefined)
      return []
    }

    if (!floorPrice) {
      setSelectedPool(undefined)
      return []
    }

    const res = getFullNum(floorPrice)

    const floorPriceWei = eth2Wei(res)
    // const floorPriceWei = BigNumber(floorPrice).multipliedBy(BigNumber(10).pow(18)).toNumber()
    if (floorPriceWei === undefined) {
      setSelectedPool(undefined)
      return []
    }

    const filterPercentageAndLatestBalancePools = getFilteredPools(
      loanWeiAmount,
      loanPercentage,
      {
        originPoolList,
        floorPriceWei,
      },
    )
    console.log(
      '🚀 ~ file: NftAssetDetail.tsx:418 ~ pools ~ originPoolList:',
      originPoolList,
    )

    console.log(
      '🚀 ~ file: NftAssetDetail.tsx:420 ~ pools ~ floorPriceWei:',
      floorPriceWei,
    )

    console.log(
      '🚀 ~ file: NftAssetDetail.tsx:416 ~ pools ~ filterPercentageAndLatestBalancePools:',
      filterPercentageAndLatestBalancePools,
    )

    console.log(
      '贷款',
      loanPercentage / 100,
      '%,可选的 POOL',
      filterPercentageAndLatestBalancePools,
    )

    if (
      !filterPercentageAndLatestBalancePools ||
      isEmpty(filterPercentageAndLatestBalancePools)
    ) {
      setSelectedPool(undefined)
      return []
    }
    const currentPools: PoolType[] = []
    TENOR_VALUES.forEach((item) => {
      const currentFilterPools = filterPercentageAndLatestBalancePools.filter(
        (i) => i.max_tenor >= item,
      )
      if (!isEmpty(currentFilterPools)) {
        const poolWithExactApr = currentFilterPools.map((poolItem) => {
          const { owner, hash } = poolItem
          const apr = getBuyerExactInterest(
            poolItem,
            item,
            loanPercentage,
          ) as number
          return {
            tenor: item,
            lender: owner,
            apr,
            offerHash: hash,
          }
        })
        const currentPool = getMinAPRPool(poolWithExactApr, item / 3600 / 24)
        if (!!currentPool) {
          currentPools.push(currentPool)
        }
      }
    })
    if (!currentPools.length) {
      setSelectedPool(undefined)
    } else {
      setSelectedPool(
        currentPools?.length > 1 ? currentPools[1] : currentPools[0],
      )
    }

    return currentPools
  }, [
    loanPercentage,
    loanWeiAmount,
    originPoolList,
    floorPrice,
    nftStatus,
    chainEnable,
  ])

  const handleSetDefaultPercentage = useCallback(() => {
    if (
      isEmpty(originPoolList) ||
      !originPoolList ||
      !floorPrice ||
      !nftStatus ||
      nftStatus !== NFT_STATUS.NORMAL
    ) {
      setPercentage(COLLATERAL[9])
      return
    }
    const floorPriceWei = eth2Wei(floorPrice)
    if (!floorPriceWei) return
    const minNumArr = originPoolList.map(
      ({
        max_collateral_factor,
        single_cap,
        supply_cap,
        supply_used = 0,
        owner_weth_allowance,
        owner_weth_balance,
      }) => {
        // 商品价格 * 该 pool 的最大贷款比例
        const num1 = BigNumber(commodityWeiPrice)
          .multipliedBy(max_collateral_factor)
          .dividedBy(10000)
        // 该 pool 的单笔单款最大值
        const num2 = BigNumber(single_cap)
        // 该 pool available size
        const num3 = BigNumber(supply_cap).minus(supply_used).lt(0)
          ? 0
          : BigNumber(supply_cap).minus(supply_used).toNumber()
        // 该 pool  owner 最新的 weth 余额
        const num4 = BigNumber(owner_weth_balance)
        const num5 = BigNumber(owner_weth_allowance)

        // 上述四个值取最小值
        const minNum = BigNumber.minimum(num1, num2, num3, num4, num5)
        return minNum
      },
    )

    // 与地板价比较取较小值
    const num = BigNumber.minimum(
      BigNumber(floorPriceWei),
      BigNumber.maximum.apply(null, minNumArr),
    )
    if (!num) return
    // 用 1- （两者取其小的金额/商品价格），得到首付比例，按 10% 的刻度向上进位： 40%=40%、41%=50%

    const _percentage = BigNumber(1)
      .minus(BigNumber(num).dividedBy(commodityWeiPrice))
      .multipliedBy(10)
      .toFixed(0, BigNumber.ROUND_UP)

    if (isNaN(Number(_percentage))) return
    setPercentage(
      Number(_percentage) * 1000 > 9000 ? 9000 : Number(_percentage) * 1000,
    )
  }, [originPoolList, commodityWeiPrice, floorPrice, nftStatus])

  useEffect(() => {
    handleSetDefaultPercentage?.()
  }, [handleSetDefaultPercentage])

  // number of installments
  const [installmentOptions, setInstallmentOptions] = useState<(1 | 2 | 3)[]>()
  const [installmentValue, setInstallmentValue] = useState<1 | 2 | 3>(1)

  useEffect(() => {
    if (!selectedPool) return
    if (isEmpty(selectedPool)) {
      setInstallmentOptions([])
      return
    }
    const { tenor } = selectedPool
    if (
      [
        LOAN_DAYS_ENUM.Loan7Days,
        LOAN_DAYS_ENUM.LOAN3Days,
        LOAN_DAYS_ENUM.LOAN1Days,
      ].includes(tenor)
    ) {
      setInstallmentOptions([1])
      setInstallmentValue(1)
      return
    }
    setInstallmentValue(2)
    if (tenor === LOAN_DAYS_ENUM.Loan14Days) {
      setInstallmentOptions([1, 2])
      return
    }
    setInstallmentOptions([1, 2, 3])
  }, [selectedPool])

  const getPlanPer = useCallback(
    (value: 1 | 2 | 3) => {
      if (!selectedPool || !loanWeiAmount || isEmpty(selectedPool)) {
        return BigNumber(0)
      }
      const { tenor, apr } = selectedPool
      const formattedApr = apr / 10000
      return amortizationCalByDays(
        loanWeiAmount,
        formattedApr,
        tenor,
        value,
      ).dividedBy(BigNumber(10).pow(18))
    },
    [selectedPool, loanWeiAmount],
  )

  // const [transferFromLoading, setTransferFromLoading] = useState(false)
  const [subscribeLoading, setSubscribeLoading] = useState(false)
  const { runAsync: generateLoanOrder, loading: loanOrderGenerateLoading } =
    useRequest(apiPostOffers, {
      manual: true,
    })

  const {
    writeAsync: runPayAsync,
    data: payData,
    isLoading: isWritePayLoading,
    // isError: isWritePayError,
    // error: writePayError,
  } = useContractWrite({
    address: XBANK_CONTRACT_ADDRESS,
    abi: [XBANK_CONTRACT_ABI.find((i) => i.name === 'prepareLoan')],
    functionName: 'prepareLoan',
  })
  const { isLoading: isWaitPayLoading } = useWaitForTransaction({
    hash: payData?.hash,
  })
  const transferFromLoading = useMemo(() => {
    return isWaitPayLoading || isWritePayLoading
  }, [isWaitPayLoading, isWritePayLoading])

  const { signTypedDataAsync, isLoading: signLoading } = useSignTypedData()
  const { data: exchangeData } = useExchangeRatesQuery({
    variables: {
      symbols: ['ETHUSDT'],
    },
  })

  /**
   * 1. client signature = wallet typed sign(message)
   * 2. serve signature = POST /offer(offer, client signature)
   * 3. wallet prepareLoan(offer, serve signature)
   * 4. watch loan create
   */
  const { refetch, isRefetching: eip712Loading } = useContractRead({
    address: XBANK_CONTRACT_ADDRESS,
    abi: [XBANK_CONTRACT_ABI.find((i) => i.name === 'eip712Domain')],
    functionName: 'eip712Domain',
    enabled: false,
  })

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    return () => {
      if (!timer.current) return
      clearTimeout(timer.current)
    }
  }, [timer])
  const [warnMessage, setWarnMessage] = useState<string>()
  const handleClickPay = useCallback(async () => {
    interceptFn(async () => {
      if (
        !selectedPool ||
        isEmpty(selectedPool) ||
        !platform ||
        protocolFeeRate === undefined ||
        !currentAccount
      ) {
        return
      }

      const { data: _domain } = await refetch()

      const [, name, version, chainId, verifyingContract] = _domain
      const { tenor, offerHash, apr, lender } = selectedPool

      const transferValue = downPaymentWei
        .plus(
          loanWeiAmount
            .multipliedBy(BigNumber(protocolFeeRate).dividedBy(10000))
            .integerValue(BigNumber.ROUND_DOWN),
        )
        .integerValue(BigNumber.ROUND_UP)
        .toString()

      try {
        const clientAcceptOfferRequestData = {
          orderID: '0',
          nonce: '0',
          loanAmount: loanWeiAmount.toString(),
          downPayment: downPaymentWei.toString(),
          collateralFactor: loanPercentage.toString(),
          // 无论是否买卖方 Offer，都需要填写；NFT Token id
          tokenID: `${detail?.asset?.tokenID}`,
          eachPayment: amortizationCalByDays(
            loanWeiAmount,
            apr / 10000,
            tenor,
            installmentValue,
          )
            .integerValue(BigNumber.ROUND_UP)
            ?.toString(),
          offerIR: apr,
          // 贷款时间
          tenor,
          offerHash,
          currency: WETH_CONTRACT_ADDRESS,
          borrower: currentAccount.address as string,
          lender,
          collateralContract: `${detail?.asset?.assetContractAddress}`,
          numberOfInstallments: installmentValue,
          offerSide: 2,
          isCreditSale: false,
          protocolFeeRate,
        }
        const dataForSign = generateTypedData(clientAcceptOfferRequestData, {
          name,
          version,
          chainId: Number(chainId),
          verifyingContract,
        })
        console.log('1. client sign', dataForSign)
        const clientSignature = await signTypedDataAsync(dataForSign)

        console.log('2. fetch service sign')
        const { server_sig, accept_offer_request } = await generateLoanOrder({
          signature: clientSignature,
          typed_data: JSON.stringify(dataForSign),
          marketplace: platform,
          collateral_price: commodityWeiPrice.toString(),
          floor_price: `${eth2Wei(floorPrice)}`,
        })

        const {
          orderID,
          nonce,
          loanAmount,
          downPayment,
          collateralFactor,
          tokenID,
          eachPayment,
          currency,
          borrower,
          lender: _lender,
          collateralContract,
          offerIR,
          tenor: _tenor,
          offerHash: _offerHash,
          protocolFeeRate: _protocolFeeRate,
          numberOfInstallments,
          offerSide,
          isCreditSale,
        } = accept_offer_request
        console.log(
          '🚀 ~ file: NftAssetDetail.tsx:756 ~ interceptFn ~ accept_offer_request:',
          accept_offer_request,
        )

        console.log(
          [
            orderID,
            nonce,
            loanAmount,
            downPayment,
            collateralFactor,
            tokenID,
            eachPayment,
            currency,
            borrower,
            _lender,
            collateralContract,
            offerIR,
            _tenor,
            _offerHash,
            _protocolFeeRate,
            numberOfInstallments,
            offerSide,
            isCreditSale,
          ],
          server_sig,
        )
        // console.log('3. verifyAcceptOfferRequest')
        // const isSuccess = await readContract({
        //   address: XBANK_CONTRACT_ADDRESS,
        //   abi: [
        //     XBANK_CONTRACT_ABI.find(
        //       (i) => i.name === '_verifyAcceptOfferRequest',
        //     ),
        //   ],
        //   functionName: '_verifyAcceptOfferRequest',
        //   args: [
        //     [
        //       orderID,
        //       nonce,
        //       loanAmount,
        //       downPayment,
        //       collateralFactor,
        //       tokenID,
        //       eachPayment,
        //       currency,
        //       borrower,
        //       _lender,
        //       collateralContract,
        //       offerIR,
        //       _tenor,
        //       _offerHash,
        //       _protocolFeeRate,
        //       numberOfInstallments,
        //       offerSide,
        //       isCreditSale,
        //     ],
        //     server_sig,
        //   ],
        // })
        // console.log('_verifyAcceptOfferRequest', isSuccess)
        //
        console.log('4. prepare loan')
        await runPayAsync?.({
          args: [
            [
              orderID,
              nonce,
              loanAmount,
              downPayment,
              collateralFactor,
              tokenID,
              eachPayment,
              currency,
              borrower,
              _lender,
              collateralContract,
              offerIR,
              _tenor,
              _offerHash,
              _protocolFeeRate,
              numberOfInstallments,
              offerSide,
              isCreditSale,
            ],
            server_sig,
          ],
          value: transferValue,
          account: currentAccount.address,
        })

        // 监听 loan 是否生成
        console.log('onSuccess')
        setSubscribeLoading(true)
        setLoanStep('loading')
        const unwatch = watchContractEvent(
          {
            address: XBANK_CONTRACT_ADDRESS,
            abi: [XBANK_CONTRACT_ABI.find((i) => i.name === 'LoanCreated')],
            eventName: 'LoanCreated',
          },
          (log: any) => {
            if (
              log?.length &&
              log[0]?.args.orderID == orderID
              // log[0].args.borrower == currentAccount?.address &&
              // log[0].args.lender == selectedPool?.lender
            ) {
              unwatch?.()
              setLoanStep('success')
              setSubscribeLoading(false)
              // 刷新通知接口数据
              refreshNotice()
              refreshMetadata()
              if (timer?.current) {
                clearTimeout(timer.current)
              }
            }
          },
        )

        // 如果 2 分钟内监听不到
        timer.current = setTimeout(() => {
          // 刷新通知接口数据
          refreshNotice()
          unwatch?.()
          setLoanStep('timeout')
          refreshMetadata()
        }, 2 * 60 * 1000)
      } catch (error: any) {
        const _error = error?.error || error?.cause || error
        console.log(
          '🚀 ~ file: NftAssetDetail.tsx:743 ~ interceptFn ~ _error:',
          _error,
        )
        if (_error?.code === BAD_REQUEST_WARN) {
          setWarnMessage(_error?.message)
        } else {
          toast({
            status: 'error',
            title: formatWagmiErrorMsg(_error?.message),
            isClosable: true,
          })
        }

        // setTransferFromLoading(false)
        setSubscribeLoading(false)
        setLoanStep(undefined)
      }
    })
  }, [
    refetch,
    floorPrice,
    toast,
    currentAccount,
    downPaymentWei,
    selectedPool,
    generateLoanOrder,
    detail,
    installmentValue,
    loanWeiAmount,
    commodityWeiPrice,
    interceptFn,
    platform,
    refreshNotice,
    refreshMetadata,
    protocolFeeRate,
    runPayAsync,
    loanPercentage,
    signTypedDataAsync,
    timer,
  ])

  const clickLoading = useMemo(
    () =>
      transferFromLoading ||
      subscribeLoading ||
      loanOrderGenerateLoading ||
      signLoading ||
      eip712Loading,
    [
      transferFromLoading,
      subscribeLoading,
      loanOrderGenerateLoading,
      signLoading,
      eip712Loading,
    ],
  )

  const loadingText = useMemo(() => {
    // 签名过程
    if (signLoading) return 'signing'
    // request offer
    if (loanOrderGenerateLoading) return 'loading'
    // transfer
    if (transferFromLoading) return 'confirming'
    return 'The loan is being generated, please wait'
  }, [signLoading, loanOrderGenerateLoading, transferFromLoading])

  // 防止页面 loading 闪烁
  const poolFilterLoading = useDebounce(
    poolsLoading ||
      assetFetchLoading ||
      collectionLoading ||
      ordersPriceFetchLoading ||
      protocolFeeRateLoading ||
      floorPriceLoading,
    { wait: 500 },
  )

  const isBanban = useMemo(
    () =>
      isAddressEqual(
        assetVariable?.contractAddress,
        import.meta.env.VITE_BANBAN_COLLECTION_ADDRESS,
      ),
    [assetVariable],
  )

  if (isEmpty(detail) && !assetFetchLoading)
    return (
      <RootLayout>
        <NotFound
          title='Asset not found'
          backTo='/market'
        />
      </RootLayout>
    )
  if (!!loanStep) {
    return (
      <RootLayout
        display={'flex'}
        justifyContent={'center'}>
        <MiddleStatus
          imagePreviewUrl={detail?.asset?.imagePreviewUrl}
          animationUrl={detail?.asset?.animationUrl}
          onLoadingBack={() => {
            refreshNotice()
            refreshMetadata()
            setLoanStep(undefined)
          }}
          onSuccessBack={() => {
            navigate('/loans')
          }}
          successButtonTitle={isBanban ? 'View My Boxdrop' : ''}
          successButtonAction={() => {
            navigate('/marketing-campaign')
          }}
          onTimeoutBack={() => {
            navigate('/loans')
          }}
          successTitle='Purchase Successfully!'
          successDescription={
            isBanban
              ? `Congratulations! You've successfully purchased the Banban NFT using 'Buy Now, Pay Later' and earned 30 golden boxes!`
              : 'Loan has been initialized.'
          }
          step={loanStep}
          loadingText='Buying this NFT from market. If unsuccessful, the down payment will be returned.'
          timeoutText={
            <Text
              fontWeight={'500'}
              mt='8px'
              textAlign={'center'}>
              Your loan is currently being processed. Please check the result of
              your purchase on the
              <Link to={'/loans'}>&nbsp;&apos;Repay Loans&apos;&nbsp;</Link>
              page.
            </Text>
          }
        />
      </RootLayout>
    )
  }

  return (
    <NFTDetailContainer>
      {nftStatus === NFT_STATUS.SOLD_OUT && (
        <NftStatusModal
          onClose={() => setNftStatus(undefined)}
          isOpen
          status={nftStatus}
          imgProps={{
            src: detail?.asset?.imagePreviewUrl,
          }}
          onConfirm={() =>
            navigate(`/market/${assetVariable?.contractAddress}`)
          }
        />
      )}
      {nftStatus === NFT_STATUS.NO_OFFER && (
        <NftStatusModal
          onClose={() => {
            setNftStatus(undefined)
            navigate(`/market/${assetVariable?.contractAddress}`)
          }}
          isOpen
          status={nftStatus}
          showTag={false}
          confirmText='Create One'
          imgProps={{
            src: imgOnOffer,
          }}
          onConfirm={() =>
            navigate(`/lending/create`, {
              // 是否携带当前 collection 去创建
              // 存在问题：这个 pool 是当前 address 拥有的 pool，只是所有这个 collection 的 pool 都失效了
              // state: {
              //   contractAddress: assetVariable.contractAddress,
              //   nftCollection: collection,
              // },
            })
          }
        />
      )}
      {/* 手机端 */}
      <H5SecondaryHeader
        title='Buy NFTs'
        mb='20px'
      />
      {assetFetchLoading || collectionLoading || floorPriceLoading ? (
        <Skeleton
          h='120px'
          borderRadius={16}
          w='100%'
          display={{
            md: 'none',
            sm: 'flex',
            xs: 'flex',
          }}
          mb='20px'
          startColor='rgba(27, 34, 44, 0.1)'
          endColor='rgba(27, 34, 44, 0.2)'
        />
      ) : (
        <Flex
          gap={'12px'}
          display={{
            md: 'none',
            sm: 'flex',
            xs: 'flex',
          }}>
          <NftMedia
            data={{
              imagePreviewUrl: detail?.asset.imagePreviewUrl,
              animationUrl: detail?.asset.animationUrl,
            }}
            borderRadius={8}
            boxSize={'64px'}
            fit='contain'
          />
          <Flex
            flexDir={'column'}
            justify='center'>
            <Text
              fontSize={'16px'}
              fontWeight='700'>
              {detail?.asset?.name || `#${detail?.asset?.tokenID || ''}`}
            </Text>
            <Text
              fontSize={'12px'}
              fontWeight='500'>
              {formatFloat(wei2Eth(commodityWeiPrice))}&nbsp;
              {UNIT}
            </Text>
          </Flex>
        </Flex>
      )}
      {/* pc 端 */}
      {assetFetchLoading || collectionLoading || floorPriceLoading ? (
        <Skeleton
          height={700}
          borderRadius={16}
          w={{
            xl: '600px',
            lg: '500px',
            md: '80%',
          }}
          display={{
            md: 'block',
            sm: 'none',
            xs: 'none',
          }}
          mt='32px'
          startColor='rgba(27, 34, 44, 0.1)'
          endColor='rgba(27, 34, 44, 0.2)'
        />
      ) : (
        <Flex
          justify={{
            xl: 'flex-start',
            lg: 'center',
            md: 'center',
          }}
          alignItems={{
            xl: 'flex-start',
            lg: 'center',
            md: 'center',
          }}
          w={{
            xl: '600px',
            lg: '500px',
            md: '100%',
          }}
          mt={'32px'}
          flexDirection={'column'}
          display={{
            md: 'flex',
            sm: 'none',
            xs: 'none',
          }}
          // position={'sticky'}
          // top='166px'
        >
          <NftMedia
            data={{
              imagePreviewUrl: detail?.asset.imagePreviewUrl,
              animationUrl: detail?.asset.animationUrl,
            }}
            borderRadius={20}
            boxSize={{
              xl: '600px',
              lg: '500px',
              md: '100%',
            }}
          />
          <ImageToolBar data={detail} />
          <BelongToCollection
            data={{
              ...collection,
              floorPrice,
              contract: assetVariable?.contractAddress,
            }}
          />
        </Flex>
      )}
      <Box
        w={{
          xl: '690px',
          lg: '640px',
          md: '100%',
          sm: '100%',
          xs: '100%',
        }}>
        {/* 价格 名称 */}
        <DetailComponent
          data={{
            name1: collection?.name,
            name2: detail?.asset?.name || `#${detail?.asset?.tokenID}`,
            price: wei2Eth(commodityWeiPrice),
            verified: collection?.safelistRequestStatus === 'verified',
            platform,
            contract: assetVariable?.contractAddress,
            usdPrice: exchangeData?.exchangeRates?.find(
              (i) => i?.symbol === 'ETHUSDT',
            )?.price,
          }}
          // onReFresh={}
          loading={assetFetchLoading}
          onRefreshPrice={refreshOrderPrice}
          refreshLoading={ordersPriceFetchLoading}
          display={{
            md: 'block',
            sm: 'none',
            xs: 'none',
          }}
        />

        {poolFilterLoading ? (
          <Flex
            w='100%'
            h='300px'
            alignItems={'center'}
            justify={'center'}>
            <CustomLoader />
          </Flex>
        ) : (
          <>
            {/* Pay Now */}
            <LabelComponent label='Pay Now'>
              <Flex
                p={{
                  md: '16px',
                  sm: '4px',
                  xs: '4px',
                }}
                pr={'24px'}
                border={`1px solid var(--chakra-colors-gray-1)`}
                borderRadius={{
                  md: 16,
                  sm: 8,
                  xs: 8,
                }}
                alignItems='center'
                gap={{
                  md: '16px',
                  sm: '4px',
                  xs: '4px',
                }}>
                {downPaymentWei && (
                  <Flex
                    py={'12px'}
                    bg='gray.5'
                    borderRadius={8}
                    gap={'4px'}
                    alignItems='center'
                    justify={'center'}
                    minW={{
                      md: '96px',
                      sm: '60px',
                      xs: '60px',
                    }}
                    px={'8px'}
                    w={{
                      md: '148px',
                      sm: '80px',
                      xs: '80px',
                    }}>
                    <SvgComponent
                      svgId='icon-eth'
                      svgSize='20px'
                    />
                    <Text
                      fontSize={{
                        md: '20px',
                        xs: '12px',
                        sm: '12px',
                      }}>
                      {formatFloat(wei2Eth(downPaymentWei))}
                    </Text>
                  </Flex>
                )}

                <Divider
                  orientation='vertical'
                  h={'24px'}
                />
                <Slider
                  min={COLLATERAL[0]}
                  max={COLLATERAL[COLLATERAL.length - 1]}
                  step={1000}
                  onChange={(target) => {
                    setPercentage(target)
                  }}
                  isDisabled={clickLoading}
                  value={percentage}
                  w={{
                    xl: '450px',
                    lg: '400px',
                    md: '436px',
                    sm: '230px',
                    xs: '220px',
                  }}>
                  {COLLATERAL.map((item) => (
                    <SliderMark
                      value={item}
                      fontSize='14px'
                      key={item}
                      zIndex={1}>
                      <Box
                        boxSize={{
                          md: '8px',
                          xs: '6px',
                          sm: '6px',
                        }}
                        borderRadius={8}
                        borderWidth={1}
                        borderColor='white'
                        mt={-1}
                        bg={percentage > item ? 'blue.1' : 'gray.1'}
                      />
                    </SliderMark>
                  ))}
                  <SliderTrack bg='gray.1'>
                    <SliderFilledTrack
                      bgGradient={`linear-gradient(90deg,#fff,var(--chakra-colors-blue-1))`}
                    />
                  </SliderTrack>
                  <SliderThumb
                    boxSize={{
                      md: '24px',
                      sm: '14px',
                      xs: '14px',
                    }}
                    borderWidth={{
                      md: 5,
                      sm: 3,
                      xs: 3,
                    }}
                    borderColor={'blue.1'}
                    _focus={{
                      boxShadow: 'none',
                    }}
                  />
                  <SlideFade />
                </Slider>
              </Flex>

              <Flex
                justify={'center'}
                gap={'4px'}
                alignItems='center'
                mt={'24px'}>
                <Text
                  fontSize={'12px'}
                  fontWeight='500'>
                  Pay later
                </Text>
                <SvgComponent
                  svgId='icon-eth'
                  svgSize='12px'
                />
                <Text
                  fontSize={'14px'}
                  fontWeight='500'>
                  {formatFloat(wei2Eth(loanWeiAmount))}
                </Text>
              </Flex>
            </LabelComponent>

            {/* 当没有匹配到 pool */}
            <EmptyPools
              isShow={
                isEmpty(selectedPool) &&
                !poolsLoading &&
                !assetFetchLoading &&
                !collectionLoading &&
                !ordersPriceFetchLoading &&
                !floorPriceLoading
              }
              onReset={handleSetDefaultPercentage}
            />
            {/* Length of Payment Plan */}
            <LabelComponent
              label='Length of Payment Plan'
              isEmpty={isEmpty(pools)}>
              <Flex gap={'8px'}>
                {pools.map(({ offerHash, apr, tenor, lender }) => {
                  return (
                    <Flex
                      key={`${offerHash}-${apr}-${tenor}`}
                      flex={1}
                      maxW={{
                        xl: '131px',
                        lg: '95px',
                        md: '80px',
                        sm: '100%',
                        xs: '100%',
                      }}>
                      <RadioCard
                        isDisabled={clickLoading}
                        onClick={() =>
                          setSelectedPool({
                            apr,
                            lender,
                            tenor,
                            offerHash,
                          })
                        }
                        p={{
                          xl: '12px',
                          lg: '10px',
                          md: '8px',
                          sm: '8px',
                          xs: '8px',
                        }}
                        isActive={selectedPool?.tenor === tenor}>
                        <Text fontWeight={700}>
                          {formatPluralUnit(tenor / 3600 / 24, 'Day')}
                        </Text>
                        <Text
                          fontWeight={500}
                          fontSize='12px'
                          color='blue.1'>
                          <Highlight
                            query={'APR'}
                            styles={{ color: `black.1` }}>
                            {`${apr && round(apr / 100, 2)} % APR`}
                          </Highlight>
                        </Text>
                      </RadioCard>
                    </Flex>
                  )
                })}
              </Flex>
            </LabelComponent>

            {/* Number of installments */}
            <LabelComponent
              label='Number of Installments'
              isEmpty={!selectedPool || isEmpty(selectedPool)}>
              <Flex
                gap={'8px'}
                flexWrap='wrap'>
                {installmentOptions?.map((value) => {
                  return (
                    <Flex
                      key={value}
                      flex={1}
                      maxW={{
                        md: '188px',
                        sm: '100%',
                        xs: '100%',
                      }}>
                      <RadioCard
                        p='10px'
                        isDisabled={clickLoading}
                        onClick={() => setInstallmentValue(value)}
                        isActive={value === installmentValue}>
                        <Text fontWeight={700}>
                          Pay in {formatPluralUnit(value, 'installment')}
                        </Text>
                        <Text
                          fontWeight={500}
                          fontSize='12px'>
                          {formatFloat(getPlanPer(value))}
                          &nbsp;
                          {UNIT}/per
                        </Text>
                      </RadioCard>
                    </Flex>
                  )
                })}
              </Flex>
            </LabelComponent>

            {/* Repayment Plan */}
            {!commodityWeiPrice.eq(0) && !loanWeiAmount.eq(0) && (
              <LabelComponent
                label='Repayment Plan'
                isEmpty={isEmpty(selectedPool)}>
                <VStack
                  bg='gray.5'
                  py='24px'
                  px='16px'
                  borderRadius={12}
                  spacing='16px'>
                  <PlanItem
                    value={formatFloat(wei2Eth(downPaymentWei))}
                    label='Now'
                  />

                  {range(installmentValue).map((value, index) => (
                    <PlanItem
                      value={formatFloat(getPlanPer(installmentValue))}
                      label={dayjs()
                        .add(
                          ((selectedPool?.tenor || 0) / installmentValue) *
                            (index + 1),
                          'seconds',
                        )
                        .format('YYYY/MM/DD')}
                      key={value}
                    />
                  ))}
                </VStack>
              </LabelComponent>
            )}

            {/* Trading Information */}
            <LabelComponent
              label='Summary'
              borderBottom={'none'}
              isEmpty={isEmpty(pools)}>
              {!loanWeiAmount.eq(0) && !commodityWeiPrice.eq(0) && (
                <Flex
                  border={`1px solid var(--chakra-colors-gray-1)`}
                  py='24px'
                  px='16px'
                  borderRadius={12}
                  gap='16px'
                  direction='column'>
                  {/* Commodity price */}
                  <Flex justify={'space-between'}>
                    <Text color='gray.3'>NFT price</Text>
                    <Text color='gray.3'>
                      {formatFloat(wei2Eth(commodityWeiPrice))}&nbsp;
                      {UNIT}
                    </Text>
                  </Flex>
                  {/* Pay now */}
                  <Flex justify={'space-between'}>
                    <Text color='gray.3'>Pay now</Text>
                    <Text color='gray.3'>
                      {formatFloat(wei2Eth(downPaymentWei))}&nbsp;
                      {UNIT}
                    </Text>
                  </Flex>
                  {/* Pay later */}
                  <Flex justify={'space-between'}>
                    <Text color='gray.3'>Pay later</Text>
                    <Text color='gray.3'>
                      {formatFloat(wei2Eth(loanWeiAmount))}&nbsp;
                      {UNIT}
                    </Text>
                  </Flex>
                  {/* Interest fee */}
                  <Flex justify={'space-between'}>
                    <Text color='gray.3'>Interest fee</Text>
                    <Text color='gray.3'>
                      {formatFloat(
                        getPlanPer(installmentValue)
                          .multipliedBy(installmentValue)
                          .minus(wei2Eth(loanWeiAmount) || 0)
                          .toFormat(FORMAT_NUMBER),
                      )}
                      &nbsp;
                      {UNIT}
                    </Text>
                  </Flex>

                  {/* service fee */}
                  <Flex justify={'space-between'}>
                    <Text color='gray.3'>Service fee</Text>
                    <Text color='gray.3'>
                      {formatFloat(
                        loanWeiAmount
                          .multipliedBy(
                            BigNumber(protocolFeeRate as number).dividedBy(
                              10000,
                            ),
                          )
                          .integerValue(BigNumber.ROUND_DOWN)
                          .dividedBy(BigNumber(10).pow(18)),
                      )}
                      &nbsp;
                      {UNIT}
                    </Text>
                  </Flex>
                  <Divider color='gray.2' />
                  {/* Total repayment */}
                  <Flex justify={'space-between'}>
                    <Text
                      fontSize='16px'
                      fontWeight='bold'>
                      Total payment
                    </Text>
                    <Text
                      fontSize='16px'
                      fontWeight='bold'>
                      {formatFloat(
                        // 每期 * 期数
                        getPlanPer(installmentValue)
                          .multipliedBy(installmentValue)
                          .plus(
                            downPaymentWei
                              .plus(
                                loanWeiAmount
                                  .multipliedBy(
                                    BigNumber(
                                      protocolFeeRate as number,
                                    ).dividedBy(10000),
                                  )
                                  .integerValue(BigNumber.ROUND_DOWN),
                              )
                              .dividedBy(BigNumber(10).pow(18)),
                          ),
                      )}
                      &nbsp;
                      {UNIT}
                    </Text>
                  </Flex>
                </Flex>
              )}
            </LabelComponent>

            {/* 按钮 */}

            <Button
              mx={{
                md: 0,
                sm: '32px',
                xs: '32px',
              }}
              hidden={isEmpty(selectedPool)}
              variant={'primary'}
              display='flex'
              h='60px'
              w='100%'
              onClick={handleClickPay}
              isDisabled={loanWeiAmount.eq(0) || isEmpty(selectedPool)}
              isLoading={clickLoading}
              loadingText={loadingText}
              leftIcon={
                <TooltipComponent
                  label={`Amount = 'Pay now' + Service fee`}
                  hasArrow
                  placement='top'
                  borderRadius={'50px'}
                  borderColor={'blue.1'}
                  lineHeight={'14px'}
                  p={0}
                  px={'10px'}
                  py='4px'
                  pt='2px'
                  borderWidth={'.5px'}
                  color={'blue.1'}
                  boxShadow={'none'}
                  arrowShadowColor='var(--chakra-colors-blue-1)'>
                  <SvgComponent
                    svgId='icon-tip'
                    svgSize={'20px'}
                  />
                </TooltipComponent>
              }
              fontWeight={'700'}>
              <Text fontWeight={'400'}>Pay now with</Text>&nbsp;
              {formatFloat(
                downPaymentWei
                  .plus(
                    loanWeiAmount
                      .multipliedBy(
                        BigNumber(protocolFeeRate as number).dividedBy(10000),
                      )
                      .integerValue(BigNumber.ROUND_DOWN),
                  )
                  .dividedBy(BigNumber(10).pow(18)),
              )}
              {UNIT}
            </Button>
            {!!warnMessage && (
              <Flex
                alignItems={'center'}
                gap={'4px'}
                mt='10px'>
                <SvgComponent
                  svgId='icon-tip'
                  fill={'orange.1'}
                  svgSize={'16px'}
                />
                <Text
                  color={'orange.1'}
                  fontSize={'14px'}>
                  {warnMessage}
                </Text>
              </Flex>
            )}
          </>
        )}
      </Box>
      <ConnectWalletModal
        visible={isOpen}
        handleClose={onClose}
      />
    </NFTDetailContainer>
  )
}

export default NftAssetDetail
