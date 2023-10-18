import {
  Box,
  Button,
  Flex,
  Tab,
  TabList,
  TabIndicator,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Heading,
  Tag,
  List,
  Highlight,
  Drawer,
  useDisclosure,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  type TabProps,
  ScaleFade,
} from '@chakra-ui/react'
import useDebounce from 'ahooks/lib/useDebounce'
import useRequest from 'ahooks/lib/useRequest'
import BigNumber from 'bignumber.js'
import { unix } from 'dayjs'
import { groupBy } from 'lodash'
import { isEmpty } from 'lodash'
import { maxBy } from 'lodash'
import { omit } from 'lodash'
import { reduce } from 'lodash'
import { sortBy } from 'lodash'
import {
  useEffect,
  useMemo,
  useState,
  type FunctionComponent,
  useRef,
} from 'react'
// import Joyride from 'react-joyride'
import { useLocation, useNavigate } from 'react-router-dom'

import { apiGetLoans, apiGetPools } from 'api'
import ImgLend from 'assets/LEND.png'
import {
  ConnectWalletModal,
  LoadingComponent,
  EmptyComponent,
  SvgComponent,
  EthText,
  ImageWithFallback,
  type ColumnProps,
  SearchInput,
  NoticeSlider,
  NftInfoComponent,
  TableWithPagination,
} from 'components'
import { UNIT, LOAN_STATUS, FRONTEND_LOAN_STATUS } from 'constants/index'
import type { NftCollection } from 'hooks'
import { useWallet } from 'hooks'
import LendLayout from 'layouts/LendLayout'
import { formatAddress, formatFloat, formatPluralUnit } from 'utils/format'
import { wei2Eth } from 'utils/unit-conversion'
import { isAddressEqual } from 'utils/utils'

import AllPoolsDescription from './components/AllPoolsDescription'
import CollectionListItem from './components/CollectionListItem'
import MyPoolActionRender from './components/MyPoolActionRender'

type Dictionary<T> = Record<string, T>

enum TAB_KEY {
  COLLECTION_TAB = 0,
  MY_POOLS_TAB = 1,
  LOANS_TAB = 2,
}

const TabWrapper: FunctionComponent<TabProps> = ({ children, ...rest }) => {
  return (
    <Tab
      pt='14px'
      px='6px'
      pb='20px'
      // _selected={{
      //   color: 'blue.1',
      //   borderBottomWidth: 2,
      //   borderColor: 'blue.1',
      // }}
      display={'inline-block'}
      {...rest}>
      <Text
        fontWeight='bold'
        fontSize='16px'>
        {children}
      </Text>
    </Tab>
  )
}

/**
 * 1. Collections
 *    1.1 /lending/api/v1/nft/pools = all pools
 *    1.2 forEach CollectionList => filter collectionWithPool => calculate summary items
 *    1.3 [{...collection, ...pools}]
 * 2. MyPools
 *    2.1 1.1 => filter currentAccount pools => myPoolsData
 *    2.2 myPoolsData => [{...collection, ...pools}]
 * 3. Loans
 *    3.1 /lending/api/v1/loans?lender_address=xxx = current loans
 *    2.1 forEach useAssetQuery = nft info
 * @returns Collections  MyPools Loans
 */
const Lend = () => {
  const tabListRef = useRef<HTMLDivElement>(null)

  const [tabKey, setTabKey] = useState<TAB_KEY>(TAB_KEY.COLLECTION_TAB)

  const { isOpen: showSearch, onToggle: toggleShowSearch } = useDisclosure()

  const {
    isOpen,
    onClose,
    interceptFn,
    currentAccount,
    collectionList,
    collectionLoading,
    noticeConfig: { data: noticeData },
    isConnected,
    myPoolsConfig: {
      data: myPoolsData,
      loading: poolsLoading2,
      refresh: refreshMyPools,
    },
  } = useWallet()

  const { pathname } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setTabKey(() => {
      switch (pathname) {
        case '/lending/collections':
          return TAB_KEY.COLLECTION_TAB
        case '/lending/my-pools':
          interceptFn()
          return TAB_KEY.MY_POOLS_TAB
        case '/lending/loans':
          interceptFn()
          return TAB_KEY.LOANS_TAB
        default:
          return TAB_KEY.COLLECTION_TAB
      }
    })
  }, [pathname, interceptFn])

  useEffect(() => {
    if (!tabListRef?.current) return
    if (tabKey !== TAB_KEY.LOANS_TAB) {
      tabListRef.current.scrollTo(0, 0)
    } else {
      tabListRef.current.scrollTo(tabListRef.current.scrollWidth, 0)
    }
  }, [tabKey, tabListRef])

  /**
   * 进入页面 fetch all pools => for 'Collections Tab'
   * filter owner_address === currentAccount => for 'My Pools Tab'
   *  */
  const { loading: poolsLoading1, data: allPoolsData } = useRequest(
    apiGetPools,
    {
      ready: tabKey === TAB_KEY.COLLECTION_TAB,
      debounceWait: 10,
    },
  )

  /**
   * Collection Tab
   * 1. map All Pool => Collection Address with pools Address
   * 2. filter collectionList => Collection info with pools
   * 3. map Collection info with pools => fiter pools => [{...collection, ...pools}]
   */
  const activeCollectionList = useMemo(() => {
    if (!allPoolsData) return []
    const collectionsAddressWithPools = [
      ...new Set(allPoolsData?.map((i) => i.collateral_contract.toLowerCase())),
    ]
    const collectionsWithPools = collectionList.filter((i) =>
      collectionsAddressWithPools.includes(i.contractAddress.toLowerCase()),
    )
    return sortBy(
      collectionsWithPools.map(({ contractAddress, ...rest }) => {
        const currentCollectionPools = allPoolsData.filter((item) =>
          isAddressEqual(item.collateral_contract, contractAddress),
        )
        const max_collateral_factor = maxBy(
          currentCollectionPools,
          (i) => i.max_collateral_factor,
        )?.max_collateral_factor

        const max_interest_rate = maxBy(
          currentCollectionPools,
          (i) => i.max_interest_rate,
        )?.max_interest_rate

        const supply_cap = reduce(
          currentCollectionPools,
          (sum, i) => {
            const _size = BigNumber(i.supply_cap).minus(i.supply_used || 0)
            return BigNumber(sum).plus(_size.lte(0) ? BigNumber(0) : _size)
          },
          BigNumber(0),
        )

        const isContainMyPool =
          currentCollectionPools?.findIndex((i) =>
            isAddressEqual(i.owner, currentAccount?.address),
          ) !== -1

        return {
          max_collateral_factor,
          max_interest_rate,
          supply_cap,
          contractAddress,
          isContainMyPool,
          ...rest,
        }
      }),
      'supply_cap',
      (i) => Number(i.supply_cap),
    )
  }, [collectionList, allPoolsData, currentAccount])

  const [activeCollectionSearchValue, setActiveCollectionSearchValue] =
    useState('')
  const debounceActiveCollectionSearchValue = useDebounce(
    activeCollectionSearchValue,
    {
      wait: 500,
    },
  )
  const filteredActiveCollectionList = useMemo(() => {
    if (!debounceActiveCollectionSearchValue) return activeCollectionList || []
    return activeCollectionList.filter((item) =>
      item.nftCollection?.name
        .toLocaleLowerCase()
        .includes(debounceActiveCollectionSearchValue.toLocaleLowerCase()),
    )
  }, [debounceActiveCollectionSearchValue, activeCollectionList])

  /**
   * My Pools Tab
   * 1. myPoolsData append collection info
   */
  const poolList = useMemo(() => {
    if (!myPoolsData) return []
    return myPoolsData?.map((item) => {
      const nftCollection = collectionList.find((i) =>
        isAddressEqual(i.contractAddress, item.collateral_contract),
      )?.nftCollection
      return {
        ...item,
        nftCollection,
      }
    })
  }, [myPoolsData, collectionList])

  const [myPoolsSearchValue, setMyPoolsSearchValue] = useState('')
  const debounceMyPoolsSearchValue = useDebounce(myPoolsSearchValue, {
    wait: 500,
  })

  const filteredPoolList = useMemo(() => {
    if (!debounceMyPoolsSearchValue) return poolList || []
    return poolList.filter((item) =>
      item.nftCollection?.name
        .toLocaleLowerCase()
        .includes(debounceMyPoolsSearchValue.toLocaleLowerCase()),
    )
  }, [debounceMyPoolsSearchValue, poolList])

  /**
   * Loan Tab 左侧
   */
  // loan 左侧选择某一个 pool
  const [selectKeyForOpenLoans, setSelectKeyForOpenLoans] = useState<string>()
  // loan 左侧 loan totalCount
  const [totalLoanCount, setTotalLoanCount] = useState(0)
  // debounce search value
  const [loanCollectionSearchValue, setLoanCollectionSearchValue] = useState('')
  const debounceLoanCollectionSearchValue = useDebounce(
    loanCollectionSearchValue,
    {
      wait: 500,
    },
  )
  // filtered by debounceSearchValue pool list
  const filteredPoolCollectionList = useMemo(() => {
    if (!poolList) return []
    if (!debounceLoanCollectionSearchValue) return poolList || []

    return poolList.filter((item) =>
      item.nftCollection?.name
        .toLocaleLowerCase()
        .includes(debounceLoanCollectionSearchValue.toLocaleLowerCase()),
    )
  }, [poolList, debounceLoanCollectionSearchValue])

  /**
   * Loan 右侧
   */
  // groupBy loan status
  const [loansData, setLoansData] = useState<Dictionary<LoanListItemType[]>>({
    [FRONTEND_LOAN_STATUS.OPEN]: [],
    [FRONTEND_LOAN_STATUS.PAID_OFF]: [],
    [FRONTEND_LOAN_STATUS.OVERDUE]: [],
  })
  const { loading: loansLoading } = useRequest(
    () =>
      apiGetLoans({
        lender: currentAccount?.address,
        collateral_contract: selectKeyForOpenLoans,
      }),
    {
      onSuccess: async (data) => {
        if (!isConnected) {
          setLoansData({
            [FRONTEND_LOAN_STATUS.OPEN]: [],
            [FRONTEND_LOAN_STATUS.PAID_OFF]: [],
            [FRONTEND_LOAN_STATUS.OVERDUE]: [],
          })
          return
        }
        const groupedData = groupBy(data, 'status')
        setLoansData({
          [FRONTEND_LOAN_STATUS.OPEN]: groupedData[LOAN_STATUS.OPEN],
          [FRONTEND_LOAN_STATUS.PAID_OFF]: [
            ...(groupedData?.[LOAN_STATUS.PAYOFF] || []),
            ...(groupedData?.[LOAN_STATUS.FULL_TENOR] || []),
            ...(groupedData?.[LOAN_STATUS.COLLATERAL_SALE] || []),
          ],
          [FRONTEND_LOAN_STATUS.OVERDUE]: groupedData[LOAN_STATUS.OVERDUE],
        })
        if (selectKeyForOpenLoans === undefined) {
          setTotalLoanCount(data?.length)
        }
      },
      ready: !!isConnected && tabKey === TAB_KEY.LOANS_TAB,
      refreshDeps: [selectKeyForOpenLoans, isConnected, currentAccount],
      debounceWait: 100,
    },
  )

  const activeCollectionColumns: ColumnProps[] = useMemo(() => {
    return [
      {
        title: 'Collection',
        dataIndex: 'nftCollection',
        key: 'contractAddress',
        align: 'left',
        width: 320,
        render: (value: any) => {
          return (
            <Flex
              alignItems={'center'}
              gap={'8px'}
              w='100%'>
              <ImageWithFallback
                src={value?.imagePreviewUrl}
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
                textOverflow='ellipsis'>
                {value?.name || '--'}
              </Text>
              {value?.safelistRequestStatus === 'verified' && (
                <SvgComponent svgId='icon-verified-fill' />
              )}
            </Flex>
          )
        },
      },
      {
        title: 'Est. Floor*',
        dataIndex: 'nftCollection',
        key: 'id',
        align: 'right',
        thAlign: 'right',
        render: (info: any) => {
          // 后期需要优化
          return (
            <Flex alignItems={'center'}>
              <SvgComponent svgId='icon-eth' />
              <Text>{formatFloat(info?.nftCollectionStat?.floorPrice)}</Text>
            </Flex>
          )
        },
      },
      {
        title: 'Supply Caps',
        dataIndex: 'supply_cap',
        key: 'supply_cap',
        align: 'right',
        thAlign: 'right',
        render: (value: any) => (
          <EthText>{formatFloat(wei2Eth(value))}</EthText>
        ),
      },
      {
        title: 'Collateral Factor',
        dataIndex: 'max_collateral_factor',
        key: 'max_collateral_factor',
        align: 'center',
        thAlign: 'center',
        render: (value: any) => <Text>{Number(value) / 100} %</Text>,
      },
      {
        title: 'Interest',
        dataIndex: 'max_interest_rate',
        key: 'max_interest_rate',
        thAlign: 'right',
        align: 'right',
        render: (value: any) => <Text>{Number(value) / 100}% APR</Text>,
      },
      {
        title: 'Trade',
        dataIndex: 'nftCollection',
        key: 'nftCollection',
        align: 'right',
        fixedRight: true,
        thAlign: 'right',
        render: (_: any, info: any) => {
          return (
            <Flex
              alignItems='center'
              gap={'8px'}>
              <Text
                color={info.isContainMyPool ? 'gray.1' : 'blue.1'}
                onClick={() => {
                  interceptFn(() => {
                    if (info.isContainMyPool) return
                    navigate(`/lending/create/${info.contractAddress}`)
                  })
                }}
                cursor={info.isContainMyPool ? 'not-allowed' : 'pointer'}>
                Supply
              </Text>
            </Flex>
          )
        },
      },
    ]
  }, [navigate, interceptFn])

  const myPoolsColumns: ColumnProps[] = useMemo(() => {
    return [
      {
        title: 'Collection',
        dataIndex: 'nftCollection',
        key: 'nftCollection',
        align: 'left',
        width: 240,
        render: (value: any) => {
          return (
            <Flex
              alignItems={'center'}
              gap={'8px'}
              w='100%'>
              <ImageWithFallback
                src={value?.imagePreviewUrl}
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
                textOverflow='ellipsis'>
                {value?.name || '--'}
              </Text>
              {value?.safelistRequestStatus === 'verified' && (
                <SvgComponent svgId='icon-verified-fill' />
              )}
            </Flex>
          )
        },
      },
      {
        title: 'Est. Floor*',
        dataIndex: 'activity',
        key: 'activity',
        align: 'right',
        thAlign: 'right',
        render: (_: any, info: any) => {
          return (
            <Flex alignItems={'center'}>
              <SvgComponent svgId='icon-eth' />
              <Text>
                {formatFloat(
                  info?.nftCollection?.nftCollectionStat?.floorPrice,
                )}
              </Text>
            </Flex>
          )
        },
      },
      {
        title: 'Supply Caps',
        dataIndex: 'supply_cap',
        key: 'supply_cap',
        align: 'right',
        thAlign: 'right',
        render: (value: any, info: any) => (
          <EthText>
            {formatFloat(
              wei2Eth(Number(value) - Number(info.supply_used || 0)),
            )}
          </EthText>
        ),
      },
      {
        title: 'Max Loan Amount',
        dataIndex: 'single_cap',
        key: 'single_cap',
        align: 'right',
        render: (value: any) => (
          <EthText>{formatFloat(wei2Eth(value))}</EthText>
        ),
      },
      {
        title: 'Collateral Factor',
        dataIndex: 'max_collateral_factor',
        key: 'max_collateral_factor',
        align: 'center',
        thAlign: 'center',
        render: (value: any) => <Text>{Number(value) / 100} %</Text>,
      },
      {
        title: 'Duration',
        dataIndex: 'max_tenor',
        key: 'max_tenor',
        align: 'right',
        thAlign: 'right',
        render: (value: any) => (
          <Text>{formatPluralUnit(value / 3600 / 24, 'day')}</Text>
        ),
      },
      {
        title: 'Interest',
        dataIndex: 'max_interest_rate',
        key: 'max_interest_rate',
        thAlign: 'right',
        align: 'right',
        render: (value: any) => <Text>{Number(value) / 100}% APR</Text>,
      },
      {
        title: 'Supporting Loans',
        dataIndex: 'loan_count',
        key: 'loan_count',
        align: 'center',
        thAlign: 'center',
      },
      {
        title: '',
        dataIndex: 'collateral_contract',
        key: 'collateral_contract',
        align: 'right',
        fixedRight: true,
        thAlign: 'right',
        render: (value: any, info: any) => {
          const poolData = omit(info, 'nftCollection') as PoolsListItemType
          const collectionData = info?.nftCollection as NftCollection

          return (
            <MyPoolActionRender
              poolData={poolData}
              collectionData={collectionData}
              onClickDetail={() => setSelectKeyForOpenLoans(value)}
              onRefresh={refreshMyPools}
            />
          )
        },
      },
    ]
  }, [refreshMyPools])

  const loansForLendColumns: ColumnProps[] = useMemo(() => {
    return [
      {
        title: 'Asset',
        dataIndex: 'token_id',
        key: 'token_id',
        align: 'left',
        width: {
          lg: 200,
          md: 150,
          sm: 130,
          xs: 130,
        },
        thAlign: 'left',
        render: (token_id: any, info: any) => {
          // collateralContract  tokenID
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
                  />
                  <Text
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
        title: 'Lender',
        dataIndex: 'lender',
        key: 'lender',
        // lender
        render: (value: any) => <Text>{formatAddress(value?.toString())}</Text>,
      },
      {
        title: 'Borrower',
        dataIndex: 'borrower',
        key: 'borrower',
        thAlign: 'right',
        align: 'right',
        // borrower
        render: (value: any) => <Text>{formatAddress(value?.toString())}</Text>,
      },
      {
        title: 'Start time',
        dataIndex: 'start_time',
        thAlign: 'right',
        align: 'right',
        key: 'start_time',
        // startTime
        render: (value: any) => (
          <Text>{unix(value).format('YYYY/MM/DD HH:mm:ss')}</Text>
        ),
      },
      {
        title: 'Loan value',
        dataIndex: 'loan_amount',
        align: 'right',
        thAlign: 'right',
        key: 'loan_amount',
        render: (value: any) => (
          // loanAmount
          <Text>
            {formatFloat(wei2Eth(value))} {UNIT}
          </Text>
        ),
      },
      {
        title: 'Duration',
        dataIndex: 'tenor',
        align: 'right',
        thAlign: 'right',
        key: 'tenor',
        render: (value: any) => {
          // tenor
          return <Text>{formatPluralUnit(value / 3600 / 24, 'day')}</Text>
        },
      },
      {
        title: 'Interest',
        dataIndex: 'each_payment',
        key: 'each_payment',
        render: (each_payment: any, item: Record<string, any>) => {
          // eachPayment * numberOfInstallments - loanAmount
          return (
            <Text>
              {formatFloat(
                BigNumber(
                  wei2Eth(
                    BigNumber(each_payment)
                      .multipliedBy(item?.number_of_installments)
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
  }, [])

  // 移动端 loan 左侧 collection pools draw
  const {
    isOpen: drawVisible,
    onOpen: openDraw,
    onClose: closeDraw,
  } = useDisclosure()
  return (
    <LendLayout mb='100px'>
      <Box
        my={{
          md: '60px',
          sm: '24px',
          xs: '24px',
        }}
        className='my-first-step'>
        <AllPoolsDescription
          data={{
            img: ImgLend,
            title: 'Lend',
            description:
              'Provide funds to support NFT Buy Now Pay Later, \nreceive interests or discounts on NFTs as collateral.',
          }}
        />
      </Box>
      {/* <Joyride steps={steps} continuous run /> */}
      <NoticeSlider data={noticeData} />

      <Tabs
        variant='unstyled'
        marginTop={'20px'}
        isLazy
        index={tabKey}
        position='relative'
        onChange={(key) => {
          switch (key) {
            case 0:
              navigate('/lending/collections')
              break
            case 1:
              navigate('/lending/my-pools')
              break
            case 2:
              navigate('/lending/loans')
              break

            default:
              break
          }
        }}>
        <Box
          overflowX={{
            md: 'visible',
            sm: 'hidden',
            xs: 'auto',
          }}
          ref={tabListRef}
          className='scroll-bar-hidden'
          position='sticky'
          top={{ md: '131px', sm: '131px', xs: '107px' }}
          bg='white'
          zIndex={10}>
          {[TAB_KEY.COLLECTION_TAB, TAB_KEY.MY_POOLS_TAB].includes(tabKey) && (
            <Flex
              position={'absolute'}
              right={0}
              top={'8px'}
              gap={'16px'}
              zIndex={3}
              display={{
                md: 'flex',
                sm: 'none',
                xs: 'none',
              }}>
              <ScaleFade
                in={showSearch}
                initialScale={0.9}>
                <SearchInput
                  value={
                    tabKey === TAB_KEY.COLLECTION_TAB
                      ? activeCollectionSearchValue
                      : myPoolsSearchValue
                  }
                  onChange={(e) => {
                    if (tabKey === TAB_KEY.COLLECTION_TAB) {
                      setActiveCollectionSearchValue(e.target.value)
                    }
                    if (tabKey === TAB_KEY.MY_POOLS_TAB) {
                      setMyPoolsSearchValue(e.target.value)
                    }
                  }}
                />
              </ScaleFade>

              <Flex
                h='44px'
                w='44px'
                borderRadius={44}
                justify='center'
                alignItems={'center'}
                cursor='pointer'
                onClick={toggleShowSearch}
                _hover={{
                  bg: `var(--chakra-colors-gray-5)`,
                }}
                hidden={showSearch}>
                <SvgComponent
                  svgId='icon-search'
                  fill={'gray.3'}
                />
              </Flex>
              {((tabKey === TAB_KEY.COLLECTION_TAB &&
                !isEmpty(activeCollectionList)) ||
                (tabKey === TAB_KEY.MY_POOLS_TAB && !isEmpty(myPoolsData))) && (
                <Button
                  variant={'secondary'}
                  minW='200px'
                  onClick={() => interceptFn(() => navigate('/lending/create'))}
                  className='my-other-step'>
                  + Create New Pool
                </Button>
              )}
            </Flex>
          )}
          <TabList
            position='sticky'
            top={{ md: '131px', sm: '131px', xs: '107px' }}
            bg='white'
            zIndex={2}
            w={{
              md: '100%',
              sm: 'max-content',
              xs: 'max-content',
            }}
            justifyContent={{
              md: 'flex-start',
              sm: 'space-between',
              xs: 'space-between',
            }}
            borderBottomWidth={'1px'}
            borderBottomColor={'gray.1'}>
            <TabWrapper>Collections</TabWrapper>
            <TabWrapper>
              My Pools
              {!isEmpty(myPoolsData) && (
                <Tag
                  bg={'blue.1'}
                  color='white'
                  borderRadius={15}
                  fontSize='12px'
                  w='27px'
                  h='20px'
                  textAlign={'center'}
                  justifyContent='center'
                  lineHeight={2}
                  fontWeight='700'
                  ml='4px'>
                  {poolList?.length}
                </Tag>
              )}
            </TabWrapper>
            <TabWrapper>Outstanding Loans</TabWrapper>
          </TabList>
          <TabIndicator
            height='2px'
            bg='blue.1'
            zIndex={2}
            mt={'-2px'}
            borderRadius='1px'
          />
        </Box>

        <Box
          display={{
            md: 'none',
            sm: 'block',
            xs: 'block',
          }}
          mt='20px'
          hidden={
            tabKey === TAB_KEY.LOANS_TAB ||
            (tabKey === TAB_KEY.COLLECTION_TAB &&
              isEmpty(activeCollectionList)) ||
            (tabKey === TAB_KEY.MY_POOLS_TAB && isEmpty(poolList))
          }>
          <SearchInput
            value={
              tabKey === TAB_KEY.COLLECTION_TAB
                ? activeCollectionSearchValue
                : myPoolsSearchValue
            }
            onChange={(e) => {
              if (tabKey === TAB_KEY.COLLECTION_TAB) {
                setActiveCollectionSearchValue(e.target.value)
              }
              if (tabKey === TAB_KEY.MY_POOLS_TAB) {
                setMyPoolsSearchValue(e.target.value)
              }
            }}
          />
        </Box>
        <TabPanels>
          <TabPanel
            p={0}
            pb='20px'>
            <TableWithPagination
              table={{
                loading: poolsLoading1 || collectionLoading,
                columns: activeCollectionColumns,
                data: filteredActiveCollectionList || [],
                emptyRender: () => {
                  return (
                    <EmptyComponent
                      action={() => {
                        return (
                          <Button
                            variant={'secondary'}
                            minW='200px'
                            onClick={() =>
                              interceptFn(() => navigate('/lending/create'))
                            }>
                            + Create New Pool
                          </Button>
                        )
                      }}
                    />
                  )
                },
              }}
            />
          </TabPanel>
          <TabPanel
            p={0}
            pb='20px'>
            <TableWithPagination
              table={{
                loading: poolsLoading2 || collectionLoading,
                columns: myPoolsColumns,
                data: filteredPoolList || [],
                emptyRender: () => {
                  return (
                    <EmptyComponent
                      action={() => {
                        return (
                          <Button
                            variant={'secondary'}
                            minW='200px'
                            onClick={() =>
                              interceptFn(() => navigate('/lending/create'))
                            }>
                            + Create New Pool
                          </Button>
                        )
                      }}
                    />
                  )
                },
              }}
            />
          </TabPanel>
          <TabPanel
            p={0}
            pb='20px'>
            <Flex
              justify={'space-between'}
              mt='16px'
              flexWrap='wrap'>
              <Box
                border={`1px solid var(--chakra-colors-gray-2)`}
                borderRadius={12}
                p={'24px'}
                w={{
                  xl: '360px',
                  lg: '300px',
                  md: '260px',
                }}
                display={{
                  md: 'block',
                  sm: 'none',
                  xs: 'none',
                }}>
                <Heading
                  mb='16px'
                  fontSize={'16px'}>
                  My Collection Pools
                </Heading>
                <Box
                  hidden={
                    !loanCollectionSearchValue &&
                    !filteredPoolCollectionList?.length
                  }>
                  <SearchInput
                    placeholder='Collections...'
                    value={loanCollectionSearchValue}
                    onChange={(e) =>
                      setLoanCollectionSearchValue(e.target.value)
                    }
                  />
                </Box>

                <List
                  spacing='16px'
                  mt='16px'
                  position='relative'>
                  <LoadingComponent
                    loading={poolsLoading2 || collectionLoading}
                    top={0}
                  />
                  {isEmpty(filteredPoolCollectionList) &&
                    !poolsLoading2 &&
                    !collectionLoading && <EmptyComponent />}
                  {!isEmpty(filteredPoolCollectionList) && (
                    <Flex
                      justify={'space-between'}
                      py='12px'
                      px='16px'
                      alignItems='center'
                      borderRadius={8}
                      border={`1px solid var(--chakra-colors-gray-2)`}
                      cursor='pointer'
                      onClick={() => setSelectKeyForOpenLoans(undefined)}
                      bg={
                        selectKeyForOpenLoans === undefined ? 'blue.2' : 'white'
                      }>
                      <Text
                        fontSize='14px'
                        fontWeight='700'>
                        All My Collections
                      </Text>
                      {selectKeyForOpenLoans === undefined ? (
                        <SvgComponent svgId='icon-checked' />
                      ) : (
                        <Text fontSize='14px'>{totalLoanCount || ''}</Text>
                      )}
                    </Flex>
                  )}

                  {!isEmpty(filteredPoolCollectionList) &&
                    filteredPoolCollectionList.map(
                      ({
                        nonce,
                        collateral_contract,
                        loan_count,
                        nftCollection,
                      }) => {
                        return (
                          <CollectionListItem
                            data={{
                              nftCollection,
                              contractAddress: collateral_contract,
                            }}
                            key={`${nonce}${collateral_contract}`}
                            onClick={() =>
                              setSelectKeyForOpenLoans(collateral_contract)
                            }
                            isActive={
                              collateral_contract == selectKeyForOpenLoans
                            }
                            count={loan_count}
                          />
                        )
                      },
                    )}
                </List>
              </Box>
              <Box
                w={{
                  lg: '72%',
                  md: '65%',
                  sm: '100%',
                  xs: '100%',
                }}>
                <TableWithPagination
                  table={{
                    tableTitle: () => (
                      <Heading
                        fontSize={'20px'}
                        mt={{
                          md: '16px',
                          sm: '20px',
                          xs: '20px',
                        }}>
                        Current Loans as Lender
                      </Heading>
                    ),
                    columns: loansForLendColumns,
                    loading: loansLoading,
                    data: sortBy(
                      loansData[FRONTEND_LOAN_STATUS.OPEN],
                      (i) => -i.start_time,
                    ),
                    key: '1',
                    loadingConfig: {
                      top: '30px',
                      loading: loansLoading,
                    },
                  }}
                />
                <TableWithPagination
                  table={{
                    tableTitle: () => (
                      <Heading
                        fontSize={'20px'}
                        mt={{
                          md: '16px',
                          sm: '40px',
                          xs: '40px',
                        }}>
                        <Highlight
                          styles={{
                            fontSize: '18px',
                            fontWeight: 500,
                            color: `gray.3`,
                          }}
                          query='(Paid Off)'>
                          Previous Loans as Lender(Paid Off)
                        </Highlight>
                      </Heading>
                    ),
                    columns: loansForLendColumns,
                    data: sortBy(
                      loansData[FRONTEND_LOAN_STATUS.PAID_OFF],
                      (i) => -i.start_time,
                    ),
                    loading: loansLoading,
                    key: '2',
                    loadingConfig: {
                      top: '30px',
                      loading: loansLoading,
                    },
                  }}
                />
                <TableWithPagination
                  table={{
                    tableTitle: () => (
                      <Heading
                        fontSize={'20px'}
                        mt={{
                          md: '16px',
                          sm: '40px',
                          xs: '40px',
                        }}>
                        <Highlight
                          styles={{
                            fontSize: '18px',
                            fontWeight: 500,
                            color: `gray.3`,
                          }}
                          query='(Overdue)'>
                          Previous Loans as Lender(Overdue)
                        </Highlight>
                      </Heading>
                    ),
                    columns: loansForLendColumns,
                    data: sortBy(
                      loansData[FRONTEND_LOAN_STATUS.OVERDUE],
                      (i) => -i.start_time,
                    ),
                    loading: loansLoading,
                    key: '3',
                    loadingConfig: {
                      top: '30px',
                      loading: loansLoading,
                    },
                  }}
                />
              </Box>
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {[TAB_KEY.COLLECTION_TAB, TAB_KEY.MY_POOLS_TAB].includes(tabKey) &&
        !isEmpty(myPoolsData) && (
          <Flex
            bg='white'
            position={'fixed'}
            bottom={0}
            left={0}
            right={0}
            h='74px'
            display={{ md: 'none', sm: 'flex', xs: 'flex' }}
            alignItems='center'
            justify={'center'}
            zIndex={5}
            px={8}>
            <Button
              variant={'primary'}
              w='100%'
              h='42px'
              onClick={() => interceptFn(() => navigate('/lending/create'))}>
              + Create New Pool
            </Button>
          </Flex>
        )}

      {tabKey === TAB_KEY.LOANS_TAB && (
        <Flex
          bg='white'
          position={'fixed'}
          bottom={0}
          left={0}
          right={0}
          h='74px'
          display={{ md: 'none', sm: 'flex', xs: 'flex' }}
          alignItems='center'
          justify={'center'}
          zIndex={5}
          px={8}>
          <Button
            variant={'primary'}
            w='100%'
            h='42px'
            onClick={openDraw}
            leftIcon={
              <SvgComponent
                svgId='icon-search'
                fill={'white'}
              />
            }>
            My Collection Pools
          </Button>
        </Flex>
      )}
      <Drawer
        placement={'bottom'}
        onClose={closeDraw}
        isOpen={drawVisible}>
        <DrawerOverlay />
        <DrawerContent
          borderTopRadius={16}
          pb='40px'
          h='85vh'>
          <DrawerBody>
            <DrawerCloseButton mt='40px' />
            <Heading
              fontSize={'24px'}
              pt='40px'
              pb='32px'>
              My Collection Pools
            </Heading>
            <Box
              hidden={
                !loanCollectionSearchValue &&
                !filteredPoolCollectionList?.length
              }>
              <SearchInput
                placeholder='Collections...'
                value={loanCollectionSearchValue}
                onChange={(e) => setLoanCollectionSearchValue(e.target.value)}
              />
            </Box>

            <List
              spacing={'16px'}
              position='relative'
              mt='16px'>
              <LoadingComponent
                loading={poolsLoading2 || collectionLoading}
                top={0}
                borderRadius={8}
              />
              {isEmpty(filteredPoolCollectionList) &&
                !poolsLoading2 &&
                !collectionLoading && <EmptyComponent />}
              {!isEmpty(filteredPoolCollectionList) && (
                <Flex
                  justify={'space-between'}
                  py='12px'
                  px='16px'
                  alignItems='center'
                  borderRadius={8}
                  border={`1px solid var(--chakra-colors-gray-2)`}
                  cursor='pointer'
                  onClick={() => setSelectKeyForOpenLoans(undefined)}
                  bg={selectKeyForOpenLoans === undefined ? 'blue.2' : 'white'}>
                  <Text
                    fontSize='14px'
                    fontWeight='700'>
                    All My Collections
                  </Text>

                  {selectKeyForOpenLoans === undefined ? (
                    <SvgComponent svgId='icon-checked' />
                  ) : (
                    <Text fontSize='14px'>{totalLoanCount || ''}</Text>
                  )}
                </Flex>
              )}

              {!isEmpty(filteredPoolCollectionList) &&
                filteredPoolCollectionList.map(
                  ({
                    nonce,
                    collateral_contract,
                    loan_count,
                  }: PoolsListItemType) => {
                    const collection_info = collectionList?.find((i) =>
                      isAddressEqual(i.contractAddress, collateral_contract),
                    )

                    return (
                      <CollectionListItem
                        data={collection_info}
                        key={`${nonce}${collateral_contract}`}
                        onClick={() =>
                          setSelectKeyForOpenLoans(collateral_contract)
                        }
                        isActive={selectKeyForOpenLoans == collateral_contract}
                        count={loan_count}
                      />
                    )
                  },
                )}
            </List>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <ConnectWalletModal
        visible={isOpen}
        handleClose={onClose}
      />
    </LendLayout>
  )
}

export default Lend
