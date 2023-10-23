import {
  Box,
  Button,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Heading,
  Tag,
  type TabProps,
  AlertDescription,
  Alert,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import dayjs, { unix } from 'dayjs'
// import etherscanapi from 'etherscan-api'
import capitalize from 'lodash-es/capitalize'
import isEmpty from 'lodash-es/isEmpty'
import { useEffect, useMemo, useState, type FunctionComponent } from 'react'
// import Joyride from 'react-joyride'
import { useNavigate, useParams } from 'react-router-dom'

import { apiGetListings, apiGetLoanOrder, apiGetRepayments } from '@/api'
import {
  ConnectWalletModal,
  EmptyComponent,
  ImageWithFallback,
  type ColumnProps,
  NotFound,
  EthText,
  NftInfoComponent,
  TableWithPagination,
} from '@/components'
import { LOAN_ORDER_STATUS, LISTING_ORDER_STATUS } from '@/constants'
import { useSign, useWallet } from '@/hooks'
import RootLayout from '@/layouts/RootLayout'
import { formatFloat, formatPluralUnit } from '@/utils/format'
import { wei2Eth } from '@/utils/unit-conversion'

enum TAB_KEY {
  LOAN_TAB = 0,
  REPAY_TAB = 1,
  SALE_TAB = 2,
}

enum LOAN_ORDER_STATUS_TEXT {
  Succeeded = 'Succeeded',
  Refunded = 'Refunded',
  Processing = 'Processing',
  Failed = 'Failed',
  Canceled = 'Canceled',
}

enum LISTING_ORDER_STATUS_TEXT {
  Succeeded = 'Succeeded',
  Sold = 'Sold',
  Failed = 'Failed',
  Canceled = 'Canceled',
  Processing = 'Processing',
}
// const api = etherscanapi.init('', 'goerli')

const TabWrapper: FunctionComponent<
  TabProps & {
    count?: number
  }
> = ({ children, count, ...rest }) => {
  return (
    <Tab
      pt='14px'
      px='6px'
      pb='20px'
      _selected={{
        color: 'blue.1',
        borderBottomWidth: 2,
        borderColor: 'blue.1',
        w: {
          md: 'auto',
          sm: '200px',
          xs: '200px',
        },
      }}
      display={'inline-flex'}
      {...rest}
    >
      <Text fontWeight='bold' noOfLines={1} fontSize='16px'>
        {children}
      </Text>
      {!!count && (
        <Tag
          bg={'blue.1'}
          color='white'
          borderRadius={15}
          fontSize='12px'
          w='25px'
          h='20px'
          textAlign={'center'}
          justifyContent='center'
          lineHeight={2}
          fontWeight='700'
          ml='4px'
        >
          {count}
        </Tag>
      )}
    </Tab>
  )
}

const History = () => {
  const [tabKey, setTabKey] = useState<TAB_KEY>(TAB_KEY.LOAN_TAB)

  const {
    isOpen,
    onClose,
    interceptFn,
    currentAccount,
    isConnected,
    handleDisconnect,
  } = useWallet()
  const { debounceRunAsync: handleSignDebounce, loading } = useSign()

  const params = useParams() as {
    type: 'sale' | 'loan' | 'repay'
  }
  const navigate = useNavigate()

  // loan
  const { data: loanData, loading: loanLoading } = useRequest(
    () => apiGetLoanOrder({ borrower: currentAccount?.address || '' }),
    {
      ready: isConnected,
      refreshDeps: [currentAccount],
      onError: (error: any) => {
        if (error.code === 'unauthenticated') {
          handleDisconnect()
          // 未能签名
          if (!currentAccount?.address) return
          handleSignDebounce(currentAccount.address)
        }
      },
    },
  )

  const sortedLoanData = useMemo(() => {
    if (!loanData) return []
    if (isEmpty(loanData)) return []
    return loanData?.sort(
      (a, b) => -dayjs(a.created_at).unix() + dayjs(b.created_at).unix(),
    )
  }, [loanData])

  // repay
  const { data: repayData, loading: repayLoading } = useRequest(
    () => apiGetRepayments({ borrower: currentAccount?.address || '' }),
    {
      ready: !!isConnected,
      refreshDeps: [currentAccount],
      onError: (error: any) => {
        if (error.code === 'unauthenticated') {
          handleDisconnect()
          // 未能签名
          if (!currentAccount?.address) return
          handleSignDebounce(currentAccount.address)
        }
      },
    },
  )

  const sortedRepayData = useMemo(() => {
    if (!repayData) return []
    if (isEmpty(repayData)) return []
    return repayData?.sort(
      (a, b) => -dayjs(a.created_at).unix() + dayjs(b.created_at).unix(),
    )
  }, [repayData])

  // listing
  const { data: listData, loading: listLoading } = useRequest(
    () => apiGetListings({ borrower_address: currentAccount?.address || '' }),
    {
      ready: !!isConnected,
      refreshDeps: [currentAccount],
      onError: (error: any) => {
        if (error.code === 'unauthenticated') {
          handleDisconnect()
          // 未能签名
          if (!currentAccount?.address) return
          handleSignDebounce(currentAccount.address)
        }
      },
    },
  )

  const sortedListData = useMemo(() => {
    if (!listData) return []
    if (isEmpty(listData)) return []
    return listData?.sort(
      (a, b) => -dayjs(a.created_at).unix() + dayjs(b.created_at).unix(),
    )
  }, [listData])

  useEffect(() => {
    interceptFn(() => {
      const { type } = params
      setTabKey(() => {
        switch (type) {
          case 'loan':
            return TAB_KEY.LOAN_TAB
          case 'repay':
            return TAB_KEY.REPAY_TAB
          case 'sale':
            return TAB_KEY.SALE_TAB
          default:
            return TAB_KEY.LOAN_TAB
        }
      })
    })
  }, [params, interceptFn])

  const loanColumns: ColumnProps[] = useMemo(() => {
    return [
      {
        title: 'Asset',
        dataIndex: 'token_id',
        key: 'token_id',
        align: 'left',
        width: 240,
        render: (value: any, info: any) => {
          return (
            <NftInfoComponent
              tokenId={value}
              contractAddress={info.collateral_contract}
            >
              {({ img, name }) => (
                <Flex alignItems={'center'} gap={'8px'} w='100%'>
                  <ImageWithFallback
                    src={img}
                    boxSize={{
                      md: '42px',
                      sm: '32px',
                      xs: '32px',
                    }}
                    borderRadius={8}
                    fit={'contain'}
                  />
                  <Text
                    display='inline-block'
                    overflow='hidden'
                    whiteSpace='nowrap'
                    textOverflow='ellipsis'
                  >
                    {name}
                  </Text>
                </Flex>
              )}
            </NftInfoComponent>
          )
        },
      },
      {
        title: 'Down payment',
        dataIndex: 'down_payment',
        key: 'down_payment',
        render: (value: any) => (
          <EthText>{formatFloat(wei2Eth(value))}</EthText>
        ),
      },
      {
        title: 'Loan Amount',
        dataIndex: 'loan_amount',
        key: 'loan_amount',
        align: 'center',
        thAlign: 'center',
        render: (value: any) => (
          <EthText>{formatFloat(wei2Eth(value))}</EthText>
        ),
      },
      {
        title: 'Duration',
        dataIndex: 'tenor',
        key: 'tenor',
        align: 'center',
        thAlign: 'center',
        render: (value: any) => {
          const d = Number(value) / 60 / 60 / 24
          return <Text>{formatPluralUnit(d, 'day')}</Text>
        },
      },
      {
        title: 'Interest',
        dataIndex: 'offer_ir',
        key: 'offer_ir',
        thAlign: 'center',
        align: 'center',
        render: (value: any) => <Text>{Number(value) / 100}% APR</Text>,
      },
      {
        title: 'Apply Date',
        dataIndex: 'created_at',
        key: 'created_at',
        thAlign: 'center',
        align: 'center',
        render: (value: any) => (
          <Text>{dayjs(value).format('YYYY-MM-DD HH:mm')}</Text>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        thAlign: 'center',
        render: (value: any) => {
          let status = '--'
          if (value === LOAN_ORDER_STATUS.Completed) {
            status = LOAN_ORDER_STATUS_TEXT.Succeeded
          }
          if (value === LOAN_ORDER_STATUS.Refunded) {
            status = LOAN_ORDER_STATUS_TEXT.Refunded
          }
          if (
            [
              LOAN_ORDER_STATUS.New,
              LOAN_ORDER_STATUS.DownPaymentConfirmed,
              LOAN_ORDER_STATUS.PendingPurchase,
              LOAN_ORDER_STATUS.PurchaseSubmitted,
              LOAN_ORDER_STATUS.PurchaseConfirmed,
              LOAN_ORDER_STATUS.PendingLoan,
              LOAN_ORDER_STATUS.LoanSubmitted,
            ].includes(value)
          ) {
            status = LOAN_ORDER_STATUS_TEXT.Processing
          }
          if (value === LOAN_ORDER_STATUS.Failed)
            status = LOAN_ORDER_STATUS_TEXT.Failed
          if (value === LOAN_ORDER_STATUS.Cancelled)
            status = LOAN_ORDER_STATUS_TEXT.Canceled
          return <Text>{status}</Text>
        },
      },
      {
        title: 'Remark',
        dataIndex: 'id',
        key: 'id',
        align: 'center',
        thAlign: 'center',
        render: (_: any, info: any) => (
          <Text>
            {info?.status === LOAN_ORDER_STATUS.Refunded
              ? 'Refunded down payment'
              : ''}
          </Text>
        ),
      },
    ]
  }, [])

  const repayColumns: ColumnProps[] = useMemo(() => {
    return [
      {
        title: 'Asset',
        dataIndex: 'token_id',
        key: 'token_id',
        align: 'left',
        width: 240,
        render: (value: any, info: any) => {
          return (
            <NftInfoComponent
              tokenId={value}
              contractAddress={info.contract_addr}
            >
              {({ img, name }) => (
                <Flex alignItems={'center'} gap={'8px'} w='100%'>
                  <ImageWithFallback
                    src={img}
                    boxSize={{
                      md: '42px',
                      sm: '32px',
                      xs: '32px',
                    }}
                    borderRadius={8}
                    fit={'contain'}
                  />
                  <Text
                    display='inline-block'
                    overflow='hidden'
                    whiteSpace='nowrap'
                    textOverflow='ellipsis'
                  >
                    {name}
                  </Text>
                </Flex>
              )}
            </NftInfoComponent>
          )
        },
      },
      {
        title: 'Installments',
        dataIndex: 'type',
        align: 'center',
        thAlign: 'center',
        key: 'type',
        render: (value: any, info: any) => (
          <>
            {value === 'repayment'
              ? `${info.payment_number} / ${info.number_of_installments || ''}`
              : null}
            {value === 'payoff' ? 'Paid off' : null}
          </>
        ),
      },
      {
        title: 'Repayment Amount',
        dataIndex: 'repaid_amt',
        key: 'repaid_amt',
        align: 'center',
        thAlign: 'center',
        render: (value: any) => (
          <EthText>{formatFloat(wei2Eth(Number(value)))}</EthText>
        ),
      },
      {
        title: 'Paid Date',
        dataIndex: 'blk_time',
        key: 'blk_time',
        align: 'center',
        thAlign: 'center',
        render: (value: any) => <>{dayjs(value).format('YYYY-MM-DD HH:mm')}</>,
      },
      {
        title: 'Status',
        dataIndex: 'id',
        key: 'id',
        thAlign: 'center',
        align: 'center',
        render: () => <>Succeeded</>,
      },
    ]
  }, [])

  const saleColumns: ColumnProps[] = useMemo(() => {
    return [
      {
        title: 'Asset',
        dataIndex: 'token_id',
        key: 'token_id',
        width: 240,
        render: (value: any, info: any) => {
          return (
            <NftInfoComponent
              tokenId={value}
              contractAddress={info.contract_address}
            >
              {({ img, name }) => (
                <Flex alignItems={'center'} gap={'8px'} w='100%'>
                  <ImageWithFallback
                    src={img}
                    boxSize={{
                      md: '42px',
                      sm: '32px',
                      xs: '32px',
                    }}
                    borderRadius={8}
                  />
                  <Text
                    display='inline-block'
                    overflow='hidden'
                    whiteSpace='nowrap'
                    textOverflow='ellipsis'
                  >
                    {name}
                  </Text>
                </Flex>
              )}
            </NftInfoComponent>
          )
        },
      },
      {
        title: 'List Price',
        dataIndex: 'price',
        key: 'price',
        align: 'center',
        thAlign: 'center',
        render: (value: any, info: any) => (
          <EthText>{info.type === 1 ? formatFloat(value) : '--'}</EthText>
        ),
      },
      {
        title: 'Platform',
        dataIndex: 'platform',
        align: 'center',
        thAlign: 'center',
        key: 'platform',
        render: (value: any) => <Text>{capitalize(value)}</Text>,
      },
      {
        title: 'Expiration',
        dataIndex: 'expiration_time',
        align: 'center',
        thAlign: 'center',
        key: 'expiration_time',
        render: (value: any, info: any) => {
          return (
            <Text>
              {info.type === 1 ? unix(value).format('YYYY-MM-DD HH:mm') : '--'}
            </Text>
          )
        },
      },
      {
        title: 'type',
        dataIndex: 'type',
        align: 'center',
        thAlign: 'center',
        key: 'type',
        render: (value: any) => (
          <Text>{value === 1 ? 'Listing' : 'Cancel Listing'}</Text>
        ),
      },
      {
        title: 'Date',
        dataIndex: 'created_at',
        key: 'created_at',
        align: 'center',
        thAlign: 'center',
        render: (value: any) => (
          <Text>{dayjs(value).format('YYYY/MM/DD HH:mm')}</Text>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
        thAlign: 'center',
        render: (value: any, info: any) => {
          let status = '--'
          // Listing 操作
          if (info.type === 1) {
            if (value === LISTING_ORDER_STATUS.Listed)
              status = LISTING_ORDER_STATUS_TEXT.Succeeded
            if (value === LISTING_ORDER_STATUS.Completed)
              status = LISTING_ORDER_STATUS_TEXT.Sold
            if (value === LISTING_ORDER_STATUS.Cancelled)
              status = LISTING_ORDER_STATUS_TEXT.Canceled
          }
          // Cancel List 操作
          if (info.type === 2 && value === LISTING_ORDER_STATUS.Completed) {
            status = LISTING_ORDER_STATUS_TEXT.Succeeded
          }
          if (
            [
              LISTING_ORDER_STATUS.Rejected,
              LISTING_ORDER_STATUS.InstRejected,
              LISTING_ORDER_STATUS.Failed,
            ].includes(value)
          ) {
            status = LISTING_ORDER_STATUS_TEXT.Failed
          }
          if (
            [
              LISTING_ORDER_STATUS.New,
              LISTING_ORDER_STATUS.PendingProgress,
              LISTING_ORDER_STATUS.PendingApproval,
              LISTING_ORDER_STATUS.Approved,
              LISTING_ORDER_STATUS.CoinTransferred,
            ].includes(value)
          ) {
            status = LISTING_ORDER_STATUS_TEXT.Processing
          }
          if (value === LISTING_ORDER_STATUS.Liquidated) {
            status = LISTING_ORDER_STATUS_TEXT.Canceled
          }
          return <Text>{status}</Text>
        },
      },
    ]
  }, [])

  if (!params || !['loan', 'repay', 'sale'].includes(params?.type)) {
    return <NotFound backTo='/history/loan' />
  }

  return (
    <RootLayout mb='100px'>
      <Box mt='60px' mb='40px'>
        <Heading fontWeight={'700'} fontSize={'48px'}>
          My Loan History
        </Heading>
        <Text color='gray.3' fontWeight={'500'} fontSize={'20px'}>
          View and track all your loan activity history
        </Text>
        <Button
          hidden
          variant={'primary'}
          onClick={async () => {
            // const balance =await  api.account.txlist(
            //   currentAccount,
            //   1,
            //   'latest',
            //   1,
            //   100,
            //   'desc',
            // )
          }}
        >
          fetch
        </Button>
      </Box>
      {!isConnected ? (
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
            Please click to sign in and accept the xBank Terms of Service
          </AlertTitle>
          <AlertDescription>
            <Button
              mt='20px'
              onClick={async () => {
                if (loading) return
                if (!currentAccount?.address) return
                handleSignDebounce(currentAccount.address)
              }}
              variant={'outline'}
              isDisabled={loading}
              isLoading={loading}
            >
              Click to Sign
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs
          pb='40px'
          isLazy
          index={tabKey}
          position='relative'
          onChange={(key) => {
            switch (key) {
              case 0:
                navigate('/history/loan')
                break
              case 1:
                navigate('/history/repay')
                break
              case 2:
                navigate('/history/sale')
                break

              default:
                break
            }
          }}
        >
          <TabList
            _active={{
              color: 'blue.1',
              fontWeight: 'bold',
            }}
            position='sticky'
            top={{ md: '131px', sm: '131px', xs: '107px' }}
            bg='white'
            zIndex={2}
          >
            <TabWrapper count={loanData?.length}>Loan</TabWrapper>
            <TabWrapper count={repayData?.length}>Repay</TabWrapper>
            <TabWrapper count={listData?.length}>Sale</TabWrapper>
          </TabList>

          <TabPanels>
            <TabPanel p={0} pb='20px'>
              <TableWithPagination
                table={{
                  loading: loanLoading,
                  columns: loanColumns,
                  data: sortedLoanData,
                  emptyRender: () => {
                    return (
                      <EmptyComponent
                        action={() => {
                          return (
                            <Button
                              variant={'secondary'}
                              minW='200px'
                              onClick={() =>
                                interceptFn(() => navigate('/market'))
                              }
                            >
                              + Buy NFTs Pay Later
                            </Button>
                          )
                        }}
                      />
                    )
                  },
                }}
              />
            </TabPanel>
            <TabPanel p={0} pb='20px'>
              <TableWithPagination
                table={{
                  loading: repayLoading,
                  columns: repayColumns,
                  data: sortedRepayData,
                }}
              />
            </TabPanel>
            <TabPanel p={0} pb='20px'>
              <TableWithPagination
                table={{
                  loading: listLoading,
                  columns: saleColumns,
                  data: sortedListData,
                }}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}

      <ConnectWalletModal visible={isOpen} handleClose={onClose} />
    </RootLayout>
  )
}

export default History
