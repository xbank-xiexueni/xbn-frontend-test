import {
  Box,
  Card,
  CardBody,
  CardFooter,
  type CardProps,
  Flex,
  Text,
  Button,
  ModalBody,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  type ImageProps,
  Modal,
  type FlexProps,
  Highlight,
  InputGroup,
  InputRightElement,
  Alert,
  AlertIcon,
  AlertDescription,
  AlertTitle,
  Divider,
  useToast,
} from '@chakra-ui/react'
import useHover from 'ahooks/lib/useHover'
import useRequest from 'ahooks/lib/useRequest'
import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import isEmpty from 'lodash-es/isEmpty'
import isEqual from 'lodash-es/isEqual'
import {
  useMemo,
  useState,
  type FunctionComponent,
  type ReactNode,
  useCallback,
  useRef,
  useEffect,
} from 'react'
import { useNavigate } from 'react-router-dom'

import {
  apiGetCollectionDetail,
  apiGetCollectionFees,
  apiGetFloorPrice,
  apiGetListings,
  apiGetLoans,
  apiPostListing,
} from '@/api'
import imgBlur from '@/assets/blur-logo.png'
import imgOpensea from '@/assets/opensea-logo.png'
import {
  CustomNumberInput,
  ImageWithFallback,
  NftTag,
  LoadingComponent,
  MortgagedTag,
  Select,
  SvgComponent,
} from '@/components'
import {
  FORMAT_NUMBER,
  OPENSEA_LIST_DURATION,
  UNIT,
  LISTING_TYPE,
  MODEL_HEADER_PROPS,
  BLUR_LIST_DURATION,
  MARKET_TYPE_ENUM,
} from '@/constants'
import { useIsMobile, useWallet } from '@/hooks'
import { formatFloat } from '@/utils/format'
import { wei2Eth } from '@/utils/unit-conversion'

export type ListDataType = {
  assetData?: {
    name?: string
    img?: string
  }
  contractData?: MyAssetListItemType
}
const DURATION_PROPS = {
  placeholder: 'Please select',
  h: '60px',
  borderColor: 'var(--chakra-colors-gray-4)',
  img: <SvgComponent svgId='icon-calendar' ml='12px' svgSize={'20px'} />,
  maxContentHeight: 240,
}

type CollectionDataType = {
  name: string
  safelistRequestStatus: string
  // creatorEarn: number
  // marketPlaceFee: number
  slug: string
}

type LoanDataType = {
  // 未偿贷款本金+利息 wei
  outstandingLoan?: BigNumber
  // 贷款结束的时间
  // loanEndedTime?: number
}

export type ListModalType = 'create' | 'cancel' | undefined

const NftInfoBox: FunctionComponent<
  FlexProps & {
    data?: ListDataType['assetData']
    price?: string
    collectionData?: CollectionDataType
  }
> = ({ data, price, collectionData, ...rest }) => {
  return (
    <Flex
      justify={'space-between'}
      py='24px'
      borderBottomColor={'gray.2'}
      borderBottomWidth={1}
      alignItems={'center'}
      w={{
        md: '486px',
        sm: '280px',
        xs: '280px',
      }}
      {...rest}
    >
      <Flex gap={'12px'} alignItems={'center'}>
        <ImageWithFallback
          src={data?.img}
          boxSize={'64px'}
          borderRadius={8}
          fit={'contain'}
        />
        <Box
          w={{
            md: '320px',
            sm: '100px',
            xs: '100px',
          }}
        >
          <Text fontSize={'20px'} fontWeight={'700'} noOfLines={1}>
            {data?.name}
          </Text>
          <Flex alignItems={'center'}>
            <Text fontSize={'14px'}>{collectionData?.name}</Text>
            {collectionData?.safelistRequestStatus === 'verified' && (
              <SvgComponent svgId='icon-verified-fill' />
            )}
          </Flex>
        </Box>
      </Flex>

      <Flex flexDir={'column'} alignItems={'flex-end'}>
        <Text color='gray.3' fontSize={'12px'}>
          Listing price
        </Text>
        <Text fontWeight={'700'}>
          {price ?? '--'}
          {UNIT}
        </Text>
      </Flex>
    </Flex>
  )
}

const Item: FunctionComponent<
  FlexProps & {
    label: string
    value: string | ReactNode
  }
> = ({ label, value, color = 'gray.3', fontWeight = '500', ...rest }) => {
  return (
    <Flex justify={'space-between'} {...rest}>
      <Text color={color} fontWeight={fontWeight}>
        {label}
      </Text>
      <Flex gap={'8px'}>
        {typeof value === 'string' ? (
          <Text color={color} fontWeight={fontWeight} noOfLines={1}>
            {value}
          </Text>
        ) : (
          value
        )}
      </Flex>
    </Flex>
  )
}

// 目前还不知道怎么获取
const gas = 0

const MyAssetNftListCard: FunctionComponent<
  {
    data: ListDataType
    imageSize: ImageProps['boxSize']
    onRefreshList: () => void
  } & CardProps
> = ({ data, onRefreshList, imageSize, ...rest }) => {
  const { assetData, contractData } = data
  const { currentAccount, isConnected } = useWallet()
  const navigate = useNavigate()
  const toast = useToast()

  const ish5 = useIsMobile()

  // loan_status: 0 表示资产的贷款还未还清，1 表示完全拥有的（贷款已还清或者通过其它途径购买的）
  const isMortgaged = useMemo(() => contractData?.mortgaged, [contractData])

  const isListing = useMemo(
    () => contractData?.listed_with_mortgage,
    [contractData],
  )

  const title = useMemo(() => {
    const unFormatName = assetData?.name || ''
    if (ish5) {
      const isLonger = unFormatName?.length > 20
      return isLonger ? `${unFormatName.substring(0, 20)}...` : unFormatName
    }
    return `${unFormatName}`
  }, [assetData, ish5])

  const [type, setType] = useState<ListModalType>()
  const [listPlatform, setListPlatform] = useState<MARKET_TYPE_ENUM>(
    MARKET_TYPE_ENUM.BLUR,
  )
  const closeModal = useCallback(() => setType(undefined), [])

  const [price, setPrice] = useState<string>('')

  const [durationValue, setDurationValue] = useState<{
    label: string
    value: number
  } | null>(null)
  const [collectionData, setCollectionData] = useState<CollectionDataType>()
  const [loanData, setLoanData] = useState<LoanDataType>()
  const [lastCancelDiffTime, setLastCancelDiffTime] = useState<number>(Infinity)

  useEffect(() => {
    if (type === 'cancel') return
    setPrice('')
    setDurationValue(null)
    setListPlatform(MARKET_TYPE_ENUM.BLUR)
  }, [type])
  const { loading: getListingLoading } = useRequest(
    () =>
      apiGetListings({
        borrower_address: currentAccount?.address || '',
        token_id: contractData?.token_id || '',
        contract_address: contractData?.asset_contract_address || '',
        type: 2,
        status: 4096,
      }),
    {
      ready: type === 'cancel' && !!contractData,
      onSuccess(lData) {
        if (!lData || !lData?.length) {
          setLastCancelDiffTime(Infinity)
          return
        }
        const latestCancelDate = lData[0].updated_at
        const diff = dayjs().diff(dayjs(latestCancelDate), 'minutes')
        setLastCancelDiffTime(diff)
      },
      onError() {
        setLastCancelDiffTime(Infinity)
      },

      refreshDeps: [isConnected, contractData],
    },
  )

  const {
    loading: collectionFeesLoading,
    data: collectionFeesData,
    error: collectionFeesError,
  } = useRequest(
    () =>
      apiGetCollectionFees({
        slug: collectionData?.slug || '',
      }),
    {
      ready: !!type && !!collectionData,
    },
  )

  const {
    loading: collectionLoading,
    error: collectionError,
    refresh: refreshCollection,
  } = useRequest(apiGetCollectionDetail, {
    defaultParams: [
      {
        assetContractAddresses: [contractData?.asset_contract_address || ''],
      },
    ],
    ready: !!assetData && !!type,
    onSuccess({ data: cData }) {
      const { nftCollectionsByContractAddresses } = cData

      if (!nftCollectionsByContractAddresses?.length) return
      const currentCollection = nftCollectionsByContractAddresses[0]
      const {
        nftCollection: {
          name,
          safelistRequestStatus,
          // fees,
          slug,
          // isCreatorFeesEnforced,
        },
      } = currentCollection
      /**
       * isCreatorFeesEnforced
       * true => 不允许修改 => 则展示接口传过来的值；
       * false => 允许修改=> 则不管接口读取有没有具体值，都将Creator earnings改为0；
       */
      // const _sellerFee = reduce(
      //   fees?.filter((i) => i.name === 'seller_fees'),
      //   (sum, value) => sum + value.value,
      //   0,
      // )
      // const sellerFee = !!isCreatorFeesEnforced ? _sellerFee : 0

      // // const sellerFee = fees?.find((i) => i.name === 'seller_fees')?.value || 0
      // const marketPlaceFee =
      //   fees?.find((i) => i.name === 'opensea_fees')?.value || 0
      setCollectionData({
        name,
        safelistRequestStatus,
        // creatorEarn: sellerFee / 10000,
        // marketPlaceFee: marketPlaceFee / 10000,
        slug,
      })
    },
  })

  const {
    data: floorPrice,
    loading: floorPriceLoading,
    refresh: refreshFloorPrice,
  } = useRequest(
    () =>
      apiGetFloorPrice({
        slug: collectionData?.slug || '',
      }),
    {
      ready: !!collectionData && type === 'create',
      refreshDeps: [collectionData],
      // cacheKey: `staleTime-floorPrice-${collectionData?.slug}`,
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

  const {
    loading: loanLoading,
    error: loanError,
    refresh: refreshLoan,
  } = useRequest(apiGetLoans, {
    ready: !!assetData && type === 'create',
    defaultParams: [
      {
        borrower: currentAccount?.address || '',
        collateral_contract: contractData?.asset_contract_address,
        token_id: contractData?.token_id,
      },
    ],
    debounceWait: 100,
    onSuccess(lData) {
      if (!lData || !lData?.length) {
        setLoanData({})
        return
      }
      const currentLoan = lData.find((i) => i.status === 1)
      if (!currentLoan) {
        setLoanData({})
        return
      }
      const {
        each_payment,
        number_of_installments,
        outstanding_principal,
        loan_amount,
      } = currentLoan

      /**
       * 未偿贷款本金+所有期利息
       * outstanding_principal + (eachPayment * numberOfInstallments - loanAmount)
       */
      const totalInterest = BigNumber(each_payment)
        .multipliedBy(number_of_installments)
        .minus(loan_amount)
      const unFormatLoanEth = wei2Eth(totalInterest.plus(outstanding_principal))

      setLoanData({
        outstandingLoan:
          !!unFormatLoanEth && unFormatLoanEth !== undefined
            ? BigNumber(unFormatLoanEth)
            : BigNumber(0),
        // loanEndedTime: loan_start_time + loan_duration,
      })
    },
  })
  const fetchInfoLoading = useMemo(
    () =>
      collectionLoading ||
      loanLoading ||
      getListingLoading ||
      floorPriceLoading ||
      collectionFeesLoading,
    [
      collectionLoading,
      collectionFeesLoading,
      loanLoading,
      getListingLoading,
      floorPriceLoading,
    ],
  )

  const durationOptions = useMemo(() => {
    if (type !== 'create') return []
    if (listPlatform === MARKET_TYPE_ENUM.BLUR) return BLUR_LIST_DURATION
    if (listPlatform === MARKET_TYPE_ENUM.OPENSEA) return OPENSEA_LIST_DURATION
    return []
    // if (!loanData?.loanEndedTime) return OPENSEA_LIST_DURATION
    // const { loanEndedTime } = loanData
    // // 计算贷款结束时间距离当前的天数差，可选 duration 只能小于等于这个天数差
    // // const diff = round(
    // //   (loanEndedTime - dayjs(new Date()).unix()) / 60 / 60 / 24,
    // // )
    // const loanEnded = unix(loanEndedTime)
    // const diff = loanEnded.diff(dayjs(), 'days', true)
    // if (diff < 0) return []
    // const index = LIST_DURATION.findIndex((i) => {
    //   return i > diff
    // })
    // return LIST_DURATION.slice(0, index)
  }, [type, listPlatform])

  const currentPlatformFees = useMemo(() => {
    if (!collectionFeesData) return
    const {
      fees: { BLUR, OPENSEA },
    } = collectionFeesData
    switch (listPlatform) {
      case MARKET_TYPE_ENUM.BLUR:
        return {
          marketPlaceFee: BigNumber(0),
          creatorEarn: BigNumber(BLUR?.minimumRoyaltyBips).dividedBy(10000),
        }

      case MARKET_TYPE_ENUM.OPENSEA:
        return {
          marketPlaceFee: BigNumber(OPENSEA?.platformBips).dividedBy(10000),
          creatorEarn: BigNumber(OPENSEA?.minimumRoyaltyBips).dividedBy(10000),
        }

      default:
        return
    }
  }, [listPlatform, collectionFeesData])

  /**
   *
   * 拉取当前最低地板价、最高地板价，给用户作为输入的参考
   * 可输入的最小金额： 这个抵押品对应 loan 的“未偿贷款本金+利息”/(1-服务费-用户输入的版税）+ 预估清算所需的 gas 费
   * 输入的金额低于地板价，但是不低于可输入的最小金额，给与橙色提醒
   * 输入的金额低于可输入的最小金额，按钮置灰，不可提交挂单
   * 用户挂单需要支付gas费，挂单之后修改条件或撤销挂单，需要再次支付gas费
   */
  const minInput = useMemo(() => {
    if (type !== 'create') return
    if (!loanData?.outstandingLoan) return
    if (!currentPlatformFees) return
    const { outstandingLoan } = loanData
    const { marketPlaceFee, creatorEarn } = currentPlatformFees

    const res =
      outstandingLoan
        .dividedBy(BigNumber(1).minus(marketPlaceFee).minus(creatorEarn))
        .plus(gas) || BigNumber(0)

    return res
  }, [loanData, currentPlatformFees, type])

  // list amount 需要大于最小可输入值
  const isAmountError = useMemo(
    () => !!price && !!minInput && minInput?.gt(price),
    [minInput, price],
  )

  // total potential earning
  const potentialEarns = useMemo(() => {
    if (type !== 'create') return
    if (!price || !currentPlatformFees || !loanData?.outstandingLoan) return
    const { creatorEarn, marketPlaceFee } = currentPlatformFees
    const { outstandingLoan } = loanData
    const listPrice = BigNumber(price)
    return listPrice
      .multipliedBy(BigNumber(1).minus(creatorEarn).minus(marketPlaceFee))
      .minus(outstandingLoan)
      .toFormat(8, BigNumber.ROUND_UP)
  }, [price, currentPlatformFees, loanData, type])

  const ref = useRef(null)
  const isHovering = useHover(ref)

  const show = useMemo(() => isHovering || ish5, [ish5, isHovering])

  const isChanged = useMemo(() => {
    if (type === 'cancel') return true
    return !isEqual(
      {},
      {
        price,
        durationValue,
      },
    )
  }, [price, durationValue, type])

  const { runAsync, loading: listingLoading } = useRequest(apiPostListing, {
    manual: true,
  })

  const handleListing = useCallback(async () => {
    try {
      if (
        !contractData ||
        !durationValue ||
        !price ||
        !currentAccount ||
        !currentPlatformFees
      )
        return
      const expiration_time = dayjs().add(durationValue.value, 'seconds').unix()
      // create list
      const POST_PARAMS = {
        type: LISTING_TYPE.LISTING,
        platform: listPlatform,
        contract_address: contractData?.asset_contract_address,
        token_id: contractData?.token_id,
        network: 'eth',
        currency: 'eth',
        qty: Number(contractData?.qty),
        price,
        expiration_time,
        borrower_address: currentAccount.address,
        royalty: currentPlatformFees?.creatorEarn
          .multipliedBy(10000)
          .toNumber(),
      }
      await runAsync(POST_PARAMS)
      navigate('/complete', {
        state: {
          imageUrl: assetData?.img,
        },
      })
    } catch (error: any) {
      const {
        error: { code: errorCode, message: errorMessage },
      } = error
      if (
        errorCode === 'business_error' &&
        errorMessage?.startsWith('1 listing cancellations exists for')
      ) {
        toast({
          title:
            'Cancel listing has not been completed, please do this operation later.',
          status: 'info',
          isClosable: true,
          id: 'request-error-toast',
        })
      } else if (
        errorCode === 'business_error' &&
        errorMessage?.startsWith('1 listings exists for')
      ) {
        toast({
          title:
            'Listing has not been completed, please do this operation later.',
          status: 'info',
          isClosable: true,
          id: 'request-error-toast',
        })
      } else {
        toast({
          status: 'error',
          duration: 5000,
          description: errorMessage || 'Oops, something went wrong',
        })
      }
    }
  }, [
    contractData,
    runAsync,
    durationValue,
    price,
    currentAccount,
    assetData,
    navigate,
    listPlatform,
    toast,

    currentPlatformFees,
  ])

  const handleCancelList = useCallback(async () => {
    try {
      if (!contractData || !currentAccount || !currentPlatformFees) return
      // create list
      const POST_PARAMS = {
        type: LISTING_TYPE.CANCEL,
        platform: listPlatform,
        contract_address: contractData?.asset_contract_address,
        token_id: contractData?.token_id,
        network: 'eth',
        currency: 'eth',
        qty: Number(contractData?.qty),
        borrower_address: currentAccount.address,
        royalty: currentPlatformFees?.creatorEarn
          .multipliedBy(10000)
          .toNumber(),
      }
      await runAsync(POST_PARAMS)
      closeModal()
      onRefreshList()
      toast({
        status: 'success',
        title: 'Cancel successfully',
      })
    } catch (error: any) {
      toast({
        status: 'error',
        duration: 5000,
        description: error?.error?.message,
      })
    }
  }, [
    runAsync,
    listPlatform,
    onRefreshList,
    contractData,
    currentAccount,
    toast,
    closeModal,
    currentPlatformFees,
  ])

  const nftError = useMemo(() => {
    return (
      !!loanError ||
      !!collectionError ||
      !!collectionFeesError ||
      (!!loanData && isEmpty(loanData))
    )
  }, [loanData, loanError, collectionError, collectionFeesError])

  const handleTogglePlatform = useCallback(
    (target: MARKET_TYPE_ENUM) => {
      if (listPlatform === target) return
      setListPlatform(target)
      setDurationValue(null)
      setPrice('')
    },
    [listPlatform],
  )

  return (
    <>
      <Card
        _hover={{
          boxShadow: `var(--chakra-colors-gray-2) 0px 0px 3px`,
        }}
        cursor='pointer'
        borderRadius={16}
        w='100%'
        h={'100%'}
        boxShadow='none'
        borderColor={'gray.2'}
        borderWidth='1px'
        ref={ref}
        {...rest}
      >
        <CardBody p={0} border='none'>
          <Box
            bg={'white'}
            borderTopRadius={16}
            overflow='hidden'
            pos={'relative'}
            w='100%'
          >
            <ImageWithFallback
              src={assetData?.img}
              borderRadius={0}
              alt={title}
              boxSize={imageSize}
              fit='cover'
              transition='all 0.6s'
              _hover={{
                transform: `scale(1.2)`,
              }}
            />
            {isListing &&
            contractData?.list_price !== undefined &&
            !!contractData?.list_platform ? (
              <NftTag
                display={'inline-flex'}
                justifyContent={'center'}
                alignItems={'center'}
                gap={'4px'}
              >
                <ImageWithFallback
                  preview={false}
                  src={
                    contractData.list_platform === 'blur' ? imgBlur : imgOpensea
                  }
                  boxSize={'20px'}
                />
                {BigNumber(contractData.list_price || '').toFormat(4)} {UNIT}
                &nbsp;Listing
              </NftTag>
            ) : null}
          </Box>

          <Flex
            h={'68px'}
            justify='space-between'
            px='16px'
            alignItems={'center'}
            flexWrap={{
              md: 'nowrap',
              sm: 'wrap',
              xs: 'wrap',
            }}
            pos={'relative'}
          >
            <Text
              fontSize={{
                lg: '18px',
                md: '16px',
                sm: '16px',
                xs: '16px',
              }}
              fontWeight={'bold'}
              w={
                !isMortgaged
                  ? '100%'
                  : { xl: '70%', lg: '55%', md: '40%', sm: '100%', xs: '100%' }
              }
              noOfLines={2}
              lineHeight={'22px'}
            >
              {title}
            </Text>

            {isMortgaged && (
              <MortgagedTag
                pos={{
                  md: 'static',
                  sm: 'absolute',
                  xs: 'absolute',
                }}
                right={0}
                bottom={'6px'}
              />
            )}
          </Flex>
        </CardBody>

        <Button
          borderRadius={16}
          hidden={!isMortgaged}
          borderTopLeftRadius={0}
          borderTopRightRadius={0}
          bg='blue.1'
          color='white'
          _hover={{
            opacity: 1,
            bg: 'blue.1',
            color: 'white',
          }}
          h={
            show
              ? {
                  lg: '56px',
                  md: '48px',
                  sm: '36px',
                  xs: '36px',
                }
              : '0'
          }
          position='absolute'
          bottom={0}
          right={0}
          left={0}
          transition='all 0.15s'
          onClick={() => {
            if (isListing) {
              // 正在 listing 中
              setType('cancel')
              if (contractData?.list_platform)
                setListPlatform(contractData.list_platform)
              return
            }
            setType('create')
            setListPlatform(MARKET_TYPE_ENUM.BLUR)
          }}
        >
          {show && !isListing && 'List for sale'}
          {show && isListing && 'Cancel'}
        </Button>

        <CardFooter
          h={{
            lg: '56px',
            md: '48px',
            sm: '36px',
            xs: '36px',
          }}
          justify={'center'}
          alignItems='center'
          borderBottomRadius={16}
        />
      </Card>
      {/* create & cancel list modal */}
      <Modal
        onClose={closeModal}
        isOpen={!!type}
        isCentered
        scrollBehavior='inside'
      >
        <ModalOverlay bg='black.2' />
        <ModalContent
          maxW={{
            md: '576px',
            sm: '326px',
            xs: '326px',
          }}
          maxH={'calc(100% - 5.5rem)'}
          borderRadius={16}
        >
          <LoadingComponent
            loading={fetchInfoLoading}
            top={0}
            borderRadius={0}
          />

          <ModalHeader {...MODEL_HEADER_PROPS}>
            {type === 'create' && 'List item'}
            {type === 'cancel' && 'Cancel Listing'}
            <SvgComponent
              svgId='icon-close'
              onClick={closeModal}
              cursor={'pointer'}
            />
          </ModalHeader>
          {/* 获取失败，阻止进行下一步 */}
          {type === 'cancel' && (
            <ModalBody
              m={0}
              p={0}
              px={{
                md: '40px',
                sm: '20px',
                xs: '20px',
              }}
            >
              <NftInfoBox
                data={assetData}
                price={
                  contractData?.list_price
                    ? BigNumber(contractData?.list_price).toFormat(8)
                    : '--'
                }
                collectionData={collectionData}
              />
              <Divider />
              <Text my='24px' fontWeight={'700'}>
                You can only cancel the list once within 10 minutes
              </Text>
              {/* button */}
              <Flex
                pt='12px'
                px={{
                  md: '40px',
                  sm: '20px',
                  xs: '20px',
                }}
                pb={{
                  md: '40px',
                  sm: '20px',
                  xs: '20px',
                }}
                position={'sticky'}
                bottom={'0px'}
                bg='white'
                mt='8px'
              >
                <Button
                  w='100%'
                  h={{
                    md: '52px',
                    sm: '40px',
                    xs: '40px',
                  }}
                  isDisabled={lastCancelDiffTime < 10}
                  isLoading={listingLoading}
                  variant='primary'
                  px='30px'
                  onClick={handleCancelList}
                >
                  Cancel
                  {lastCancelDiffTime < 10 &&
                    `(after ${10 - lastCancelDiffTime} minutes)`}
                </Button>
              </Flex>
            </ModalBody>
          )}
          {type === 'create' && (
            <ModalBody
              m={0}
              p={0}
              px={{
                md: '40px',
                sm: '20px',
                xs: '20px',
              }}
            >
              {nftError ? (
                <Flex px='40px' pb='40px'>
                  <Alert
                    px={'40px'}
                    status='error'
                    variant='subtle'
                    flexDirection='column'
                    alignItems='center'
                    justifyContent='center'
                    textAlign='center'
                    height='200px'
                  >
                    <AlertIcon boxSize='40px' mr={0} />
                    <AlertTitle mt={4} mb={1} fontSize='lg'>
                      Error, the current loan does not exist
                    </AlertTitle>
                    <Flex>
                      <AlertDescription maxWidth='sm'>
                        Please refresh and try again.
                      </AlertDescription>
                      <SvgComponent
                        svgId='icon-refresh'
                        onClick={() => {
                          if (fetchInfoLoading) return
                          refreshCollection()
                          refreshLoan()
                          refreshFloorPrice()
                        }}
                        animation={
                          fetchInfoLoading ? 'loading 1s linear infinite' : ''
                        }
                        cursor={'pointer'}
                        svgSize='20px'
                      />
                    </Flex>
                  </Alert>
                </Flex>
              ) : (
                <Box hidden={!fetchInfoLoading && !loanData}>
                  {/* nft info */}
                  <NftInfoBox
                    data={assetData}
                    price={price}
                    collectionData={collectionData}
                  />
                  {/* inputs */}
                  <Flex
                    flexDir={'column'}
                    py='24px'
                    borderBottomColor={'gray.2'}
                    borderBottomWidth={1}
                  >
                    <Text fontWeight={'700'} mb='16px'>
                      Listing to
                    </Text>
                    <Flex gap={'8px'} mb='16px'>
                      {[
                        {
                          name: 'Blur',
                          key: MARKET_TYPE_ENUM.BLUR,
                          icon: imgBlur,
                        },
                        {
                          name: 'OpenSea',
                          key: MARKET_TYPE_ENUM.OPENSEA,
                          icon: imgOpensea,
                        },
                      ].map(({ icon, name, key }) => (
                        <Flex
                          cursor={'pointer'}
                          alignItems={'center'}
                          gap={'8px'}
                          key={key}
                          flex={1}
                          px='16px'
                          py='10px'
                          borderRadius={8}
                          borderWidth={1}
                          onClick={() => {
                            handleTogglePlatform(key)
                          }}
                          borderColor={
                            listPlatform === key
                              ? 'blue.1'
                              : 'rgba(0, 0, 0, 0.20)'
                          }
                          color={listPlatform === key ? 'blue.1' : 'gray.3'}
                          fontSize={'14px'}
                          fontWeight={'500'}
                        >
                          <ImageWithFallback
                            src={icon}
                            boxSize={'20px'}
                            preview={false}
                          />
                          {name}
                        </Flex>
                      ))}
                    </Flex>
                    {/* Set a price */}
                    <Box>
                      <Text fontWeight={'700'} mb='16px'>
                        Set a price
                      </Text>
                      {/* 快速填充 */}
                      {floorPrice !== undefined && (
                        <Flex
                          gap={'8px'}
                          mb='16px'
                          flexWrap={{
                            md: 'nowrap',
                            sm: 'wrap',
                            xs: 'wrap',
                          }}
                        >
                          {[
                            floorPrice,
                            // collectionData?.maxFloorPrice,
                          ].map((item) => (
                            <Flex
                              justify={'center'}
                              key={item}
                              bg={
                                price === item.toString() ? 'gray.5' : 'white'
                              }
                              borderColor={'rgba(0, 0, 0, 0.2)'}
                              borderWidth={1}
                              borderRadius={8}
                              py={{ md: '20px', sm: '12px', xs: '12px' }}
                              w='100%'
                              lineHeight={'18px'}
                              cursor={'pointer'}
                              _hover={{
                                bg: 'gray.5',
                              }}
                              onClick={() => setPrice(item.toString())}
                            >
                              <Highlight
                                query={['Floor', 'Top attribute']}
                                styles={{
                                  color: 'blue.1',
                                  fontWeight: '700',
                                  marginRight: '8px',
                                }}
                              >
                                {`Floor ${item} ${UNIT}`}
                              </Highlight>
                            </Flex>
                          ))}
                        </Flex>
                      )}

                      {/* input */}
                      <InputGroup mb='16px'>
                        <CustomNumberInput
                          onSetValue={(v) => setPrice(v)}
                          value={price}
                          isInvalid={isAmountError}
                        />

                        {isAmountError && (
                          <InputRightElement mr='110px' h='60px'>
                            <SvgComponent
                              svgId='icon-tip'
                              svgSize='24px'
                              fill={'red.1'}
                            />
                          </InputRightElement>
                        )}
                        <InputRightElement
                          bg='gray.5'
                          h={{
                            md: '57px',
                            sm: '40px',
                            xs: '40px',
                          }}
                          borderRightRadius={8}
                          borderColor={isAmountError ? 'red.1' : 'gray.4'}
                          borderWidth={0}
                          pr={{
                            md: '70px',
                            sm: '50px',
                            xs: '50px',
                          }}
                          pl='32px'
                          top={'1.5px'}
                          right={'1px'}
                          fontWeight={'700'}
                        >
                          {UNIT}
                        </InputRightElement>
                      </InputGroup>

                      {isAmountError && !!minInput && (
                        <Text
                          my='16px'
                          flexDir={'column'}
                          color='red.1'
                          fontSize={'14px'}
                          fontWeight={'500'}
                        >
                          Min input:&nbsp;
                          {minInput.toFormat(FORMAT_NUMBER)}
                          <br />
                          Price cannot be less than the outstanding loan amount
                        </Text>
                      )}
                      {floorPrice !== undefined &&
                        price !== '' &&
                        Number(price) < Number(floorPrice) &&
                        !isAmountError && (
                          <Flex
                            my='16px'
                            color='orange.1'
                            fontSize={'14px'}
                            fontWeight={'500'}
                            alignItems={'center'}
                            lineHeight={'24px'}
                          >
                            <SvgComponent
                              svgId='icon-tip'
                              fill={'orange.1'}
                              svgSize='16px'
                            />
                            Price is below collection floor price of&nbsp;
                            {floorPrice}
                            {UNIT}
                          </Flex>
                        )}
                    </Box>
                    {/* Duration */}
                    <Box>
                      <Text fontWeight={'700'} mb='16px'>
                        Duration
                      </Text>
                      <Box
                        display={{
                          md: 'block',
                          sm: 'none',
                          xs: 'none',
                        }}
                      >
                        <Select
                          {...DURATION_PROPS}
                          onChange={(e: any) => setDurationValue(e)}
                          value={durationValue}
                          options={durationOptions}
                        />
                      </Box>
                      <Box
                        display={{
                          md: 'none',
                          sm: 'block',
                          xs: 'block',
                        }}
                      >
                        <Select
                          {...DURATION_PROPS}
                          h='42px'
                          onChange={(e: any) => setDurationValue(e)}
                          value={durationValue}
                          options={durationOptions}
                          isClearable
                        />
                      </Box>

                      {/* 换算美元 */}
                      {/* <Text
                fontSize={'14px'}
                fontWeight={'500'}
                mt='12px'
                color='gray.3'
              >
                $10000 Total
              </Text> */}
                    </Box>
                  </Flex>

                  {/* price summary */}
                  <Flex flexDir={'column'} gap={'12px'} py='24px'>
                    <Item
                      label='Listing price'
                      value={`${price ?? '--'} ${UNIT}`}
                    />
                    <Item
                      label='Creator earnings'
                      value={`${
                        currentPlatformFees
                          ? formatFloat(
                              currentPlatformFees?.creatorEarn.multipliedBy(
                                100,
                              ),
                            )
                          : '---'
                      }%`}
                    />
                    <Item
                      label='Market Place Fee'
                      value={
                        !currentPlatformFees ? (
                          '---%'
                        ) : (
                          <Text
                            color={
                              currentPlatformFees?.marketPlaceFee.eq(0)
                                ? 'green.1'
                                : 'black.1'
                            }
                            fontWeight={'700'}
                          >
                            {formatFloat(
                              currentPlatformFees?.marketPlaceFee.multipliedBy(
                                100,
                              ),
                            )}
                            %
                          </Text>
                        )
                      }
                    />
                    <Item
                      label='Total potential earnings'
                      value={`${
                        !potentialEarns || isAmountError
                          ? '---'
                          : potentialEarns
                      } ${UNIT}`}
                      color={'black.1'}
                      fontWeight={'700'}
                    />
                  </Flex>

                  {/* button */}
                  <Flex
                    pt='12px'
                    px={{
                      md: '40px',
                      sm: '20px',
                      xs: '20px',
                    }}
                    pb={{
                      md: '40px',
                      sm: '20px',
                      xs: '20px',
                    }}
                    position={'sticky'}
                    bottom={'0px'}
                    bg='white'
                  >
                    <Button
                      onClick={handleListing}
                      variant={'primary'}
                      w='100%'
                      h={{
                        md: '52px',
                        sm: '40px',
                        xs: '40px',
                      }}
                      isDisabled={
                        !durationValue || !isChanged || !price || isAmountError
                      }
                      isLoading={listingLoading}
                    >
                      Complete listing
                    </Button>
                  </Flex>
                </Box>
              )}
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default MyAssetNftListCard
