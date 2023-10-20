import {
  Box,
  Heading,
  Flex,
  Text,
  Highlight,
  Spinner,
  ModalHeader,
  ModalContent,
  ModalOverlay,
  Modal,
  ModalBody,
  Button,
  Divider,
  useToast,
} from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import BigNumber from 'bignumber.js'
import dayjs, { unix } from 'dayjs'
import { groupBy } from 'lodash'
import { isEmpty } from 'lodash'
import { sortBy } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useContractWrite, useWaitForTransaction } from 'wagmi'

import { apiGetCollectionDetail, apiGetLoans } from 'api'
import {
  ConnectWalletModal,
  ImageWithFallback,
  TableWithPagination,
  type ColumnProps,
  SvgComponent,
  LoadingComponent,
  NoticeSlider,
  NftInfoComponent,
} from 'components'
import {
  UNIT,
  NotificationType,
  MODEL_HEADER_PROPS,
  XBANK_CONTRACT_ABI,
  XBANK_CONTRACT_ADDRESS,
  LOAN_STATUS,
  FRONTEND_LOAN_STATUS,
} from 'constants/index'
import { useWallet } from 'hooks'
import RootLayout from 'layouts/RootLayout'
import {
  formatAddress,
  formatFloat,
  formatPluralUnit,
  formatWagmiErrorMsg,
} from 'utils/format'
import { wei2Eth } from 'utils/unit-conversion'

const Loans = () => {
  // const navigate = useNavigate()
  const {
    isOpen,
    onClose,
    interceptFn,
    currentAccount,
    noticeConfig: { data: noticeData, refresh: refreshNotice },
    isConnected,
  } = useWallet()
  console.log('isConnected', isConnected)
  console.log('currentAccount', currentAccount)
  const toast = useToast()
  const [repayLoadingMap, setRepayLoadingMap] =
    useState<Record<string, boolean>>()

  const [prepayLoadingMap, setPrepayLoadingMap] =
    useState<Record<string, boolean>>()

  useEffect(() => {
    interceptFn()
  }, [interceptFn])

  const { loading, data, refresh } = useRequest(apiGetLoans, {
    ready: !!isConnected,
    debounceWait: 100,
    defaultParams: [
      {
        borrower: currentAccount?.address,
      },
    ],
  })

  const formattedData = useMemo(
    () => (isConnected ? data : []),
    [data, isConnected],
  )

  const statuedLoans = useMemo(() => {
    const groupedData = groupBy(formattedData, 'status')
    return {
      [FRONTEND_LOAN_STATUS.OPEN]: groupedData[LOAN_STATUS.OPEN],
      [FRONTEND_LOAN_STATUS.PAID_OFF]: [
        ...(groupedData?.[LOAN_STATUS.PAYOFF] || []),
        ...(groupedData?.[LOAN_STATUS.FULL_TENOR] || []),
        ...(groupedData?.[LOAN_STATUS.COLLATERAL_SALE] || []),
      ],
      [FRONTEND_LOAN_STATUS.OVERDUE]: groupedData[LOAN_STATUS.OVERDUE],
    }
  }, [formattedData])

  const {
    writeAsync: runRepayAsync,
    data: repayData,
    // isLoading: isWriteRepayLoading,
    // isError: isWriteRepayError,
    // error: writeRepayError,
  } = useContractWrite({
    address: XBANK_CONTRACT_ADDRESS,
    abi: [XBANK_CONTRACT_ABI.find((i) => i.name === 'repayLoan')],
    functionName: 'repayLoan',
  })
  const {
    // isLoading: isWaitPayLoading
  } = useWaitForTransaction({
    hash: repayData?.hash,
    onSuccess(cData) {
      console.log('🚀 ~ file: Loans.tsx:118 ~ onSuccess ~ data:', cData)
      setTimeout(() => {
        setRepayLoadingMap(undefined)
        toast({
          status: 'success',
          title: 'successful repayment',
        })
        refresh()
        refreshNotice()
      }, 3000)
    },
    onError(err: any) {
      toast({
        title: formatWagmiErrorMsg(err?.cause?.message),
        status: 'error',
        duration: 5000,
      })
      setRepayLoadingMap(undefined)
    },
  })
  // const transferFromLoading = useMemo(() => {
  //   return isWaitPayLoading || isWriteRepayLoading
  // }, [isWaitPayLoading, isWriteRepayLoading])

  // 点击 repay
  const handleClickRepay = useCallback(
    ({ loan_id, each_payment }: Record<string, string>) => {
      console.log(
        '🚀 ~ file: Loans.tsx:130 ~ Loans ~ each_payment:',
        each_payment,
      )
      console.log('🚀 ~ file: Loans.tsx:130 ~ Loans ~ loan_id:', loan_id)
      interceptFn(async () => {
        try {
          if (!currentAccount?.address) return
          setRepayLoadingMap((prev) => ({
            ...prev,
            [loan_id]: true,
          }))
          // 2. 调用 xbank.repayLoan
          await runRepayAsync({
            args: [loan_id],
            value: each_payment,
          })
        } catch (error: any) {
          toast({
            title: formatWagmiErrorMsg(error?.cause?.message),
            status: 'error',
            duration: 5000,
          })
          setRepayLoadingMap((prev) => ({
            ...prev,
            [loan_id]: false,
          }))
        }
      })
    },
    [interceptFn, currentAccount, toast, runRepayAsync],
  )

  const loansForBuyerColumns: ColumnProps[] = [
    {
      title: 'Lender',
      dataIndex: 'lender',
      key: 'lender',
      // lender
      render: (value: any) => <Text>{formatAddress(value?.toString())}</Text>,
    },
    {
      title: 'Start time',
      dataIndex: 'start_time',
      key: 'start_time',
      // startTime
      render: (value: any) => (
        <Text>{unix(value).format('YYYY/MM/DD HH:mm:ss')}</Text>
      ),
    },
    {
      title: 'Loan value',
      dataIndex: 'loan_amount',
      key: 'loan_amount',
      // loanAmount
      render: (value: any) => (
        <Text>
          {formatFloat(wei2Eth(value))} {UNIT}
        </Text>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'tenor',
      key: 'tenor',
      // tenor
      render: (value: any) => {
        return <Text>{formatPluralUnit(value / 3600 / 24, 'day')}</Text>
      },
    },
    {
      title: 'Interest',
      dataIndex: 'number_of_installments',
      key: 'number_of_installments',
      render: (number_of_installments: any, item: Record<string, any>) => {
        // eachPayment * numberOfInstallments - loanAmount
        return (
          <Text>
            {formatFloat(
              BigNumber(
                wei2Eth(
                  BigNumber(item.each_payment)
                    .multipliedBy(number_of_installments)
                    .minus(item.loan_amount),
                ) || 0,
              ),
            )}
            {UNIT}
          </Text>
        )
      },
    },
  ]

  const [prepayData, setPrepayData] = useState<
    {
      outstandingPrincipal: BigNumber
      interestOutstanding: BigNumber
    } & LoanListItemType
  >()

  // 当前 loan 的 nft 的 collection 数据
  const [collectionInfo, setCollectionInfo] = useState<{
    name: string
    safelistRequestStatus: string
  }>()
  const { loading: collectionLoading } = useRequest(apiGetCollectionDetail, {
    defaultParams: [
      {
        assetContractAddresses: [prepayData?.collateral_contract || ''],
      },
    ],
    ready: !!prepayData,
    refreshDeps: [prepayData],
    onSuccess({ data: cData }) {
      const { nftCollectionsByContractAddresses } = cData

      if (!nftCollectionsByContractAddresses?.length) return
      const currentCollection = nftCollectionsByContractAddresses[0]
      const {
        nftCollection: { name, safelistRequestStatus },
      } = currentCollection

      setCollectionInfo({
        name,
        safelistRequestStatus,
      })
    },
  })

  const {
    writeAsync: runPrepayAsync,
    data: contractPrepayData,
    // isLoading: isWritePrepayLoading,
    // isError: isWritePrepayError,
    // error: writePrepayError,
  } = useContractWrite({
    address: XBANK_CONTRACT_ADDRESS,
    abi: [XBANK_CONTRACT_ABI.find((i) => i.name === 'payoffLoan')],
    functionName: 'payoffLoan',
  })
  const {
    // isLoading: isWaitPrepayLoading
  } = useWaitForTransaction({
    hash: contractPrepayData?.hash,
    onSuccess(cData) {
      console.log('🚀 ~ file: Loans.tsx:333 ~ onSuccess ~ data:', cData)
      setTimeout(() => {
        setPrepayLoadingMap(undefined)
        toast({
          status: 'success',
          title: 'successful prepayment',
        })
        refresh()
        setPrepayData(undefined)
        refreshNotice()
      }, 3000)
    },
    onError(err: any) {
      toast({
        title: formatWagmiErrorMsg(err?.cause?.message),
        status: 'error',
        duration: 5000,
      })
      setPrepayLoadingMap(undefined)
    },
  })
  // 点击 pay in advance, 读取当前 loan,并打开弹窗
  const handleClickPayInAdvance = useCallback(
    (info: LoanListItemType) => {
      if (prepayLoadingMap && prepayLoadingMap[info.loan_id]) {
        return
      }
      const {
        outstanding_principal,
        loan_ir,
        start_time,
        repaid_times,
        tenor,
        number_of_installments,
      } = info
      /**
       *
       *  lastTime = startTime + ( tenor / numberOfInstallments ) * repaidTimes
       *  preTimes = currentTime - lastTime
       *  preDays = preTimes / (24 * 60 * 60) integerValue(BigNumber.ROUND_UP)
       *  应还本金： outstandingPrincipal
       *  提前还款利息： outstandingPrincipal * ( offerIR / 365 ) * preDays
       */

      // 日利率 = 年利率 / 365
      const dayRate = BigNumber(loan_ir).dividedBy(365)
      // 每期还款期限 = 还款期限 / 还款期数
      const perLoanDuration = BigNumber(tenor).dividedBy(number_of_installments)
      // 上次还款时间 = 借款开始时间 + 每期还款期间 * 已还次数
      const lastTime = BigNumber(start_time).plus(
        perLoanDuration.multipliedBy(repaid_times),
      )
      // 提前还款利息天数 = （当前时间 - （借款成功时间 || 上次还款时间））/ 24 向上取整
      const currentTime = dayjs(new Date()).unix()
      const preTimes = BigNumber(currentTime).minus(lastTime)
      const preDays = preTimes
        .dividedBy(24 * 60 * 60)
        .integerValue(BigNumber.ROUND_UP)

      const interestOutstanding = BigNumber(outstanding_principal)
        .multipliedBy(dayRate.dividedBy(10000))
        .multipliedBy(preDays)

      setPrepayData({
        ...info,
        outstandingPrincipal: BigNumber(outstanding_principal),
        interestOutstanding: interestOutstanding.lt(0)
          ? BigNumber(0)
          : interestOutstanding,
      })
    },
    [prepayLoadingMap],
  )
  // 确认提前还款
  const handleConfirmPayInAdvance = useCallback(() => {
    interceptFn(async () => {
      if (!prepayData || !currentAccount?.address) return
      const { loan_id, outstandingPrincipal, interestOutstanding } = prepayData
      try {
        const amount = outstandingPrincipal.plus(interestOutstanding)
        console.log(
          '🚀 ~ file: Loans.tsx:378 ~ interceptFn ~ amount:',
          amount.toString(),
        )
        console.log(
          '🚀 ~ file: Loans.tsx:378 ~ interceptFn ~ interestOutstanding:',
          interestOutstanding.toString(),
        )
        console.log(
          '🚀 ~ file: Loans.tsx:378 ~ interceptFn ~ outstandingPrincipal:',
          outstandingPrincipal.toString(),
        )
        setPrepayLoadingMap((prev) => ({
          ...prev,
          [loan_id]: true,
        }))

        // 2. 调用 xbank.prepayment
        await runPrepayAsync({
          args: [loan_id],
          value: amount.integerValue(BigNumber.ROUND_UP).toString(),
        })
      } catch (err: any) {
        toast({
          title: formatWagmiErrorMsg(err?.cause?.message),
          status: 'error',
          duration: 5000,
        })
        setPrepayLoadingMap(undefined)
      }
    })
  }, [prepayData, toast, currentAccount, interceptFn, runPrepayAsync])

  const handleClose = useCallback(() => {
    if (!prepayData) return
    if (prepayLoadingMap && prepayLoadingMap[prepayData?.loan_id]) return
    setPrepayData(undefined)
  }, [prepayLoadingMap, prepayData])

  const currentLoans = useMemo(() => {
    if (!statuedLoans) return []
    if (isEmpty(statuedLoans[FRONTEND_LOAN_STATUS.OPEN])) return []
    const unSortLoans = statuedLoans[FRONTEND_LOAN_STATUS.OPEN].map((info) => {
      const { number_of_installments, start_time, tenor, repaid_times } = info

      /**
       *  nextPaymentData = startTime + ( tenor / numberOfInstallments ) * ( repaidTimes + 1 )
       */
      const perLoanDuration = BigNumber(tenor).dividedBy(number_of_installments)
      const nextPaymentData = BigNumber(start_time).plus(
        perLoanDuration.multipliedBy(BigNumber(repaid_times).plus(1)),
      )

      return {
        ...info,
        nextPaymentData: nextPaymentData.toString(),
      }
    })
    return sortBy(unSortLoans, (i) => -i.nextPaymentData)
  }, [statuedLoans])

  return (
    <RootLayout my='100px'>
      <Heading
        size={'2xl'}
        mb='60px'>
        Loans
      </Heading>

      <NoticeSlider
        data={noticeData?.filter(
          (i) => i.type === NotificationType.loan_repayment,
        )}
      />
      <Flex
        justify={'space-between'}
        mt='16px'>
        <Box w='100%'>
          <TableWithPagination
            table={{
              tableTitle: () => (
                <Heading fontSize={'20px'}>Current Loans</Heading>
              ),
              styleConfig: {
                thTextProps: {
                  fontSize: '12px',
                  fontWeight: '500',
                },
                tdTextProps: {
                  fontSize: '14px',
                  fontWeight: '500',
                },
              },
              loadingConfig: {
                top: '30px',
                loading: loading,
              },
              columns: [
                {
                  title: 'Asset',
                  dataIndex: 'token_id',
                  key: 'token_id',
                  align: 'left',
                  width: {
                    xl: 240,
                    lg: 200,
                    md: 150,
                    sm: 130,
                    xs: 130,
                  },
                  render: (token_id: any, info: any) => {
                    // collateralContract tokenID
                    return (
                      <NftInfoComponent
                        tokenId={token_id}
                        contractAddress={info.collateral_contract}>
                        {({ img, name }) => (
                          <Flex
                            alignItems={'center'}
                            gap={'8px'}>
                            <ImageWithFallback
                              src={img}
                              w='40px'
                              h='40px'
                              borderRadius={4}
                              fit={'contain'}
                            />
                            <Text
                              w={'100px'}
                              display='inline-block'
                              overflow='hidden'
                              whiteSpace='nowrap'
                              textOverflow='ellipsis'>
                              {name}
                            </Text>
                          </Flex>
                        )}
                      </NftInfoComponent>
                    )
                  },
                },
                {
                  title: 'Next payment date',
                  dataIndex: 'nextPaymentData',
                  key: 'nextPaymentData',
                  render: (value: any) => {
                    return (
                      <Text>{unix(value).format('YYYY/MM/DD HH:mm:ss')}</Text>
                    )
                  },
                },
                {
                  title: 'Next payment amount',
                  dataIndex: 'each_payment',
                  key: 'each_payment',
                  // eachPayment
                  render: (value: any) => (
                    <Text>
                      {formatFloat(BigNumber(wei2Eth(value) || 0))}
                      &nbsp;
                      {UNIT}
                    </Text>
                  ),
                },
                ...loansForBuyerColumns,
                {
                  title: 'Operation',
                  dataIndex: 'loan_id',
                  key: 'loan_id',
                  thAlign: 'center',
                  fixedRight: true,
                  tdStyleConfig: {
                    bg: 'white',
                    px: 0,
                  },
                  render: (value: any, info: any) => (
                    <Flex alignItems={'center'}>
                      <Box
                        px='12px'
                        bg='white'
                        borderRadius={8}
                        cursor='pointer'
                        onClick={() => {
                          if (repayLoadingMap && repayLoadingMap[value]) {
                            return
                          }
                          handleClickRepay({
                            loan_id: value,
                            each_payment: info?.each_payment,
                          })
                        }}
                        w='68px'
                        textAlign={'center'}>
                        {repayLoadingMap && repayLoadingMap[value] ? (
                          <Spinner
                            color='blue.1'
                            size={'sm'}
                          />
                        ) : (
                          <Text
                            color='blue.1'
                            fontSize='14px'
                            fontWeight={'500'}>
                            Repay
                          </Text>
                        )}
                      </Box>
                      <Divider
                        orientation='vertical'
                        bg='blue.4'
                        h='16px'
                        w='1px'
                      />

                      <Box
                        px='12px'
                        bg='white'
                        borderRadius={8}
                        cursor='pointer'
                        onClick={() => handleClickPayInAdvance(info)}
                        textAlign={'center'}>
                        <Text
                          color='blue.1'
                          fontSize='14px'
                          fontWeight={'500'}>
                          Pay Off Now
                        </Text>
                      </Box>
                    </Flex>
                  ),
                },
              ],

              loading: loading,
              data: currentLoans,
              key: '1',
            }}
          />
          <TableWithPagination
            table={{
              styleConfig: {
                thTextProps: {
                  fontSize: '12px',
                  fontWeight: '500',
                },
                tdTextProps: {
                  fontSize: '14px',
                  fontWeight: '500',
                },
              },
              loadingConfig: {
                top: '30px',
                loading: loading,
              },
              tableTitle: () => (
                <Heading
                  fontSize={'20px'}
                  mt={'40px'}>
                  <Highlight
                    styles={{
                      fontSize: '18px',
                      fontWeight: 500,
                      color: `gray.3`,
                    }}
                    query='(Paid Off)'>
                    Previous Loans(Paid Off)
                  </Highlight>
                </Heading>
              ),

              columns: [
                {
                  title: 'Asset',
                  dataIndex: 'token_id',
                  key: 'token_id',
                  align: 'left',
                  width: {
                    xl: 240,
                    lg: 200,
                    md: 150,
                    sm: 130,
                    xs: 130,
                  },
                  render: (token_id: any, info: any) => {
                    return (
                      <NftInfoComponent
                        tokenId={token_id}
                        contractAddress={info.collateral_contract}>
                        {({ img, name }) => (
                          <Flex
                            alignItems={'center'}
                            gap={'8px'}>
                            <ImageWithFallback
                              src={img}
                              w='40px'
                              h='40px'
                              borderRadius={4}
                              fit={'contain'}
                            />
                            <Text
                              w={'100px'}
                              display='inline-block'
                              overflow='hidden'
                              whiteSpace='nowrap'
                              textOverflow='ellipsis'>
                              {name}
                            </Text>
                          </Flex>
                        )}
                      </NftInfoComponent>
                    )
                  },
                },
                ...loansForBuyerColumns,
              ],
              loading: loading,
              data: sortBy(
                statuedLoans[FRONTEND_LOAN_STATUS.PAID_OFF],
                (i) => -i.start_time,
              ),
              key: '2',
            }}
          />
          <TableWithPagination
            table={{
              styleConfig: {
                thTextProps: {
                  fontSize: '12px',
                  fontWeight: '500',
                },
                tdTextProps: {
                  fontSize: '14px',
                  fontWeight: '500',
                },
              },
              tableTitle: () => (
                <Heading
                  fontSize={'20px'}
                  mt={'40px'}>
                  <Highlight
                    styles={{
                      fontSize: '18px',
                      fontWeight: 500,
                      color: `gray.3`,
                    }}
                    query='(Overdue)'>
                    Previous Loans(Overdue)
                  </Highlight>
                </Heading>
              ),
              loadingConfig: {
                top: '30px',
                loading: loading,
              },
              columns: [
                {
                  title: 'Asset',
                  dataIndex: 'token_id',
                  key: 'token_id',
                  align: 'left',
                  width: {
                    xl: 240,
                    lg: 200,
                    md: 150,
                    sm: 130,
                    xs: 130,
                  },
                  render: (token_id: any, info: any) => {
                    return (
                      <NftInfoComponent
                        tokenId={token_id}
                        contractAddress={info.collateral_contract}>
                        {({ img, name }) => (
                          <Flex
                            alignItems={'center'}
                            gap={'8px'}>
                            <ImageWithFallback
                              src={img}
                              w='40px'
                              h='40px'
                              borderRadius={4}
                              fit={'contain'}
                            />
                            <Text
                              w={'100px'}
                              display='inline-block'
                              overflow='hidden'
                              whiteSpace='nowrap'
                              textOverflow='ellipsis'>
                              {name}
                            </Text>
                          </Flex>
                        )}
                      </NftInfoComponent>
                    )
                  },
                },
                ...loansForBuyerColumns,
              ],
              loading: loading,
              data: sortBy(
                statuedLoans[FRONTEND_LOAN_STATUS.OVERDUE],
                (i) => -i.start_time,
              ),
              key: '3',
            }}
          />
        </Box>
      </Flex>
      <ConnectWalletModal
        visible={isOpen}
        handleClose={onClose}
      />

      <Modal
        onClose={handleClose}
        isOpen={!!prepayData}
        isCentered
        scrollBehavior='inside'>
        <ModalOverlay bg='black.2' />
        <ModalContent
          maxW={{
            md: '576px',
            sm: '326px',
            xs: '326px',
          }}
          maxH={'calc(100% - 5.5rem)'}
          borderRadius={16}>
          <LoadingComponent
            loading={collectionLoading}
            top={0}
          />
          <ModalHeader {...MODEL_HEADER_PROPS}>
            Confirm
            <SvgComponent
              svgId='icon-close'
              onClick={handleClose}
              cursor={'pointer'}
            />
          </ModalHeader>
          <ModalBody
            m={0}
            p={0}
            px={{
              md: '40px',
              sm: '20px',
              xs: '20px',
            }}>
            <NftInfoComponent
              tokenId={prepayData?.token_id || ''}
              contractAddress={prepayData?.collateral_contract || ''}>
              {({ img, name }) => (
                <Flex
                  gap='12px'
                  alignItems={'center'}
                  mb='10px'>
                  <Box
                    borderRadius={8}
                    borderWidth={1}
                    borderColor={'gray.2'}>
                    <ImageWithFallback
                      src={img}
                      w='100px'
                      h='100px'
                      fit={'contain'}
                    />
                  </Box>

                  <Flex
                    flexDir={'column'}
                    w='60%'
                    gap={'4px'}>
                    <Text
                      noOfLines={1}
                      fontSize={'24px'}
                      fontWeight={'700'}>
                      {name}
                    </Text>
                    <Flex>
                      <Text>{collectionInfo?.name || '--'}</Text>
                      {collectionInfo?.safelistRequestStatus === 'verified' && (
                        <SvgComponent svgId='icon-verified-fill' />
                      )}
                    </Flex>
                  </Flex>
                </Flex>
              )}
            </NftInfoComponent>
            <Divider />
            <Text
              my='24px'
              fontWeight={'700'}
              mb='20px'>
              Payment Info
            </Text>

            <Flex
              flexDir={'column'}
              gap='10px'
              mb='24px'>
              <Flex
                color='gray.3'
                fontSize={'14px'}
                justify={'space-between'}>
                <Text>Outstanding Principal</Text>
                <Text>
                  {prepayData
                    ? formatFloat(
                        wei2Eth(prepayData?.outstandingPrincipal) || 0,
                      )
                    : '--'}
                  {UNIT}
                </Text>
              </Flex>
              <Flex
                color='gray.3'
                fontSize={'14px'}
                justify={'space-between'}>
                <Text>Outstanding Interest</Text>
                <Text>
                  {prepayData
                    ? formatFloat(
                        wei2Eth(
                          prepayData?.interestOutstanding.integerValue(),
                        ) || 0,
                      )
                    : '--'}
                  {UNIT}
                </Text>
              </Flex>
            </Flex>

            <Flex
              justify={'space-between'}
              mb='20px'>
              <Text>Payment Amount</Text>
              <Text fontWeight={'700'}>
                {prepayData
                  ? formatFloat(
                      wei2Eth(
                        prepayData?.outstandingPrincipal.plus(
                          prepayData?.interestOutstanding,
                        ),
                      ) || 0,
                    )
                  : '--'}
                {UNIT}
              </Text>
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
              mt='8px'>
              <Button
                w='100%'
                h={{
                  md: '52px',
                  sm: '40px',
                  xs: '40px',
                }}
                variant='primary'
                px='30px'
                disabled={!prepayData}
                isLoading={
                  prepayLoadingMap &&
                  prepayData &&
                  prepayLoadingMap[prepayData.loan_id]
                }
                onClick={handleConfirmPayInAdvance}>
                Confirm
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </RootLayout>
  )
}

export default Loans
