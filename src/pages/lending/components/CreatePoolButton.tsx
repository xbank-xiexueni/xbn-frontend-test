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
  InputRightElement,
  useDisclosure,
  Flex,
  Box,
  useToast,
} from '@chakra-ui/react'
import { waitForTransaction, watchContractEvent } from '@wagmi/core'
import BigNumber from 'bignumber.js'
import {
  useCallback,
  useMemo,
  useState,
  type FunctionComponent,
  useRef,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { useContractWrite, useWaitForTransaction } from 'wagmi'

import {
  ConnectWalletModal,
  CustomNumberInput,
  SvgComponent,
  TooltipComponent,
} from 'components'
import {
  WETH_CONTRACT_ABI,
  WETH_CONTRACT_ADDRESS,
  XBANK_CONTRACT_ABI,
  XBANK_CONTRACT_ADDRESS,
} from 'constants/index'
import { useWallet } from 'hooks'
import { formatFloat, formatWagmiErrorMsg } from 'utils/format'
import { eth2Wei, wei2Eth } from 'utils/unit-conversion'

/**
 * create pool
 * use createPool
 */
const CreatePoolButton: FunctionComponent<
  ButtonProps & {
    data: {
      poolMaximumPercentage: number
      poolMaximumDays: number
      poolMaximumInterestRate: number
      loanTimeConcessionFlexibility: number
      loanRatioPreferentialFlexibility: number
      allowCollateralContract: string
      floorPrice: number
      maxSingleLoanAmount: string
    }
  }
> = ({ children, data, ...rest }) => {
  const {
    poolMaximumPercentage,
    poolMaximumDays,
    poolMaximumInterestRate,
    loanTimeConcessionFlexibility,
    loanRatioPreferentialFlexibility,
    allowCollateralContract,
    floorPrice,
    maxSingleLoanAmount,
  } = data
  const toast = useToast()
  const navigate = useNavigate()
  const {
    currentAccount,
    interceptFn,
    isOpen,
    onClose,
    accountConfig: {
      allowanceConfig: { data: allowanceData },
      wethConfig: { data: wethData },
    },
    myPoolsConfig: { refresh: refreshMyPools },
  } = useWallet()
  const {
    isOpen: isOpenApprove,
    onOpen: onOpenApprove,
    onClose: onCloseApprove,
  } = useDisclosure()

  // useEffect(() => {
  //   const web3 = createWeb3Provider()
  //   web3.eth.clearSubscriptions()
  //   return () => {
  //     web3.eth.clearSubscriptions()
  //   }
  // }, [])

  const [amount, setAmount] = useState('')
  const defaultAmount = useMemo(() => {
    if (!floorPrice || !poolMaximumPercentage) return ''
    return `${(floorPrice * poolMaximumPercentage) / 10000}`
  }, [floorPrice, poolMaximumPercentage])

  const [approveLoading, setApproveLoading] = useState(false)

  const initialRef = useRef(null)
  const finalRef = useRef(null)

  const [errorMsg, setErrorMsg] = useState('')
  const [subscribeLoading, setSubscribeLoading] = useState(false)

  const {
    writeAsync: runApproveAsync,
    // data: approveData,
    // isLoading: isWriteApproveLoading,
    // isError: isWriteApproveError,
    // error: writeApproveError,
  } = useContractWrite({
    address: WETH_CONTRACT_ADDRESS,
    abi: [WETH_CONTRACT_ABI.find((i) => i.name === 'approve')],
    functionName: 'approve',
    args: [
      XBANK_CONTRACT_ADDRESS as `0x${string}`,
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    ],
    onError: (err: any) => {
      setApproveLoading(false)
      toast({
        status: 'error',
        title: formatWagmiErrorMsg(err?.cause?.message),
        duration: 3000,
      })
    },
  })

  const {
    writeAsync: runCreateAsync,
    data: createData,
    isLoading: isWriteCreateLoading,
    // isError: isWriteCreateError,
    // error: writeCreateError,
  } = useContractWrite({
    address: XBANK_CONTRACT_ADDRESS,
    abi: [XBANK_CONTRACT_ABI.find((i) => i.name === 'createPool')],
    functionName: 'createPool',
    onError: (err: any) => {
      toast({
        status: 'error',
        title: formatWagmiErrorMsg(err?.cause?.message),
        duration: 3000,
      })
    },
    onSuccess() {
      setSubscribeLoading(true)
      const unwatch = watchContractEvent(
        {
          address: XBANK_CONTRACT_ADDRESS,
          abi: [XBANK_CONTRACT_ABI.find((i) => i.name === 'PoolCreated')],
          eventName: 'PoolCreated',
        },
        (log: any) => {
          if (
            log?.length &&
            log[0].args.poolOwnerAddress == currentAccount?.address
          ) {
            unwatch?.()
            setSubscribeLoading(false)
            refreshMyPools()
            navigate('/lending/my-pools')
          }
        },
      )
    },
  })
  const { isLoading: isWaitCreateLoading } = useWaitForTransaction({
    hash: createData?.hash,
  })
  const createLoading = useMemo(() => {
    return isWaitCreateLoading || isWriteCreateLoading
  }, [isWaitCreateLoading, isWriteCreateLoading])

  /**
   * Your balance = LP 设定的数值
   * Has been lent = 这个 pool 当前进行中的贷款，尚未归还的本金金额
   * Can ben lent = Your balance - Has been lent （如果相减结果为负数，则显示0）
   */

  const isError = useMemo(() => {
    //  amount < balance + Has been lent
    if (!amount) return false
    const wethNum = wei2Eth(wethData)
    if (!wethNum) {
      setErrorMsg(` Insufficient wallet balance: 0 WETH`)
      return true
    }
    const NumberAmount = Number(amount)
    if (NumberAmount > wethNum) {
      setErrorMsg(` Insufficient wallet balance: ${formatFloat(wethNum)} WETH`)
      return true
    }
    if (NumberAmount < (floorPrice * poolMaximumPercentage) / 10000) {
      setErrorMsg(
        `Insufficient funds, Min input: ${formatFloat(
          (floorPrice * poolMaximumPercentage) / 10000,
        )}`,
      )
      return true
    }
    return false
  }, [amount, wethData, floorPrice, poolMaximumPercentage])

  const onConfirm = useCallback(() => {
    interceptFn(async () => {
      /**
       * 平均总耗时：
       * 1676961248463 - 1676961180777 =  67686 ms ≈ 1min
       */
      // 预计算
      const UNIT256MAX =
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      try {
        const parsedWeiAmount = eth2Wei(amount)?.toString()
        const parsedWeiMaximumLoanAmount =
          eth2Wei(maxSingleLoanAmount)?.toString()

        const allowanceHex = `0x${Number(allowanceData).toString(16)}`
        if (allowanceHex !== UNIT256MAX) {
          setApproveLoading(true)
          console.log('approve 阶段')

          const { hash } = await runApproveAsync?.()
          await waitForTransaction({
            hash,
          })
          setApproveLoading(false)
        }

        // const supportERC20Denomination = approveHash?.to
        const supportERC20Denomination = WETH_CONTRACT_ADDRESS
        await runCreateAsync?.({
          args: [
            // supportERC20Denomination
            supportERC20Denomination,
            // allowCollateralContract
            allowCollateralContract,
            // poolAmount
            parsedWeiAmount,
            parsedWeiMaximumLoanAmount,
            // poolMaximumPercentage,
            poolMaximumPercentage,
            // uint32 poolMaximumDays,
            poolMaximumDays,
            // uint32 poolMaximumInterestRate,
            poolMaximumInterestRate,
            // uint32 loanTimeConcessionFlexibility,
            loanTimeConcessionFlexibility * 10000,
            // uint32 loanRatioPreferentialFlexibility
            loanRatioPreferentialFlexibility * 10000,
          ],
        })
      } catch (error: any) {
        console.log(
          '🚀 ~ file: CreatePoolButton.tsx:259 ~ interceptFn ~ error:',
          error,
        )
      }
    })
  }, [
    amount,
    poolMaximumPercentage,
    poolMaximumDays,
    poolMaximumInterestRate,
    loanRatioPreferentialFlexibility,
    loanTimeConcessionFlexibility,
    allowCollateralContract,
    interceptFn,
    maxSingleLoanAmount,
    allowanceData,
    runApproveAsync,
    runCreateAsync,
  ])

  const handleClose = useCallback(() => {
    if (approveLoading || createLoading) return
    onCloseApprove()
  }, [onCloseApprove, approveLoading, createLoading])

  const expectedLoanCount = useMemo(() => {
    const res = BigNumber(amount)
      .dividedBy(defaultAmount)
      .integerValue(BigNumber.ROUND_DOWN)
    if (res.isNaN()) return 0
    return res.toString()
  }, [defaultAmount, amount])

  return (
    <>
      <Button
        onClick={() => interceptFn(() => onOpenApprove())}
        {...rest}>
        {children}
      </Button>

      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpenApprove}
        onClose={handleClose}
        isCentered>
        <ModalOverlay bg='black.2' />
        <ModalContent
          borderRadius={16}
          maxW={{
            xl: '576px',
            lg: '576px',
            md: '400px',
            sm: '326px',
            xs: '326px',
          }}
          px={{ md: '40px', sm: '20px', xs: '20px' }}>
          <ModalHeader
            pt={'40px'}
            px={0}
            alignItems='center'
            display={'flex'}
            justifyContent='space-between'>
            <Text
              fontSize={{ md: '28px', sm: '24px', xs: '24px' }}
              fontWeight='700'>
              Approve WETH
            </Text>
            <SvgComponent
              svgId='icon-close'
              onClick={handleClose}
              cursor='pointer'
              svgSize='16px'
            />
          </ModalHeader>
          <ModalBody
            p={0}
            px={0}>
            {/* 数值们 */}
            {/* <Flex
              py={{ md: '32px', sm: '20px', xs: '20px' }}
              px={{ md: '36px', sm: '12px', xs: '12px' }}
              bg={`var(--chakra-colors-gray-5)`}
              borderRadius={16}
              justify='space-between'
              mb='32px'
            >
              {AmountDataItems.map((item) => (
                <AmountItem key={item.label} {...item} />
              ))}
            </Flex> */}
            <FormControl>
              <FormLabel
                fontWeight={'700'}
                display={'flex'}
                justifyContent={'space-between '}>
                Set pool size
                <Text
                  fontWeight={'500'}
                  fontSize={'14px'}
                  color='gray.3'>
                  Min input:
                  {formatFloat((floorPrice * poolMaximumPercentage) / 10000)}
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
                  }}>
                  <SvgComponent
                    svgId='icon-eth'
                    fill={'black.1'}
                  />
                </InputLeftElement>
                <CustomNumberInput
                  value={amount}
                  isInvalid={isError}
                  // lineHeight='60px'
                  placeholder='Enter the approve ETH amount...'
                  isDisabled={
                    approveLoading || createLoading || subscribeLoading
                  }
                  onSetValue={(v) => setAmount(v)}
                  px={'32px'}
                />

                {isError && (
                  <InputRightElement
                    top={{
                      md: '14px',
                      sm: '4px',
                      xs: '4px',
                    }}
                    mr='8px'>
                    <SvgComponent
                      svgId='icon-error'
                      svgSize={{
                        md: '24px',
                        sm: '16px',
                        xs: '16px',
                      }}
                    />
                  </InputRightElement>
                )}
              </InputGroup>

              {isError && (
                <Text
                  mt={'8px'}
                  color={'red.1'}>
                  {errorMsg}
                </Text>
              )}
              {!isError && !!amount && (
                <Flex
                  mt={'8px'}
                  color={'gray.3'}
                  alignItems={'center'}>
                  <Text
                    fontSize={'14px'}
                    color='blue.1'
                    fontWeight={'700'}>
                    Expected to lend&nbsp;
                    {expectedLoanCount}
                    &nbsp;loans
                  </Text>
                  <TooltipComponent
                    whiteSpace={'pre-line'}
                    label={`Based on the loan amount you have set, number of loans = amount deposited / set loan amount , \nFor example: ${amount}/${formatFloat(
                      defaultAmount,
                    )} = ${expectedLoanCount}`}
                    placement='bottom-start'
                    hasArrow={false}
                    bg='white'
                    borderRadius={8}
                    p='10px'
                    fontSize={'12px'}
                    lineHeight={'18px'}
                    fontWeight={'400'}
                    color='gray.4'
                    boxShadow={'0px 0px 10px #D1D6DC'}>
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

          {/* <ModalFooter justifyContent={'center'}> */}
          <Box
            h='42px'
            px='20px'
            mt='8px'>
            {(approveLoading || createLoading || subscribeLoading) && (
              <Text
                color={'gray.1'}
                fontSize={'14px'}
                textAlign={'center'}>
                It is expected to take one or two minutes, ultimately depending
                on the Ethereum transaction processing time.
              </Text>
            )}
          </Box>
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
            isDisabled={isError || !Number(amount)}
            onClick={onConfirm}
            loadingText={
              approveLoading
                ? 'approving'
                : createLoading || subscribeLoading
                ? 'creating'
                : ''
            }
            fontSize='16px'
            isLoading={approveLoading || createLoading || subscribeLoading}>
            Approve
          </Button>
          {/* {(isWriteCreateError || isWriteApproveError) && (
            <Text mt='4px' color={'red.1'} fontSize={'14px'} w='240px'>
              {formatWagmiErrorMsg(
                ((writeCreateError || writeApproveError)?.cause as any)
                  ?.message,
              )}
            </Text>
          )} */}
          {/* </ModalFooter> */}
        </ModalContent>
      </Modal>
      <ConnectWalletModal
        visible={isOpen}
        handleClose={onClose}
      />
    </>
  )
}

export default CreatePoolButton
