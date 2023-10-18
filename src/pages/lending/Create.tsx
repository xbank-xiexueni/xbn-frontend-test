import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  useDisclosure,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  chakra,
  useToast,
  Input,
} from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import BigNumber from 'bignumber.js'
import { find } from 'lodash'
import { isEmpty } from 'lodash'
import { isEqual } from 'lodash'
import { range } from 'lodash'
import { slice } from 'lodash'
import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import {
  useLocation,
  useNavigate,
  useParams,
  type Location,
} from 'react-router-dom'
import { useSignTypedData } from 'wagmi'

import {
  apiGetFloorPrice,
  apiGetConfig,
  apiGetPoolPoints,
  apiGetPoolsTypedData,
  apiPostPool,
  apiPutPool,
} from 'api'
import {
  AsyncSelectCollection,
  NotFound,
  H5SecondaryHeader,
  ScrollNumber,
  SvgComponent,
  CustomNumberInput,
  LoadingComponent,
  TooltipComponent,
  ConnectWalletModal,
} from 'components'
import {
  ACCOUNT_MODAL_TAB_KEY,
  MIN_LOAN_COUNT,
  STEPS_DESCRIPTIONS,
  WETH_CONTRACT_ADDRESS,
} from 'constants'
import {
  BASE_RATE,
  COLLATERAL_KEYS,
  COLLATERAL_MAP,
  COLLATERAL_VALUES,
  RATE_POWER_KEYS,
  RATE_POWER_MAP,
  TENOR_KEYS,
  TENOR_MAP,
  TENOR_VALUES,
  TERM_POWER_KEYS,
  TERM_POWER_MAP,
  RATIO_POWER_MAP,
  RATIO_POWER_KEYS,
  RATE_POWER_VALUES,
  BANBAN_POOL_DEFAULT_OPTIONS,
} from 'constants/interest'
import { useWallet, type NftCollection, useRemind } from 'hooks'
import LendLayout from 'layouts/LendLayout'
import { computePoolPoint, getMaxSingleLoanScore } from 'utils/calculation'
import {
  formatBigNum2Str,
  formatFloat,
  formatPluralUnit,
  formatTypedSignData,
} from 'utils/format'
import { eth2Wei, wei2Eth } from 'utils/unit-conversion'
import { getKeyByValue, isAddressEqual } from 'utils/utils'

import AllowanceModal from './components/AllowanceModal'
import IconTip from './components/IconTip'
import ScoreChart from './components/ScoreChart'
import SecondaryWrapper from './components/SecondaryWrapper'
import SliderWrapper from './components/SliderWrapper'
import StepDescription from './components/StepDescription'
import Wrapper from './components/Wrapper'

enum SUPPLY_CAPS_STATUS {
  BUY_MORE_ETH,
  WRAP_WETH,
  NORMAL,
}

const CAMPAIGN_ENTRY = 'campaign'

const Create = () => {
  const { action, contract } = useParams() as {
    action: 'create' | 'edit'
    contract?: string
  }
  const toast = useToast()

  const { state, search }: Location = useLocation()
  const navigate = useNavigate()
  const isFromCampaign = useMemo(() => {
    return (
      Object.fromEntries(new URLSearchParams(search))?.from === CAMPAIGN_ENTRY
    )
  }, [search])

  const {
    currentAccount,
    interceptFn,
    accountModalConfig: { onOpen: openAccountModal },
    isOpen,
    onClose,
    myPoolsConfig: { data: myPools },
    accountConfig: {
      wethConfig: { data: wethData, loading: wethLoading },
      ethConfig: { data: ethData, loading: ethLoading },
    },
    collectionList,
  } = useWallet()

  useEffect(() => {
    interceptFn?.(() => {})
  }, [interceptFn])

  const { isOpen: showFlexibility, onToggle: toggleShowFlexibility } =
    useDisclosure({
      defaultIsOpen: false,
    })

  const collectionAddressWithPool = useMemo(() => {
    if (process.env.DEV) return []
    if (!myPools || !myPools?.length) {
      return []
    }
    return [
      ...new Set(myPools?.map((i) => i.collateral_contract.toLowerCase())),
    ]
  }, [myPools])

  const [configData, setConfigData] = useState<
    ConfigDataType & {
      maxLoanAmountMap: Map<number, number>
    }
  >()
  const { loading: configLoading } = useRequest(apiGetConfig, {
    onSuccess: (data) => {
      if (!data) return
      const maxLoanAmountMap: Map<number, number> = new Map()
      data.config.max_loan_amount.forEach(({ key, value }) => {
        const [start] = key.split('-')
        maxLoanAmountMap.set(Number(start) / 10000, value)
      })
      setConfigData({
        ...data.config,
        maxLoanAmountMap,
      })
    },
  })

  // collection
  const [selectCollection, setSelectCollection] = useState<{
    contractAddress: string
    nftCollection: NftCollection
  }>()
  // 贷款比例 key
  const [collateralKey, setCollateralKey] = useState(4)
  // 单笔最大贷款
  const [singleCap, setSingleCap] = useState<string>()
  const [supplyCap, setSupplyCap] = useState<string>()
  // 贷款天数 key
  const [tenorKey, setTenorKey] = useState(5)
  // 贷款乘法系数
  const [interestPowerKey, setInterestPowerKey] = useState(5)

  // 贷款比例微调 right
  const [collateralFactorMultiplier, setCollateralFactorMultiplier] =
    useState(2)
  // 贷款天数微调 bottom
  const [tenorMultiplierKey, setTenorMultiplierKey] = useState(2)

  // banban collection 需要特殊处理
  const isBanban = useMemo(() => {
    return isAddressEqual(
      selectCollection?.contractAddress,
      process.env.VITE_BANBAN_COLLECTION_ADDRESS,
    )
  }, [selectCollection])
  useEffect(() => {
    if (isBanban) {
      setTenorKey(BANBAN_POOL_DEFAULT_OPTIONS.tenorKey)
      setCollateralKey(BANBAN_POOL_DEFAULT_OPTIONS.collateralKey)
      setSingleCap(BANBAN_POOL_DEFAULT_OPTIONS.singleCaps)
      setInterestPowerKey(BANBAN_POOL_DEFAULT_OPTIONS.ratePowerKey)
    }
  }, [isBanban])

  const { signTypedDataAsync, isLoading: signLoading } = useSignTypedData()

  const { runAsync: runGetPoolTypedData, loading: signDataLoading } =
    useRequest(apiGetPoolsTypedData, {
      manual: true,
    })
  const { runAsync: runPostPoolAsync, loading: createLoading } = useRequest(
    apiPostPool,
    {
      manual: true,
    },
  )

  const { runAsync: runPutPoolAsync, loading: updateLoading } = useRequest(
    apiPutPool,
    {
      manual: true,
    },
  )

  const initialCollection = useMemo(() => {
    if (!contract) return
    const nftCollection = collectionList.find((i) =>
      isAddressEqual(i.contractAddress, contract),
    )?.nftCollection
    if (!nftCollection) return
    const prev = {
      contractAddress: contract,
      nftCollection,
    }
    if (action === 'edit') {
      return prev
    }
    if (action === 'create') {
      if (!collectionAddressWithPool) return
      if (collectionAddressWithPool.includes(contract)) return
      return prev
    }
  }, [contract, action, collectionAddressWithPool, collectionList])

  const initialItems = useMemo(() => {
    let currentCollateralKey = 4
    let currentTenorKey = 5
    let currentInterestPowerKey = 5
    let currentCollateralFactorMultiplierKey = 2
    let currentTenorMultiplierKey = 2
    let preSingleCap
    let preSupplyCap

    // 只有编辑进来的 才需要填入默认值，supply 只需要填入 collection
    if (state && action === 'edit') {
      const { poolData } = state
      currentCollateralKey =
        getKeyByValue(COLLATERAL_MAP, poolData?.max_collateral_factor) ?? 4
      currentTenorKey = getKeyByValue(TENOR_MAP, poolData?.max_tenor) ?? 5

      // 贷款利率
      const cKey = `${currentTenorKey}-${currentCollateralKey}`
      const defaultRate = BigNumber(BASE_RATE.get(cKey) as number)
      const interestRank =
        find(RATE_POWER_VALUES, (element) => {
          return (
            defaultRate.multipliedBy(element).toFixed(0, BigNumber.ROUND_UP) ===
            poolData?.max_interest_rate.toString()
          )
        }) ?? 1

      currentInterestPowerKey = getKeyByValue(RATE_POWER_MAP, interestRank) ?? 5
      currentCollateralFactorMultiplierKey =
        getKeyByValue(
          RATIO_POWER_MAP,
          poolData?.collateral_factor_multiplier / 10000,
        ) ?? 2
      currentTenorMultiplierKey =
        getKeyByValue(TERM_POWER_MAP, poolData?.tenor_multiplier / 10000) ?? 2
      preSingleCap = wei2Eth(poolData.single_cap) ?? 0
      preSupplyCap = wei2Eth(poolData?.supply_cap) ?? 0
    }
    return {
      collateralKey: currentCollateralKey,
      tenorKey: currentTenorKey,
      interestPowerKey: currentInterestPowerKey,
      collateralFactorMultiplier: currentCollateralFactorMultiplierKey,
      tenorMultiplierKey: currentTenorMultiplierKey,
      preSingleCap,
      preSupplyCap,
    }
  }, [state, action])

  useEffect(() => {
    if (!initialItems) return
    setCollateralKey(initialItems.collateralKey)
    setTenorKey(initialItems.tenorKey)
    setInterestPowerKey(initialItems.interestPowerKey)
    setCollateralFactorMultiplier(initialItems.collateralFactorMultiplier)
    setTenorMultiplierKey(initialItems.tenorMultiplierKey)
    setSingleCap(initialItems?.preSingleCap?.toString() || undefined)
    setSupplyCap(initialItems?.preSupplyCap?.toString() || undefined)
  }, [initialItems])

  const { data: pointData } = useRequest(
    () =>
      apiGetPoolPoints({
        contract_address: selectCollection?.contractAddress || '',
      }),
    {
      ready: !!selectCollection,
      refreshDeps: [selectCollection],
    },
  )

  const { loading: floorPriceLoading, data: floorPrice } = useRequest(
    () =>
      apiGetFloorPrice({
        slug: selectCollection?.nftCollection.slug || '',
      }),
    {
      ready: !!selectCollection,
      refreshDeps: [selectCollection],
      // cacheKey: `staleTime-floorPrice-${selectCollection?.nftCollection?.slug}`,
      // staleTime: 1000 * 60,
      onError: () => {
        toast({
          title: 'Network problems, please refresh and try again',
          status: 'error',
          duration: 3000,
        })
      },
    },
  )

  const calculateScore: BigNumber | undefined = useMemo(() => {
    if (
      !selectCollection ||
      singleCap === undefined ||
      !floorPrice ||
      !configData
    )
      return
    const {
      weight: { x, y, z, w, u, v },
      loan_ratio,
      loan_term,
      maxLoanAmountMap,
      // 贷款期限微调 bottom
      loan_term_adjustment_factor,
      // 贷款比例微调 right
      loan_ratio_adjustment_factor,
      max_loan_interest_rate,
    } = configData

    // 贷款比例分数
    const collateralValue = COLLATERAL_MAP.get(collateralKey)
    const collateralScore = BigNumber(
      loan_ratio.find((i) => i.key === collateralValue?.toString())?.value || 0,
    ).multipliedBy(x)

    // 单笔最大贷款金额分数
    const maxLoanAmountScore = BigNumber(
      getMaxSingleLoanScore(
        BigNumber(singleCap).dividedBy(floorPrice).toNumber(),
        maxLoanAmountMap,
      ) || 0,
    ).multipliedBy(y)

    // 贷款期限分数
    const tenorValue = (TENOR_MAP.get(tenorKey) as number) / 3600 / 24
    const tenorScore = BigNumber(
      loan_term.find((i) => i.key == tenorValue?.toString())?.value || 0,
    ).multipliedBy(z)

    // 最大贷款利率分数
    const maxInterestValue =
      Number(RATE_POWER_MAP.get(interestPowerKey)) * 10000
    const maxInterestScore = BigNumber(
      max_loan_interest_rate.find((i) => i.key === maxInterestValue.toString())
        ?.value || 0,
    ).multipliedBy(w)

    // 按贷款比例微调分数
    const ratioValue =
      (RATIO_POWER_MAP.get(collateralFactorMultiplier) || 0) * 10000
    const ratioScore = BigNumber(
      loan_ratio_adjustment_factor.find((i) => i.key === ratioValue.toString())
        ?.value || 0,
    ).multipliedBy(u)

    // 按贷款期限微调分数
    const termValue = (TERM_POWER_MAP.get(tenorMultiplierKey) || 0) * 10000
    const termScore = BigNumber(
      loan_term_adjustment_factor.find((i) => i.key === termValue.toString())
        ?.value || 0,
    ).multipliedBy(v)
    // const _score = computePoolScore(
    //   {
    //     max_collateral_factor: collateralValue as number,
    //     single_cap: singleCap,
    //     max_tenor: 60 * 3600 * 24,
    //     max_interest_rate: maxInterestValue,
    //     collateral_factor_multiplier: ratioValue,
    //     tenor_multiplier: termValue,
    //   },
    //   configData,
    //   floorPrice,
    // )
    // console.log(
    //   _score?.toString(),
    //   collateralScore
    //     .plus(maxLoanAmountScore)
    //     .plus(tenorScore)
    //     .plus(maxInterestScore)
    //     .plus(ratioScore)
    //     .plus(termScore)
    //     .toString(),
    // )

    return collateralScore
      .plus(maxLoanAmountScore)
      .plus(tenorScore)
      .plus(maxInterestScore)
      .plus(ratioScore)
      .plus(termScore)
  }, [
    selectCollection,
    collateralKey,
    tenorKey,
    singleCap,
    floorPrice,
    interestPowerKey,
    tenorMultiplierKey,
    collateralFactorMultiplier,
    configData,
  ])

  const currentPoolPoint = useMemo(() => {
    if (!pointData) return
    if (!calculateScore) return
    const { percent } = pointData
    return computePoolPoint(calculateScore, percent)
  }, [calculateScore, pointData])

  // set initial collection
  useEffect(() => {
    if (!initialCollection) return
    setSelectCollection(initialCollection)
  }, [initialCollection])

  const singleCapsInputStatus = useMemo(() => {
    if (singleCap === undefined) return
    const NumberAmount = Number(singleCap)
    if (NumberAmount <= 0) {
      return {
        status: 'error',
        message: 'You must enter the max amount for a single loan',
      }
    }
    if (floorPrice === undefined) return
    if (NumberAmount > floorPrice) {
      return {
        status: 'info',
        message:
          'Single loan amount is recommended to be no greater than the floor price',
      }
    }
  }, [singleCap, floorPrice])

  // 基础利率
  const baseRate = useMemo(() => {
    const cKey = `${tenorKey}-${collateralKey}`
    return BigNumber(BASE_RATE.get(cKey) as number)
  }, [collateralKey, tenorKey])

  // 基础利率 * power
  const baseRatePower = useMemo(() => {
    return baseRate
      .multipliedBy(RATE_POWER_MAP.get(interestPowerKey) as number)
      .integerValue(BigNumber.ROUND_UP)
  }, [baseRate, interestPowerKey])

  const currentCollaterals = useMemo(
    () => slice(COLLATERAL_VALUES, 0, collateralKey + 1),
    [collateralKey],
  )
  const currentTenors = useMemo(
    () => slice(TENOR_VALUES, 0, tenorKey + 1),
    [tenorKey],
  )

  const tableData = useMemo(() => {
    const rowCount = collateralKey + 1
    const colCount = tenorKey + 1
    const arr = new Array(rowCount)
    const sliderBottomValue = TERM_POWER_MAP.get(tenorMultiplierKey) as number
    const sliderRightValue = RATIO_POWER_MAP.get(
      collateralFactorMultiplier,
    ) as number
    for (let i = 0; i < rowCount; i++) {
      const forMapArr = range(colCount)
      arr[i] = forMapArr.map((item) => {
        const powerBottom = colCount - item - 1
        const powerRight = rowCount - i - 1
        const res = baseRatePower
          .multipliedBy(BigNumber(sliderBottomValue).pow(powerBottom))
          .multipliedBy(BigNumber(sliderRightValue).pow(powerRight))

        return res
      })
    }
    return arr
  }, [
    baseRatePower,
    tenorMultiplierKey,
    collateralKey,
    tenorKey,
    collateralFactorMultiplier,
  ])

  const collectionSelectorProps = useMemo(
    () => ({
      placeholder: 'Please select',
      onChange: (e: {
        contractAddress: string
        nftCollection: NftCollection
      }) => {
        setSelectCollection(e)
      },
    }),
    [],
  )

  /**
   * 1. message = get /api/nonce
   * 2. signature = wallet sign(message)
   * 3. post /api/pool(offer, signature)
   */
  const handleUpdate = useCallback(async () => {
    interceptFn(async () => {
      try {
        const poolObj: PoolsActionData = {
          // supportERC20Denomination
          currency: WETH_CONTRACT_ADDRESS as `0x${string}`,
          // allowCollateralContract
          collateral_contract: state.poolData.collateral_contract,
          owner: currentAccount?.address as string,
          supply_cap: `${formatBigNum2Str(eth2Wei(supplyCap))}`,
          single_cap: `${formatBigNum2Str(eth2Wei(singleCap))}`,
          max_collateral_factor: COLLATERAL_MAP.get(collateralKey) as number,
          max_tenor: TENOR_MAP.get(tenorKey) as number,
          max_interest_rate: baseRatePower.toNumber(),
          collateral_factor_multiplier:
            (TERM_POWER_MAP.get(tenorMultiplierKey) as number) * 10000,
          tenor_multiplier:
            (RATIO_POWER_MAP.get(collateralFactorMultiplier) as number) * 10000,
        }
        const typedData = await runGetPoolTypedData(poolObj)

        const signature = await signTypedDataAsync(
          formatTypedSignData(typedData),
          //   {
          //   ...typedData,
          //   domain: {
          //     ...typedData.domain,
          //     chainId: Number(Number(typedData.domain.chainId).toString(10)),
          //   },
          //   message: {
          //     ...typedData.message,
          //     // 暂时这样处理
          //     singleCap: `${typedData.message?.singleCap}`,
          //     supplyCap: `${typedData.message?.supplyCap}`,
          //     nonce: `${typedData.message?.nonce}`,
          //   },
          // }
        )

        await runPutPoolAsync({
          signature,
          typed_data: JSON.stringify(typedData),
        })
        toast({
          status: 'success',
          title: 'Updated successfully!',
        })
        setTimeout(() => {
          navigate('/lending/my-pools')
        }, 1500)
      } catch (error: any) {
        console.log('🚀 ~ file: Create.tsx:650 ~ handleCreate2 ~ error:', error)
        toast({
          title: error?.cause?.code || error?.error?.code,
          description: error?.cause?.message || error?.error?.message,
          duration: 5000,
          status: 'error',
        })
      }
    })
  }, [
    runGetPoolTypedData,
    signTypedDataAsync,
    runPutPoolAsync,
    toast,
    navigate,
    currentAccount,
    interceptFn,
    state,
    supplyCap,
    singleCap,
    collateralKey,
    tenorKey,
    baseRatePower,
    tenorMultiplierKey,
    collateralFactorMultiplier,
  ])

  const isChanged = useMemo(() => {
    return !isEqual(initialItems, {
      collateralKey,
      tenorKey,
      interestPowerKey,
      collateralFactorMultiplier,
      tenorMultiplierKey,
      preSingleCap: Number(singleCap),
      preSupplyCap: Number(supplyCap),
    })
  }, [
    singleCap,
    initialItems,
    collateralKey,
    tenorKey,
    interestPowerKey,
    tenorMultiplierKey,
    collateralFactorMultiplier,
    supplyCap,
  ])

  const minSupplyCaps = useMemo(() => {
    const percentage = COLLATERAL_MAP.get(collateralKey) as number
    if (floorPrice === undefined) return
    return BigNumber(floorPrice).multipliedBy(percentage).dividedBy(10000)
  }, [floorPrice, collateralKey])

  const supplyCapsInputStatus = useMemo(() => {
    if (supplyCap === undefined) return
    const NumberAmount = Number(supplyCap)
    if (!minSupplyCaps) return
    if (minSupplyCaps?.gt(NumberAmount)) {
      return {
        status: 'error',
        message: `Insufficient funds, Min input: ${formatFloat(
          minSupplyCaps.toNumber(),
        )}`,
      }
    }
    if (minSupplyCaps.multipliedBy(MIN_LOAN_COUNT).gt(NumberAmount)) {
      return {
        status: 'info',
        message: `Suggested Amount: ${formatFloat(
          minSupplyCaps.multipliedBy(MIN_LOAN_COUNT).toNumber(),
        )}`,
      }
    }
  }, [supplyCap, minSupplyCaps])

  const suggestCaps = useMemo(() => {
    if (myPools === undefined) return
    return myPools
      .reduce(
        (sum, i) => sum.plus(BigNumber(i.supply_cap).minus(i.supply_used || 0)),
        BigNumber(0),
      )
      .plus(eth2Wei(supplyCap || 0) || 0)
  }, [myPools, supplyCap])

  const supplyCapsStatus: SUPPLY_CAPS_STATUS | undefined = useMemo(() => {
    if (
      ethData === undefined ||
      wethData === undefined ||
      suggestCaps === undefined ||
      !supplyCap ||
      supplyCapsInputStatus?.status === 'error'
    ) {
      return
    }
    if (BigNumber(wethData).gt(suggestCaps)) return SUPPLY_CAPS_STATUS.NORMAL
    if (BigNumber(wethData).plus(BigNumber(ethData)).gt(suggestCaps)) {
      return SUPPLY_CAPS_STATUS.WRAP_WETH
    }
    return SUPPLY_CAPS_STATUS.BUY_MORE_ETH
  }, [ethData, wethData, suggestCaps, supplyCapsInputStatus, supplyCap])

  const {
    isOpen: allowanceModalVisible,
    onOpen: openAllowanceModal,
    onClose: closeAllowanceModal,
  } = useRemind('allowance-modal-timestamp', {
    onFinish: () => {
      toast({
        status: 'success',
        title: 'Created successfully! ',
        id: 'Created-Successfully-ID',
      })
      navigate('/lending/my-pools')
    },
  })

  /**
   * 1. message = get /api/nonce
   * 2. signature = wallet sign(message)
   * 3. post /api/pool(offer, signature)
   */
  const handleCreate = useCallback(async () => {
    interceptFn(async () => {
      try {
        const poolObj: PoolsActionData = {
          owner: currentAccount?.address as string,
          // supportERC20Denomination
          currency: WETH_CONTRACT_ADDRESS as `0x${string}`,
          // allowCollateralContract
          collateral_contract:
            selectCollection?.contractAddress as `0x${string}`,
          // supplyCap
          supply_cap: `${formatBigNum2Str(eth2Wei(supplyCap))}`,
          single_cap: `${formatBigNum2Str(eth2Wei(singleCap))}`,
          // poolMaximumPercentage,
          max_collateral_factor: COLLATERAL_MAP.get(collateralKey) as number,
          // uint32 poolMaximumDays,
          max_tenor: TENOR_MAP.get(tenorKey) as number,
          // uint32 poolMaximumInterestRate,
          max_interest_rate: BigNumber(baseRatePower).integerValue().toNumber(),
          // uint32 loanTimeConcessionFlexibility,
          tenor_multiplier:
            (TERM_POWER_MAP.get(tenorMultiplierKey) || 0) * 10000,
          // uint32 loanRatioPreferentialFlexibility
          collateral_factor_multiplier:
            (RATIO_POWER_MAP.get(collateralFactorMultiplier) || 0) * 10000,
        }
        const typedData = await runGetPoolTypedData(poolObj)
        const signature = await signTypedDataAsync(
          formatTypedSignData(typedData),
          //   {
          //   ...typedData,
          //   domain: {
          //     ...typedData.domain,
          //     chainId: Number(Number(typedData.domain.chainId).toString(10)),
          //   },
          //   message: {
          //     ...typedData.message,
          //     // 暂时这样处理
          //     singleCap: `${typedData.message?.singleCap}`,
          //     supplyCap: `${typedData.message?.supplyCap}`,
          //     nonce: `${typedData.message?.nonce}`,
          //   },
          // }
        )

        await runPostPoolAsync({
          signature,
          typed_data: JSON.stringify(typedData),
        })
        openAllowanceModal()
      } catch (error: any) {
        toast({
          title: error?.cause?.code || error?.error?.code,
          description: error?.cause?.message || error?.error?.message,
          duration: 5000,
          status: 'error',
        })
      }
    })
  }, [
    toast,
    interceptFn,
    runGetPoolTypedData,
    signTypedDataAsync,
    openAllowanceModal,
    runPostPoolAsync,
    selectCollection,
    supplyCap,
    singleCap,
    collateralKey,
    tenorKey,
    baseRatePower,
    collateralFactorMultiplier,
    tenorMultiplierKey,
    currentAccount,
  ])

  const actionLoading = useMemo(() => {
    return createLoading || updateLoading || signDataLoading || signLoading
  }, [createLoading, updateLoading, signDataLoading, signLoading])

  const inputRef = useRef<any>(null)
  useEffect(() => {
    if (inputRef?.current && isBanban && !!floorPrice) {
      inputRef.current.focus()
    }
  }, [inputRef, isBanban, floorPrice])

  const createBtnDisabledData = useMemo(() => {
    if (isEmpty(selectCollection)) {
      return {
        isDisabled: true,
        label: 'Please select collection',
      }
    }
    if (
      collectionAddressWithPool?.includes(
        selectCollection?.contractAddress?.toLowerCase(),
      )
    ) {
      return {
        isDisabled: true,
        label: `This collection's pool already exists`,
      }
    }
    if (!singleCap || singleCapsInputStatus?.status === 'error') {
      return {
        isDisabled: true,
        label: 'Please set valid max single loan amount',
      }
    }
    if (!supplyCap || supplyCapsInputStatus?.status === 'error') {
      return {
        isDisabled: true,
        label: 'Please set valid supply caps',
      }
    }
    if (!floorPrice) {
      return {
        isDisabled: true,
        label: 'Network problems, please refresh and try again',
      }
    }
    return {
      isDisabled: false,
      label: undefined,
    }
  }, [
    floorPrice,
    supplyCapsInputStatus,
    collectionAddressWithPool,
    selectCollection,
    singleCapsInputStatus,
    singleCap,
    supplyCap,
  ])

  const updateBtnDisabledData = useMemo(() => {
    if (!singleCap || singleCapsInputStatus?.status === 'error') {
      return {
        isDisabled: true,
        label: 'Please set valid max single loan amount',
      }
    }
    if (!supplyCap || supplyCapsInputStatus?.status === 'error') {
      return {
        isDisabled: true,
        label: 'Please set valid supply caps',
      }
    }
    if (!floorPrice) {
      return {
        isDisabled: true,
        label: 'Network problems, please refresh and try again',
      }
    }
    if (!isChanged) {
      return {
        isDisabled: true,
        label: 'Nothing changed',
      }
    }
    return {
      isDisabled: false,
      label: undefined,
    }
  }, [
    floorPrice,
    supplyCapsInputStatus,
    singleCapsInputStatus,
    singleCap,
    supplyCap,
    isChanged,
  ])

  if (!['edit', 'create'].includes(action)) {
    return (
      <LendLayout>
        <NotFound />
      </LendLayout>
    )
  }
  if (action === 'edit' && (!state || isEmpty(state))) {
    return (
      <LendLayout>
        <NotFound title='pool not found' />
      </LendLayout>
    )
  }
  return (
    <LendLayout>
      <H5SecondaryHeader />

      <Box
        mb={8}
        mt={{
          md: '60px',
          sm: '10px',
          xs: '10px',
        }}
        position={'relative'}>
        <Box
          position={'fixed'}
          top={{
            md: '130px',
            sm: '100px',
            xs: '100px',
          }}
          zIndex={2}
          right={0}
          bg='white'
          borderRadius={8}
          boxShadow={'0px 4px 12px #F3F6F9'}
          py='8px'
          // px='10px'
        >
          <ScoreChart data={currentPoolPoint} />
        </Box>
        <Heading
          fontSize={{
            md: '40px',
            sm: '24px',
            xs: '24px',
          }}
          mb={'8px'}>
          {action === 'create' ? 'Create New Pool' : 'Manage Pool'}
        </Heading>
        {action === 'create' && (
          <Text
            color='gray.3'
            w={{
              md: '65%',
              sm: '95%',
              xs: '95%',
            }}>
            Setting up a new pool to lend against borrowers with preferred
            length of duration and collateral factor ratio.
          </Text>
        )}
      </Box>

      <Flex
        borderRadius={24}
        mb='32px'
        flexDir={'column'}
        gap={'30px'}
        position={'relative'}>
        {/* collection */}
        <LoadingComponent
          loading={
            floorPriceLoading ||
            actionLoading ||
            configLoading ||
            ethLoading ||
            wethLoading
          }
          top={0}
        />
        <Wrapper stepIndex={1}>
          <Box pos={'relative'}>
            <Box
              display={{
                md: 'block',
                sm: 'none',
                xs: 'none',
              }}>
              <AsyncSelectCollection
                {...collectionSelectorProps}
                w='360px'
                disabledArr={process.env.DEV ? [] : collectionAddressWithPool}
                isDisabled={
                  action === 'edit' || actionLoading || isFromCampaign
                }
                value={selectCollection}
                onChange={(e: {
                  contractAddress: string
                  nftCollection: NftCollection
                }) => {
                  setSelectCollection(e)
                }}
              />
            </Box>

            <Box
              display={{
                md: 'none',
                sm: 'block',
                xs: 'block',
              }}
              mt='24px'>
              <AsyncSelectCollection
                {...collectionSelectorProps}
                isDisabled={action === 'edit'}
                value={selectCollection}
                disabledArr={collectionAddressWithPool}
                onChange={(e: {
                  contractAddress: string
                  nftCollection: NftCollection
                }) => {
                  setSelectCollection(e)
                }}
              />
            </Box>
            {!isEmpty(selectCollection) && (
              <Flex
                mt='4px'
                justify={'flex-end'}
                alignItems={'center'}
                fontSize={'14px'}
                fontWeight={'700'}
                color='gray.3'
                pos={'absolute'}
                right={0}>
                Current Floor Price
                <SvgComponent svgId='icon-eth' />
                {formatFloat(floorPrice)}
              </Flex>
            )}
          </Box>
        </Wrapper>
        {/* 贷款比例 collateral */}
        <Flex
          justify={'center'}
          flexDir={'column'}
          borderRadius={16}
          mb='24px'
          bg='gray.5'
          p={{
            md: '32px',
            sm: '12px',
            xs: '12px',
          }}>
          <StepDescription
            data={{
              step: 2,
              ...STEPS_DESCRIPTIONS[1],
            }}
            mb='16px'
          />
          <SecondaryWrapper
            title='Set max collateral factor'
            description={`It will determine the highest percentage of the single loan value against the valuation of the NFT collateral at the time of the transaction.\nIn case of borrower default, you can obtain collateral. It's equivalent to buying NFT at a discounted price based on the loan amount you provide.`}>
            <SliderWrapper
              unit='%'
              value={collateralKey}
              isDisabled={isBanban}
              svgId='icon-intersect'
              defaultValue={initialItems?.collateralKey}
              data={COLLATERAL_KEYS}
              min={COLLATERAL_KEYS[0]}
              max={COLLATERAL_KEYS[COLLATERAL_KEYS.length - 1]}
              step={1}
              label={`${(COLLATERAL_MAP.get(collateralKey) as number) / 100}`}
              onChange={(target) => {
                setCollateralKey(target)
              }}
            />
          </SecondaryWrapper>

          <SecondaryWrapper
            title='Set max single loan amount'
            description={`It will determine the max amount of single loan that borrowers can take against this lending offer.\nIn case of borrower default, you can obtain collateral. It's equivalent to buying NFT at a discounted price based on the loan amount you provide.`}>
            <Box>
              <TooltipComponent
                label={!!selectCollection ? '' : 'Please select collection'}>
                <InputGroup
                  w={{
                    md: '484px',
                    sm: '100%',
                    xs: '100%',
                  }}
                  pos={'relative'}>
                  <InputLeftElement
                    pointerEvents='none'
                    color='gray.300'
                    fontSize='1.2em'
                    top={{
                      md: '6px',
                      sm: '3px',
                      xs: '3px',
                    }}>
                    <SvgComponent
                      svgId='icon-eth'
                      fill={'black.1'}
                    />
                  </InputLeftElement>
                  <CustomNumberInput
                    isDisabled={!selectCollection || !floorPrice || isBanban}
                    value={singleCap || ''}
                    isInvalid={singleCapsInputStatus?.status === 'error'}
                    // lineHeight='60px'
                    placeholder='Please enter amount...'
                    onSetValue={(v) => setSingleCap(v)}
                    px={'32px'}
                    h='48px'
                  />

                  {singleCapsInputStatus?.status === 'error' && (
                    <InputRightElement
                      top={{
                        md: '6px',
                        sm: '4px',
                        xs: '4px',
                      }}
                      mr='4px'
                      pos={'absolute'}>
                      <SvgComponent
                        svgId='icon-error'
                        svgSize={'16px'}
                      />
                    </InputRightElement>
                  )}
                </InputGroup>
              </TooltipComponent>

              {!!singleCapsInputStatus && (
                <Text
                  mt='12px'
                  color={
                    singleCapsInputStatus?.status === 'error'
                      ? 'red.1'
                      : 'orange.1'
                  }
                  fontSize={'14px'}>
                  {singleCapsInputStatus.message}
                </Text>
              )}
            </Box>
          </SecondaryWrapper>
        </Flex>
        {/* supply caps */}
        <Flex
          justify={'center'}
          flexDir={'column'}
          borderRadius={16}
          mb='24px'
          bg='gray.5'
          p={{
            md: '32px',
            sm: '12px',
            xs: '12px',
          }}>
          <StepDescription
            data={{
              step: 3,
              ...STEPS_DESCRIPTIONS[2],
            }}
            mb='16px'
          />
          <Text
            fontSize={'14px'}
            fontWeight={'500'}
            lineHeight={'22px'}
            mb='16px'
            color={'gray.3'}
            pl='50px'>
            {supplyCapsStatus === undefined && (
              <chakra.span>
                Your Current WETH balance is&nbsp;
                {formatFloat(wei2Eth(wethData), 4, true)}, ETH balance is &nbsp;
                {formatFloat(wei2Eth(ethData), 4, true)}
              </chakra.span>
            )}
            {supplyCapsStatus === SUPPLY_CAPS_STATUS.BUY_MORE_ETH && (
              <chakra.span>
                Your Current WETH balance is&nbsp;
                {formatFloat(wei2Eth(wethData), 4, true)}, ETH balance is&nbsp;
                {formatFloat(wei2Eth(ethData), 4, true)}, you need to buy more
                ETH first and&nbsp;
                <chakra.span
                  textDecoration={'underline'}
                  onClick={() =>
                    openAccountModal(ACCOUNT_MODAL_TAB_KEY.SWAP_TAB)
                  }
                  cursor={'pointer'}
                  color={'blue.1'}>
                  Click Me
                </chakra.span>
                &nbsp;to Wrap more
              </chakra.span>
            )}
            {supplyCapsStatus === SUPPLY_CAPS_STATUS.WRAP_WETH && (
              <chakra.span>
                Your Current WETH balance is&nbsp;
                {formatFloat(wei2Eth(wethData), 4, true)}, ETH balance is&nbsp;
                {formatFloat(wei2Eth(ethData), 4, true)}, you can&nbsp;
                <chakra.span
                  onClick={() =>
                    openAccountModal(ACCOUNT_MODAL_TAB_KEY.SWAP_TAB)
                  }
                  cursor={'pointer'}
                  color={'blue.1'}
                  _hover={{
                    textDecoration: 'underline',
                  }}>
                  Click Me
                </chakra.span>
                &nbsp;to Wrap more
              </chakra.span>
            )}
            {supplyCapsStatus === SUPPLY_CAPS_STATUS.NORMAL && (
              <chakra.span>
                Your Current WETH Balance is&nbsp;
                {formatFloat(wei2Eth(wethData), 4, true)}
              </chakra.span>
            )}
          </Text>

          <Flex
            justify={'space-between'}
            alignItems={'center'}
            py='10px'>
            {!supplyCap || supplyCapsInputStatus?.status === 'error' ? (
              <Text
                fontSize={'16px'}
                fontWeight={'500'}
                lineHeight={'22px'}
                maxW={'600px'}
                pl='50px'>
                Supply Caps of All Pools:&nbsp;
                <SvgComponent
                  svgId='icon-eth'
                  svgSize={'16px'}
                  mt='1px'
                  display={'inline-block'}
                  as='span'
                />
                <chakra.span
                  fontSize={'20px'}
                  fontWeight={'700'}>
                  {formatFloat(wei2Eth(suggestCaps), 4, true)}
                </chakra.span>
              </Text>
            ) : (
              <Text
                fontSize={'16px'}
                fontWeight={'500'}
                lineHeight={'22px'}
                maxW={'600px'}
                pl='50px'>
                Based on the amount you have entered, we recommend maintaining a
                balance of&nbsp;
                <SvgComponent
                  svgId='icon-eth'
                  svgSize={'16px'}
                  display={'inline-block'}
                  as='span'
                />
                <chakra.span
                  fontSize={'20px'}
                  fontWeight={'700'}>
                  {formatFloat(wei2Eth(suggestCaps), 4, true)}
                </chakra.span>
                &nbsp; to fully support the supply caps across all pools.
              </Text>
            )}
            <Box>
              <TooltipComponent
                label={!!selectCollection ? '' : 'Please select collection'}>
                <InputGroup
                  w={{
                    md: '484px',
                    sm: '100%',
                    xs: '100%',
                  }}
                  position={'relative'}>
                  <InputLeftElement
                    pointerEvents='none'
                    color='gray.300'
                    fontSize='1.2em'
                    top={{
                      md: '6px',
                      sm: '3px',
                      xs: '3px',
                    }}>
                    <SvgComponent
                      svgId='icon-eth'
                      fill={'black.1'}
                    />
                  </InputLeftElement>
                  <Input
                    value={supplyCap || ''}
                    isInvalid={supplyCapsInputStatus?.status === 'error'}
                    placeholder={`Please Enter amount...(Min: ${formatFloat(
                      minSupplyCaps?.toNumber(),
                    )}WETH)`}
                    px={'32px'}
                    isDisabled={!floorPrice}
                    ref={inputRef}
                    w='100%'
                    errorBorderColor='red.1'
                    borderColor='gray.3'
                    _hover={{
                      borderColor: 'gray.3',
                    }}
                    type='number'
                    title=''
                    // @ts-ignore
                    onWheel={(e) => e.target.blur()}
                    onInput={(e: any) => {
                      const v = e.target.value as string
                      if (Number(v) < 0) {
                        setSupplyCap('')
                        return
                      }

                      if (Number(v) > 100000000) {
                        setSupplyCap(`100000000`)
                        return
                      }
                      setSupplyCap(
                        v.includes('.')
                          ? v.replace(/^(-)*(\\d+).(\\d{0,8}).*$/, '$1$2.$3')
                          : v,
                      )
                    }}
                    h={{
                      md: '48px',
                      sm: '42px',
                      xs: '42px',
                    }}
                    _focus={{
                      borderColor:
                        supplyCapsInputStatus?.status === 'error'
                          ? 'red.1'
                          : 'blue.1',
                    }}
                    _focusVisible={{
                      boxShadow: `0 0 0 1px var(--chakra-colors-${
                        supplyCapsInputStatus?.status === 'error'
                          ? 'red-1'
                          : 'blue-1'
                      })`,
                    }}
                    borderRadius={8}
                  />
                  {/* <CustomNumberInput
                    value={supplyCap || ''}
                    isInvalid={supplyCapsInputStatus?.status === 'error'}
                    placeholder={`Please Enter amount...(Min: ${formatFloat(
                      minSupplyCaps?.toNumber(),
                    )}WETH)`}
                    onSetValue={(v) => setSupplyCap(v)}
                    px={'32px'}
                    h={'48px'}
                    // isDisabled={!floorPrice}
                  /> */}

                  {supplyCapsInputStatus?.status === 'error' && (
                    <InputRightElement
                      top={{
                        md: '6px',
                        sm: '4px',
                        xs: '4px',
                      }}>
                      <SvgComponent
                        svgId='icon-error'
                        svgSize={'16px'}
                      />
                    </InputRightElement>
                  )}
                </InputGroup>
              </TooltipComponent>

              {!!supplyCapsInputStatus && (
                <Text
                  mt='4px'
                  color={
                    supplyCapsInputStatus?.status === 'error'
                      ? 'red.1'
                      : 'orange.1'
                  }
                  fontSize={'14px'}
                  position={'absolute'}>
                  {supplyCapsInputStatus.message}
                </Text>
              )}
            </Box>
          </Flex>
        </Flex>
        {/* 贷款天数 tenor */}
        <Wrapper stepIndex={4}>
          <SliderWrapper
            isDisabled={isBanban}
            unit={TENOR_MAP.get(tenorKey) === 1 ? 'day' : 'days'}
            value={tenorKey}
            defaultValue={initialItems?.tenorKey}
            data={TENOR_KEYS}
            svgId='icon-calendar'
            min={TENOR_KEYS[0]}
            max={TENOR_KEYS[TENOR_KEYS.length - 1]}
            step={1}
            label={`${(TENOR_MAP.get(tenorKey) as number) / 3600 / 24}`}
            onChange={(target) => {
              setTenorKey(target)
            }}
          />
        </Wrapper>
        {/* 贷款比率 */}
        <Wrapper stepIndex={5}>
          <SliderWrapper
            isDisabled={isBanban}
            unit='%'
            value={interestPowerKey}
            defaultValue={initialItems?.interestPowerKey}
            data={RATE_POWER_KEYS}
            min={RATE_POWER_KEYS[0]}
            max={RATE_POWER_KEYS[RATE_POWER_KEYS.length - 1]}
            step={1}
            label={`${baseRatePower.dividedBy(100).toFixed(2)}`}
            onChange={(target) => {
              setInterestPowerKey(target)
            }}
            svgId='icon-intersect'
          />
        </Wrapper>

        {/* 表格 */}
        <Box
          bg='gray.5'
          p={{
            md: '32px',
            sm: '0',
            xs: '0',
          }}
          borderRadius={16}
          pos={'relative'}>
          <Flex
            justify={'center'}
            mb={{
              md: '46px',
              sm: '20px',
              xs: '20px',
            }}
            fontSize={'18px'}
            fontWeight={'700'}>
            Generate the interest rate table for outstanding loans
          </Flex>
          <Box
            bg='white'
            w={{
              md: '90%',
              sm: '100%',
              xs: '100%',
            }}
            borderRadius={16}
            margin={'0 auto'}>
            <Flex>
              {[
                'Collateral Factor/ Tenor',
                ...currentTenors.map((i) =>
                  formatPluralUnit(i / 3600 / 24, 'Day'),
                ),
              ].map((item, i) => (
                <Flex
                  key={item}
                  w={`${(1 / (tenorKey + 1 || 1)) * 100}%`}
                  alignItems={'center'}
                  justify='center'
                  h={'40px'}
                  borderBottomColor='gray.2'
                  borderBottomWidth={1}>
                  <Text
                    textAlign={'center'}
                    fontSize='12px'
                    fontWeight={'bold'}
                    lineHeight='12px'
                    transform={{
                      md: 'none',
                      sm: `scale(${i !== 0 ? 0.83333 : 0.66666})`,
                      xs: `scale(${i !== 0 ? 0.83333 : 0.66666})`,
                    }}
                    transformOrigin='center'>
                    {item}
                  </Text>
                </Flex>
              ))}
            </Flex>
            {tableData.map((row, index) => {
              return (
                <Flex
                  /* eslint-disable */
                  key={index}
                  /* eslint-disable */
                  borderBottom={
                    index !== tableData?.length - 1
                      ? `1px solid var(--chakra-colors-gray-2)`
                      : 'none'
                  }>
                  {[currentCollaterals[index], ...row]?.map(
                    (value: BigNumber, i: number) => (
                      <Flex
                        /* eslint-disable */
                        key={i}
                        /* eslint-disable */
                        alignItems={'center'}
                        justify='center'
                        h={{
                          md: '40px',
                          sm: '35px',
                          xs: '35px',
                        }}
                        w={`${(1 / (tenorKey + 1 || 1)) * 100}%`}>
                        {i === 0 ? (
                          <Text
                            textAlign={'center'}
                            fontSize='12px'
                            fontWeight={'bold'}
                            color={'black.1'}
                            transform={{
                              md: 'none',
                              sm: 'scale(0.83333)',
                              xs: 'scale(0.83333)',
                            }}
                            transformOrigin='center'>
                            {Number(value) / 100}%
                          </Text>
                        ) : (
                          <ScrollNumber
                            value={`${value
                              .dividedBy(100)
                              .toFormat(2, BigNumber.ROUND_UP)}%`}
                            color={
                              i === row?.length &&
                              index === tableData?.length - 1
                                ? 'blue.1'
                                : 'gray.3'
                            }
                            fontWeight={
                              i === row?.length &&
                              index === tableData?.length - 1
                                ? '700'
                                : '500'
                            }
                          />
                        )}
                      </Flex>
                    ),
                  )}
                </Flex>
              )
            })}
          </Box>

          <Flex
            flexDir={'column'}
            alignItems='center'
            gap={'4px'}
            hidden={!showFlexibility}
            pos={'absolute'}
            right={{
              md: '32px',
              sm: '12px',
              xs: '12px',
            }}
            top={'50%'}
            transform={'translateY(-50%)'}>
            <Slider
              orientation='vertical'
              defaultValue={initialItems?.collateralFactorMultiplier}
              min={RATIO_POWER_KEYS[0]}
              max={RATIO_POWER_KEYS[RATIO_POWER_KEYS.length - 1]}
              h='132px'
              step={1}
              onChange={(target) => {
                setCollateralFactorMultiplier(target)
              }}>
              <SliderTrack bg={`gray.1`}>
                <SliderFilledTrack bg={`blue.1`} />
              </SliderTrack>
              <SliderThumb
                boxSize={'16px'}
                borderWidth={'2px'}
                borderColor={`blue.1`}
                _focus={{
                  boxShadow: 'none',
                }}
              />
            </Slider>
            <IconTip label='You can use this to adjust how much the interest rate is favorable as the collateral factor goes down.'></IconTip>
          </Flex>
          {/* 切换展示微调滑杆 */}
          <Flex
            justify={'center'}
            hidden={showFlexibility}
            onClick={toggleShowFlexibility}
            mt='20px'>
            <Button
              variant={'outline'}
              h='36px'
              bg='transparent'
              fontWeight={'500'}
              w='240px'
              isDisabled={isBanban}>
              Fine-tune interest rates
            </Button>
          </Flex>

          <Flex
            hidden={!showFlexibility}
            justify={'center'}
            mt='20px'>
            <Slider
              min={TERM_POWER_KEYS[0]}
              max={TERM_POWER_KEYS[TERM_POWER_KEYS.length - 1]}
              w='140px'
              step={1}
              defaultValue={initialItems?.tenorMultiplierKey}
              onChange={(target) => {
                setTenorMultiplierKey(target)
              }}>
              <SliderTrack bg={`gray.1`}>
                <SliderFilledTrack bg={`blue.1`} />
              </SliderTrack>
              <SliderThumb
                boxSize={'16px'}
                borderWidth={'2px'}
                borderColor={`blue.1`}
                _focus={{
                  boxShadow: 'none',
                }}
              />
            </Slider>
            <IconTip label='You can use this to adjust how much the interest rate is favorable as the loan tenor shortens.'></IconTip>
          </Flex>
        </Box>
      </Flex>

      <Flex
        justify={'center'}
        mb={'40px'}
        gap='20px'>
        <Button
          variant={'outline'}
          w='160px'
          h={{
            md: '52px',
            sm: '40px',
            xs: '40px',
          }}
          gap='4px'
          onClick={() => {
            navigate(-1)
          }}>
          {/* <SvgComponent svgId='icon-arrow' fill='blue.1' /> */}
          Back
        </Button>
        {action === 'create' && (
          <TooltipComponent label={createBtnDisabledData.label}>
            <Button
              variant={'primary'}
              w='240px'
              h={{
                md: '52px',
                sm: '40px',
                xs: '40px',
              }}
              onClick={handleCreate}
              isLoading={actionLoading}
              isDisabled={createBtnDisabledData.isDisabled}>
              Create Pool
            </Button>
          </TooltipComponent>
        )}
        {action === 'edit' && (
          <TooltipComponent label={updateBtnDisabledData.label}>
            <Button
              isDisabled={updateBtnDisabledData.isDisabled}
              variant={'primary'}
              w='240px'
              h={{
                md: '52px',
                sm: '40px',
                xs: '40px',
              }}
              isLoading={actionLoading}
              onClick={handleUpdate}>
              Confirm
            </Button>
          </TooltipComponent>
        )}
      </Flex>
      <ConnectWalletModal
        visible={isOpen}
        handleClose={onClose}
        closeable={false}
      />
      <AllowanceModal
        isOpen={allowanceModalVisible}
        onClose={closeAllowanceModal}
      />
    </LendLayout>
  )
}

export default Create
