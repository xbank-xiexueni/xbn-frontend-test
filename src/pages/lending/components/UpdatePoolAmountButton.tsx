import {
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  Button,
  ModalHeader,
  FormControl,
  FormLabel,
  Text,
  type ButtonProps,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  Flex,
  useToast,
} from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import BigNumber from 'bignumber.js'
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type FunctionComponent,
} from 'react'
import { useSignTypedData } from 'wagmi'

import { apiGetFloorPrice, apiGetPoolsTypedData, apiPutPool } from '@/api'
import {
  ConnectWalletModal,
  CustomNumberInput,
  LoadingComponent,
  SvgComponent,
  TooltipComponent,
} from '@/components'
import { MIN_LOAN_COUNT } from '@/constants'
import { useWallet } from '@/hooks'
import {
  formatBigNum2Str,
  formatFloat,
  formatTypedSignData,
} from '@/utils/format'
import { eth2Wei, wei2Eth } from '@/utils/unit-conversion'

import AmountItem from './AmountItem'

/**
 * update pool amount
 */
const UpdatePoolAmountButton: FunctionComponent<
  ButtonProps & {
    poolData: PoolsListItemType
    collectionSlug: string
    onSuccess: () => void
  }
> = ({
  children,
  poolData,
  collectionSlug,
  onSuccess: onSuccessUpdate,
  ...rest
}) => {
  const {
    supply_used = 0,
    supply_cap,
    single_cap,
    max_collateral_factor,
    max_tenor,
    max_interest_rate,
    collateral_factor_multiplier,
    tenor_multiplier,
    collateral_contract,
    owner,
    currency,
  } = poolData

  const toast = useToast()
  const {
    interceptFn,
    isOpen,
    onClose,
    accountConfig: {
      wethConfig: { data: wethData, loading: refreshLoading },
    },
  } = useWallet()
  const {
    isOpen: isOpenUpdate,
    onOpen: onOpenUpdate,
    onClose: onCloseUpdate,
  } = useDisclosure()
  const { signTypedDataAsync, isLoading: signLoading } = useSignTypedData()

  const { runAsync: runGetPoolTypedData, loading: signDataLoading } =
    useRequest(apiGetPoolsTypedData, {
      manual: true,
    })
  const { runAsync: runPutPoolAsync, loading: updateLoading } = useRequest(
    apiPutPool,
    {
      manual: true,
    },
  )

  const { loading, data: floorPrice } = useRequest(apiGetFloorPrice, {
    ready: !!collectionSlug && isOpenUpdate,
    // cacheKey: 'staleTime-floorPrice',
    // staleTime: 1000 * 60,
    defaultParams: [
      {
        slug: collectionSlug,
      },
    ],
    refreshDeps: [collectionSlug, isOpenUpdate],
    onError: () => {
      toast({
        title: 'Network problems, please refresh and try again',
        status: 'error',
        duration: 3000,
      })
    },
  })

  const [amount, setAmount] = useState('')

  const initialRef = useRef(null)
  const finalRef = useRef(null)

  const AmountDataItems = useMemo(
    () => [
      {
        data: formatFloat(wei2Eth(BigNumber(supply_cap).minus(supply_used))),
        label: 'Current Supply Caps',
        loading: false,
      },
      {
        data: floorPrice
          ? formatFloat(
              BigNumber(max_collateral_factor)
                .multipliedBy(floorPrice)
                .multipliedBy(3)
                .dividedBy(10000)
                .toString(),
            )
          : 0,
        label: 'Three Loans Require',
        loading,
      },
      {
        data: formatFloat(wei2Eth(wethData)),
        label: 'WETH Current Balance',
        loading: refreshLoading,
      },
    ],
    [
      supply_cap,
      supply_used,
      wethData,
      floorPrice,
      loading,
      refreshLoading,
      max_collateral_factor,
    ],
  )

  const minSupplyCaps = useMemo(() => {
    if (floorPrice === undefined) return
    return BigNumber(floorPrice)
      .multipliedBy(max_collateral_factor)
      .dividedBy(10000)
  }, [floorPrice, max_collateral_factor])

  const poolAmountStatus = useMemo(() => {
    if (amount === '') return
    if (amount === wei2Eth(supply_cap)?.toString()) {
      return {
        status: 'error',
        message: `current supply caps is already ${amount}`,
      }
    }
    const NumberAmount = Number(amount)
    if (!NumberAmount) {
      return {
        status: 'error',
        message: `invalid input`,
      }
    }

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
  }, [amount, minSupplyCaps, supply_cap])

  /**
   * 1. message = get /api/nonce
   * 2. signature = wallet sign(message)
   * 3. post /api/pool(offer, signature)
   */
  const handleUpdate = useCallback(async () => {
    interceptFn(async () => {
      try {
        const poolObj: PoolsActionData = {
          currency,
          collateral_contract,
          owner,
          supply_cap: `${formatBigNum2Str(eth2Wei(amount))}`,
          single_cap,
          max_collateral_factor,
          max_tenor,
          max_interest_rate,
          collateral_factor_multiplier,
          tenor_multiplier,
        }
        const typedData = await runGetPoolTypedData(poolObj)

        console.log(formatTypedSignData(typedData), '11')
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
        onCloseUpdate()
        toast({
          status: 'success',
          title: 'Updated successfully! ',
          id: 'Updated-Successfully-ID',
          duration: 3000,
        })
        onSuccessUpdate()
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
    single_cap,
    currency,
    owner,
    collateral_contract,
    collateral_factor_multiplier,
    tenor_multiplier,
    amount,
    max_tenor,
    max_interest_rate,
    max_collateral_factor,
    interceptFn,
    runGetPoolTypedData,
    signTypedDataAsync,
    runPutPoolAsync,
    toast,
    onSuccessUpdate,
    onCloseUpdate,
  ])

  const defaultAmount = useMemo(() => {
    if (!floorPrice || !max_collateral_factor) return ''
    return `${(floorPrice * max_collateral_factor) / 10000}`
  }, [floorPrice, max_collateral_factor])

  const expectedLoanCount = useMemo(() => {
    const res = BigNumber(amount)
      .dividedBy(defaultAmount)
      .integerValue(BigNumber.ROUND_DOWN)
    if (res.isNaN()) return 0
    return res.toString()
  }, [defaultAmount, amount])
  return (
    <>
      <Button onClick={() => interceptFn(() => onOpenUpdate())} {...rest}>
        {children}
      </Button>

      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpenUpdate}
        onClose={onCloseUpdate}
        isCentered
      >
        <ModalOverlay bg='black.2' />
        <ModalContent
          maxW={{
            xl: '576px',
            lg: '576px',
            md: '400px',
            sm: '326px',
            xs: '326px',
          }}
          px={{ md: '40px', sm: '20px', xs: '20px' }}
          borderRadius={16}
        >
          <ModalHeader
            pt={'40px'}
            px={0}
            alignItems='center'
            display={'flex'}
            justifyContent='space-between'
          >
            <Text
              fontSize={{ md: '28px', sm: '24px', xs: '24px' }}
              fontWeight='700'
              noOfLines={1}
            >
              Reset Supply Caps
            </Text>
            <SvgComponent
              svgId='icon-close'
              onClick={onCloseUpdate}
              cursor='pointer'
              svgSize='16px'
            />
          </ModalHeader>
          <ModalBody pb={'24px'} px={0} position={'relative'}>
            <LoadingComponent loading={loading} top={2} />
            {/* 数值们 */}
            <Flex
              py={{ md: '32px', sm: '20px', xs: '20px' }}
              px={{ md: '20px', sm: '10px', xs: '10px' }}
              bg={'gray.5'}
              borderRadius={16}
              justify='space-between'
              mb='32px'
            >
              {AmountDataItems.map((item) => (
                <AmountItem key={item.label} {...item} />
              ))}
            </Flex>
            <FormControl>
              <FormLabel
                fontWeight={'700'}
                display={'flex'}
                justifyContent={'space-between '}
              >
                Amount
                <Text fontWeight={'500'} fontSize={'14px'} color='gray.3'>
                  Min input:
                  {formatFloat(
                    ((floorPrice || 0) * max_collateral_factor) / 10000,
                  )}
                </Text>
              </FormLabel>
              <InputGroup>
                <InputLeftElement
                  pointerEvents='none'
                  color='gray.300'
                  fontSize='1.2em'
                  top={{
                    md: '12px',
                    sm: '6px',
                    xs: '6px',
                  }}
                >
                  <SvgComponent svgId='icon-eth' fill={'black.1'} />
                </InputLeftElement>
                <CustomNumberInput
                  w='100%'
                  value={amount}
                  onSetValue={(v) => {
                    setAmount(v)
                  }}
                  isInvalid={poolAmountStatus?.status === 'error'}
                  isDisabled={
                    updateLoading ||
                    signDataLoading ||
                    signLoading ||
                    floorPrice === undefined
                  }
                  top={'2px'}
                  px='32px'
                  placeholder='Enter amount...'
                />
              </InputGroup>

              {!!poolAmountStatus && (
                <Text
                  mt='4px'
                  color={
                    poolAmountStatus?.status === 'error' ? 'red.1' : 'orange.1'
                  }
                  fontSize={'14px'}
                >
                  {poolAmountStatus.message}
                </Text>
              )}
              {poolAmountStatus?.status !== 'error' && !!amount && (
                <Flex mt={'4px'} color={'gray.3'}>
                  <Text fontSize={'14px'} color='blue.1' fontWeight={'700'}>
                    Expected to lend&nbsp;
                    {expectedLoanCount}
                    &nbsp;loans
                  </Text>
                  <TooltipComponent
                    label={`Based on the loan amount you have set, number of loans = amount deposited / set loan amount , \nFor example: ${amount}/${formatFloat(
                      defaultAmount,
                    )} = ${expectedLoanCount}`}
                    placement='auto'
                  >
                    <SvgComponent
                      svgId='icon-tip'
                      fill='gray.1'
                      fontSize={{
                        md: '20px',
                        sm: '14px',
                        xs: '14px',
                      }}
                      ml='16px'
                    />
                  </TooltipComponent>
                </Flex>
              )}
            </FormControl>
          </ModalBody>

          <Button
            variant='primary'
            mr={'12px'}
            mt={'8px'}
            mb={'40px'}
            mx={{
              md: '40px',
              sm: '23px',
              xs: '23px',
            }}
            h={{
              md: '52px',
              sm: '40px',
              xs: '40px',
            }}
            isDisabled={poolAmountStatus?.status === 'error'}
            onClick={handleUpdate}
            loadingText={'updating'}
            fontSize='16px'
            isLoading={
              updateLoading || refreshLoading || signDataLoading || signLoading
            }
          >
            Confirm
          </Button>
          {/* </ModalFooter> */}
        </ModalContent>
      </Modal>
      <ConnectWalletModal visible={isOpen} handleClose={onClose} />
    </>
  )
}

export default UpdatePoolAmountButton
