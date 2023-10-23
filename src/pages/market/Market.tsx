import {
  Image,
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  GridItem,
  Heading,
  List,
  SimpleGrid,
  Text,
  useDisclosure,
  Img,
  Tooltip,
} from '@chakra-ui/react'
import { useInterval, useSetState } from 'ahooks'
import useDebounce from 'ahooks/lib/useDebounce'
import useInfiniteScroll from 'ahooks/lib/useInfiniteScroll'
import useRequest from 'ahooks/lib/useRequest'
import bigNumber from 'bignumber.js'
import isEmpty from 'lodash-es/isEmpty'
import max from 'lodash-es/max'
import min from 'lodash-es/min'
import padStart from 'lodash-es/padStart'
import moment from 'moment'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { apiGetFloorPrice, apiGetPools } from '@/api'
import {
  BuyerGuideModal,
  ConnectWalletModal,
  EmptyComponent,
  LoadingComponent,
  NoticeSlider,
  SearchInput,
  TooltipComponent,
} from '@/components'
import {
  COLLECTIONS_WITH_BOXDROP_CONFIG,
  COLLECTION_STATUS_ENUM,
} from '@/constants'
import {
  NftAssetStatus,
  useNftCollectionSearchAssetLazyQuery,
  NftAssetOrderByField,
  OrderDirection,
  useNftCollectionAssetsLazyQuery,
  useWallet,
  useGuide,
  type NftCollectionSearchAssetQuery,
} from '@/hooks'
import RootLayout from '@/layouts/RootLayout'
import { wei2Eth } from '@/utils/unit-conversion'

import CollectionDescription from './components/CollectionDescription'
import CollectionListItem from './components/CollectionListItem'
import MarketNftListCard from './components/MarketNftListCard'
import Toolbar from './components/Toolbar'

const SORT_OPTIONS = [
  {
    label: 'Price: low to high',
    value: {
      direction: OrderDirection.Asc,
      field: NftAssetOrderByField.Price,
    },
  },
  {
    label: 'Price: high to low',
    value: {
      direction: OrderDirection.Desc,
      field: NftAssetOrderByField.Price,
    },
  },
  {
    label: 'Recent Created',
    value: {
      direction: OrderDirection.Desc,
      field: NftAssetOrderByField.CreatedAt,
    },
  },
]

const Market = () => {
  const cancelRef = useRef<any>()
  const navigate = useNavigate()
  const pathData = useParams()
  const { search } = useLocation()
  const {
    isOpen,
    onClose,
    interceptFn,
    noticeConfig: { data: noticeData },
    collectionList,
    collectionLoading,
    moreCollectionList,
  } = useWallet()
  const {
    isOpen: drawVisible,
    onOpen: openDraw,
    onClose: closeDraw,
  } = useDisclosure()

  const [selectCollection, setSelectCollection] =
    useState<XBNCollectionItemType>()
  const [assetSearchValue, setAssetSearchValue] = useState('')
  const debounceSearchValue = useDebounce(assetSearchValue, { wait: 500 })
  const [collectionSearchValue, setCollectionSearchValue] = useState('')
  const debounceCollectionSearchValue = useDebounce(collectionSearchValue, {
    wait: 500,
  })
  const [orderOption, setOrderOption] = useState(SORT_OPTIONS[0])

  const [poolsMap, setPoolsMap] = useState<Map<string, PoolsListItemType[]>>()

  const { loading: poolsLoading } = useRequest(() => apiGetPools({}), {
    onSuccess: (data) => {
      if (isEmpty(data)) {
        return
      }
      const newMap = new Map()
      data.forEach((item) => {
        const lowercaseAddress = item.collateral_contract.toLowerCase()
        const prev = newMap.get(lowercaseAddress)
        if (prev) {
          newMap.set(lowercaseAddress, [...prev, item])
        } else {
          newMap.set(lowercaseAddress, [item])
        }
      })

      setPoolsMap(newMap)
    },
    debounceWait: 100,
  })

  const collectionWithPoolsIds = useMemo(
    () => (poolsMap ? [...poolsMap.keys()] : []),
    [poolsMap],
  )

  const collectionData = useMemo(() => {
    if (!collectionList) return
    if (isEmpty(collectionList)) return []
    return collectionList
      .filter(
        (i) =>
          collectionWithPoolsIds.includes(i.contractAddress) &&
          i.release_status === COLLECTION_STATUS_ENUM.RELEASED,
      )
      .sort((a, b) => a.priority - b.priority)
  }, [collectionList, collectionWithPoolsIds])

  const initialCollection = useMemo(() => {
    if (!collectionData || isEmpty(collectionData)) {
      return
    }

    const prevCollectionId = pathData?.collectionId
    const prevItem = collectionData.find(
      (i) => i.nftCollection.id === prevCollectionId,
    )

    const currentItem = prevItem || collectionData[0]
    return currentItem
  }, [collectionData, pathData])

  useEffect(() => {
    if (!initialCollection) return
    setSelectCollection(initialCollection)
    navigate(`/market/${initialCollection.nftCollection.id}${search || ''}`)
  }, [initialCollection, navigate, search])

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
    },
  )
  // todo: 查询 top bid、Owners(Unique Owners)、7D Change、7D Volume、Listed/Supply

  const currentCollectionPools = useMemo(() => {
    if (!selectCollection || !poolsMap) return []
    return poolsMap.get(selectCollection.contractAddress)
  }, [poolsMap, selectCollection])

  const bestPoolAmount: number | undefined = useMemo(() => {
    if (!selectCollection) return
    if (!currentCollectionPools) return
    if (floorPrice === undefined) return
    // 取当前 collection 的所有 pool，算出每个 pool 的实际可借出金额
    const prevArr = currentCollectionPools.map((i) => {
      // 该 pool 剩余可借 amount
      const availablePoolSize = wei2Eth(
        bigNumber(i.supply_cap).minus(i.supply_used || 0),
      )
      // 地板价 * 该 pool 最大贷款比例
      const floorPriceMultiPercentage = bigNumber(floorPrice)
        .multipliedBy(i.max_collateral_factor)
        .dividedBy(10000)
        .toNumber()
      // 单笔最大贷款金额
      const maxLoanAmountEth = wei2Eth(i.single_cap)
      // 五者取最小，极为该 pool 的实际可借出金额
      return min([
        availablePoolSize,
        floorPriceMultiPercentage,
        maxLoanAmountEth,
        wei2Eth(i.owner_weth_allowance),
        wei2Eth(i.owner_weth_balance),
      ])
    })
    // 取所有 pool 的最大的 实际可借出金额
    const prevMax = max(prevArr)
    // 实际可借出金额 与 地板价 二者取其小
    return min([prevMax, floorPrice])
  }, [selectCollection, floorPrice, currentCollectionPools])

  // useEffect(() => {
  //   if (!selectCollection) return
  //   const {
  //     nftCollection: { id },
  //   } = selectCollection
  //   navigate(`/market/${id}${search}`)
  // }, [selectCollection, navigate, search])

  // 根据 collectionId 搜索 assets
  const [fetchAssetByCollectionId] = useNftCollectionAssetsLazyQuery({
    fetchPolicy: 'network-only',
  })

  const getLoadMoreList = useCallback(
    async (after: string | null, first: number) => {
      if (!selectCollection?.nftCollection?.id || !fetchAssetByCollectionId)
        return {
          list: [],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
        }
      const { data } = await fetchAssetByCollectionId({
        variables: {
          collectionId: `${selectCollection?.nftCollection?.id}`,
          orderBy: orderOption.value,
          where: {
            status: [NftAssetStatus.BuyNow],
          },
          first,
          after,
        },
      })

      return {
        list: data?.nftCollectionAssets.edges || [],
        pageInfo: data?.nftCollectionAssets.pageInfo,
      }
    },
    [fetchAssetByCollectionId, selectCollection, orderOption],
  )

  const {
    data: assetsData,
    loading: assetLoading,
    // loadMore,
    loadingMore: assetLoadingMore,
    noMore,
    loadMore,
  } = useInfiniteScroll(
    (item) =>
      getLoadMoreList(item?.pageInfo?.endCursor, item?.list.length || 24),
    {
      // target: ref,
      isNoMore: (item) => !item?.pageInfo?.hasNextPage,
      reloadDeps: [selectCollection?.nftCollection?.id, orderOption],
      // threshold: 10,
      manual: true,
    },
  )

  const filteredCollectionList = useMemo(() => {
    if (!collectionData) return
    if (!debounceCollectionSearchValue) return collectionData || []
    return collectionData.filter((item) =>
      item.nftCollection.name
        .toLocaleLowerCase()
        .includes(debounceCollectionSearchValue.toLocaleLowerCase()),
    )
  }, [collectionData, debounceCollectionSearchValue])

  const [fetchAssetBySearch, { loading: fetchAssetBySearchLoading }] =
    useNftCollectionSearchAssetLazyQuery()
  const [searchedAsset, setSearchedAsset] =
    useState<NftCollectionSearchAssetQuery['nftCollectionSearchAsset']>()

  useEffect(() => {
    if (!debounceSearchValue || !fetchAssetBySearch || !selectCollection) {
      return setSearchedAsset(undefined)
    }
    fetchAssetBySearch({
      variables: {
        collectionId: selectCollection?.nftCollection?.id,
        search: debounceSearchValue,
      },
    })
      .then(({ data }) => {
        setSearchedAsset(data?.nftCollectionSearchAsset)
      })
      .catch(() => {
        setSearchedAsset(undefined)
      })
  }, [debounceSearchValue, fetchAssetBySearch, selectCollection])

  // grid
  const [grid, setGrid] = useState(3)

  const responsiveSpan = useMemo(
    () => ({
      xl: grid,
      lg: grid,
      md: 2,
      sm: 2,
      xs: 2,
    }),
    [grid],
  )

  const { isOpen: guideVisible, onClose: closeGuide } = useGuide({
    key: 'has-read-buyer-guide',
  })

  // boxdrop
  const {
    isOpen: collectionDialogVisible,
    onOpen: openCollectionDialog,
    onClose: closeCollectionDialog,
  } = useDisclosure()

  const [collectionDialogState, setCollectionDialogState] = useSetState({
    url: '',
    desc: '',
    btnGiftVisible: false,
  })
  useEffect(() => {
    if (!selectCollection) return
    const targetDialog = COLLECTIONS_WITH_BOXDROP_CONFIG.filter((x) => {
      return x.address == selectCollection?.contractAddress
    })
    if (targetDialog.length === 1) {
      setCollectionDialogState({
        url: targetDialog[0].url,
        desc: targetDialog[0].desc,
        btnGiftVisible: true,
      })
      openCollectionDialog()
    } else {
      setCollectionDialogState({
        url: '',
        desc: '',
        btnGiftVisible: false,
      })
      closeCollectionDialog()
    }
  }, [
    selectCollection,
    closeCollectionDialog,
    openCollectionDialog,
    setCollectionDialogState,
  ])

  const [giftBtnPosition, setGiftBtnPosition] = useSetState({
    top: 0,
    right: 0,
  })
  const resetGiftBtnPos = useCallback(() => {
    const top = window.innerHeight * 0.9
    const right = window.innerWidth * 0.1
    setGiftBtnPosition({
      top,
      right,
    })
  }, [setGiftBtnPosition])
  useEffect(() => {
    if (!resetGiftBtnPos) return
    resetGiftBtnPos()
    window.addEventListener('resize', resetGiftBtnPos)
    return () => {
      window.removeEventListener('resize', resetGiftBtnPos)
    }
  }, [resetGiftBtnPos])
  return (
    <RootLayout>
      <BuyerGuideModal
        isOpen={guideVisible}
        onClose={closeGuide}
      />
      <Box
        mb={{ md: '40px', sm: '20px', xs: '20px' }}
        mt={{
          md: '30px',
          sm: '16px',
          xs: '16px',
        }}>
        <Heading fontSize={{ md: '48px', sm: '24px', xs: '24px' }}>
          Buy NFTs
        </Heading>
      </Box>
      <NoticeSlider data={noticeData} />
      <Flex
        mt={'20px'}
        mb='100px'
        gap={'36px'}
        flexWrap={{ lg: 'nowrap', md: 'wrap', sm: 'wrap', xs: 'wrap' }}>
        <Box
          w={{
            xl: '360px',
            lg: '320px',
            md: '280px',
            sm: '100%',
            xs: '100%',
          }}
          position={{
            md: 'sticky',
            sm: 'static',
            xs: 'static',
          }}
          h={{
            md: noticeData?.length
              ? 'calc(100vh - 340px)'
              : 'calc(100vh - 270px)',
            sm: 'auto',
            xs: 'auto',
          }}
          top='151px'
          bg='white'
          zIndex={2}
          borderColor='gray.2'
          borderWidth={{ md: 1, sm: 0, xs: 0 }}
          borderRadius={{ md: '12px', sm: 0, xs: 0 }}>
          <Box px={{ md: '24px', sm: 0, xs: 0 }}>
            {/* Propose Listing */}
            <Box
              pos={'absolute'}
              bottom={0}
              pb='24px'
              bg='white'
              left={'0'}
              right={'0'}
              display={{
                md: 'block',
                sm: 'none',
                xs: 'none',
              }}
              zIndex={10}
              borderBottomRadius={'30px'}>
              <TooltipComponent
                label='Would Love to Support Your NFTs?'
                placement='top'
                borderRadius={16}
                bg={'blue.2'}
                color={'blue.1'}
                px='14px'
                py='4px'
                shadow={'none'}
                hasArrow>
                <Box px='24px'>
                  <Button
                    w='100%'
                    variant={'outline'}
                    onClick={() => {
                      window.open(process.env.REACT_APP_COLLECTION_NOTION_LINK)
                    }}>
                    Propose Listing
                  </Button>
                </Box>
              </TooltipComponent>
            </Box>
            <Heading
              fontSize={'16px'}
              mb='16px'
              textAlign={'center'}
              mt='24px'
              display={{
                md: 'block',
                sm: 'none',
                xs: 'none',
              }}>
              Top Collections
            </Heading>
            {/* pc collection list */}
            <Box
              display={{
                md: 'block',
                sm: 'none',
                xs: 'none',
              }}
              pb='40px'>
              <Box
                hidden={
                  !collectionSearchValue && !filteredCollectionList?.length
                }>
                <SearchInput
                  placeholder='Search...'
                  isDisabled={collectionLoading || poolsLoading}
                  value={collectionSearchValue}
                  onChange={(e) => {
                    setCollectionSearchValue(e.target.value)
                  }}
                />
              </Box>

              {/* pc 端 */}
              <List
                spacing='16px'
                mt='16px'
                position='relative'
                display={{
                  md: 'block',
                  sm: 'none',
                  xs: 'none',
                }}
                h={{
                  md: noticeData?.length
                    ? 'calc(100vh - 540px)'
                    : 'calc(100vh - 470px)',
                  sm: 'auto',
                  xs: 'auto',
                }}
                overflowY={{
                  md: 'auto',
                  sm: 'visible',
                  xs: 'visible',
                }}
                className='scroll-hover-show'>
                <LoadingComponent
                  loading={collectionLoading || poolsLoading}
                  top={0}
                  minH={'180px'}
                />
                {isEmpty(filteredCollectionList) &&
                  !collectionLoading &&
                  !poolsLoading && <EmptyComponent />}

                {filteredCollectionList?.map((item) => (
                  <CollectionListItem
                    data={item}
                    key={`${item?.nftCollection?.id}${item?.contractAddress}`}
                    onClick={() => {
                      setSelectCollection(item)
                      setOrderOption(SORT_OPTIONS[0])
                      setAssetSearchValue('')
                      setCollectionSearchValue('')
                      navigate(`/market/${item.nftCollection.id}${search}`)
                    }}
                    count={item.nftCollection.assetsCount}
                    isActive={
                      selectCollection?.nftCollection?.id ===
                      item?.nftCollection?.id
                    }
                  />
                ))}
                {moreCollectionList.map((x) => {
                  return (
                    <ComingSoonCollectionItem
                      key={x.id}
                      name={x.name}
                      src={x.image_url}
                      status={x.release_status}
                      day={x.released_time}
                    />
                  )
                })}
              </List>
            </Box>
            {/* 移动端  collection list*/}
            <Box
              display={{
                md: 'none',
                sm: 'block',
                xs: 'block',
              }}
              mt={'16px'}
              position='relative'>
              <CollectionListItem
                isActive
                data={selectCollection}
                onClick={openDraw}
              />
              <Divider mt='16px' />
              <Drawer
                placement={'bottom'}
                onClose={closeDraw}
                isOpen={drawVisible}>
                <DrawerOverlay />
                <DrawerContent
                  borderTopRadius={16}
                  pb='40px'>
                  <DrawerBody overflow={'initial'}>
                    <Heading
                      fontSize={'16px'}
                      pt='20px'
                      pb='16px'>
                      Top Collections
                    </Heading>
                    <Box
                      hidden={
                        !collectionSearchValue &&
                        !filteredCollectionList?.length
                      }>
                      <SearchInput
                        placeholder='Collections...'
                        value={collectionSearchValue}
                        onChange={(e) => {
                          setCollectionSearchValue(e.target.value)
                        }}
                      />
                    </Box>

                    <List
                      spacing='16px'
                      mt='16px'
                      position='relative'
                      overflowY={'auto'}
                      h='300px'>
                      <LoadingComponent
                        loading={collectionLoading || poolsLoading}
                        top={0}
                      />
                      {!filteredCollectionList?.length &&
                        !collectionLoading && <EmptyComponent />}
                      {filteredCollectionList?.map((item) => (
                        <CollectionListItem
                          data={item}
                          key={`${item?.nftCollection?.id}${item?.contractAddress}`}
                          onClick={() => {
                            setSelectCollection(item)
                            setOrderOption(SORT_OPTIONS[0])
                            setAssetSearchValue('')
                            setCollectionSearchValue('')
                            closeDraw()
                            navigate(
                              `/market/${item.nftCollection.id}${search}`,
                            )
                          }}
                          count={item.nftCollection.assetsCount}
                          isActive={
                            selectCollection?.nftCollection?.id ===
                            item?.nftCollection?.id
                          }
                          iconSize='26px'
                        />
                      ))}
                    </List>
                    <Box
                      w={'100%'}
                      mt='20px'
                      position={'relative'}>
                      <Box
                        borderRadius={16}
                        bg={'blue.2'}
                        color={'blue.1'}
                        px='14px'
                        py='4px'
                        textAlign={'center'}
                        w={'fit-content'}
                        margin={'0 auto'}
                        mb='4px'
                        fontWeight={'500'}
                        fontSize={'12px'}>
                        Would Love to Support Your NFTs?
                      </Box>

                      <Button
                        w='100%'
                        variant={'outline'}
                        onClick={() => {
                          window.open(
                            process.env.REACT_APP_COLLECTION_NOTION_LINK,
                          )
                        }}>
                        Propose Listing
                      </Button>
                    </Box>
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            </Box>
          </Box>
        </Box>

        <Box flex={1}>
          <CollectionDescription
            loading={collectionLoading || poolsLoading || floorPriceLoading}
            data={selectCollection?.nftCollection}
            contractAddress={selectCollection?.contractAddress}
            floorPrice={floorPrice}
            bestPoolAmount={bestPoolAmount}
            tags={selectCollection?.tags}
          />
          <Toolbar
            loading={collectionLoading || poolsLoading || floorPriceLoading}
            searchConfig={{
              searchValue: assetSearchValue,
              setSearchValue: (t) => setAssetSearchValue(t),
            }}
            sortConfig={{
              sortOptions: SORT_OPTIONS,
              sortValue: orderOption,
              setSortValue: (t) => setOrderOption(t),
            }}
            gridConfig={{
              gridValue: grid,
              setGridValue: (t) => setGrid(t),
              props: {
                display: {
                  lg: 'flex',
                  md: 'none',
                },
              },
            }}
          />

          {!debounceSearchValue && (
            <SimpleGrid
              spacingX={{
                xl: '16px',
                lg: '8px',
                md: '8px',
                sm: '10px',
                xs: '10px',
              }}
              spacingY={'20px'}
              columns={responsiveSpan}
              position={'relative'}>
              <LoadingComponent
                loading={
                  assetLoading ||
                  poolsLoading ||
                  collectionLoading ||
                  floorPriceLoading
                }
                top={0}
              />
              {isEmpty(assetsData?.list) ? (
                <GridItem colSpan={responsiveSpan}>
                  <EmptyComponent />
                </GridItem>
              ) : (
                assetsData?.list?.map((item) => {
                  if (!item) return null
                  const { node } = item
                  const {
                    tokenID,
                    nftAssetContract: { address },
                    name,
                  } = node || {}
                  return (
                    <MarketNftListCard
                      data={{ ...item, bestPoolAmount }}
                      imageSize={{
                        xl: grid === 4 ? '231px' : '314px',
                        lg: grid === 4 ? '208px' : '280px',
                        md: '220px',
                        sm: '174px',
                        xs: '174px',
                      }}
                      isDisabled={
                        (bestPoolAmount === undefined ||
                          bestPoolAmount / item.node.orderPrice < 0.1) &&
                        floorPrice !== undefined
                      }
                      key={`${tokenID}${address}${name}`}
                      onClick={() => {
                        if (!selectCollection) return
                        // floorPrice === 0 disabled
                        // floorPrice === undefined enable
                        if (
                          (bestPoolAmount === undefined ||
                            bestPoolAmount / item.node.orderPrice < 0.1) &&
                          floorPrice !== undefined
                        ) {
                          return
                        }
                        interceptFn(() => {
                          navigate(`/asset/${address}/${tokenID}`)
                        })
                      }}
                    />
                  )
                })
              )}
              <GridItem colSpan={responsiveSpan}>
                <Flex
                  justifyContent='center'
                  mb={'40px'}
                  p='20px'
                  h='35px'>
                  {!noMore &&
                    (assetLoadingMore ? (
                      <Text>Loading more...</Text>
                    ) : (
                      <Button
                        onClick={loadMore}
                        variant='secondary'>
                        Click to load more
                      </Button>
                    ))}
                  {noMore && !isEmpty(assetsData?.list) && (
                    <Text>No more data</Text>
                  )}
                </Flex>
              </GridItem>
            </SimpleGrid>
          )}
          {!!debounceSearchValue && (
            <SimpleGrid
              spacingX={'16px'}
              spacingY={'20px'}
              columns={responsiveSpan}
              // overflowY='auto'
              position={'relative'}
              // overflowX='hidden'
            >
              {fetchAssetBySearchLoading || poolsLoading ? (
                <LoadingComponent
                  loading
                  top={0}
                />
              ) : !searchedAsset ? (
                <GridItem colSpan={responsiveSpan}>
                  <EmptyComponent />
                </GridItem>
              ) : (
                <MarketNftListCard
                  data={{
                    node: searchedAsset,
                    bestPoolAmount,
                  }}
                  isDisabled={
                    (bestPoolAmount === undefined ||
                      bestPoolAmount / searchedAsset.orderPrice < 0.1) &&
                    floorPrice !== undefined
                  }
                  key={`${searchedAsset.tokenID}${searchedAsset.assetContractAddress}${searchedAsset.name}`}
                  onClick={() => {
                    interceptFn(() => {
                      if (!selectCollection) return
                      if (
                        (bestPoolAmount === undefined ||
                          bestPoolAmount / searchedAsset.orderPrice < 0.1) &&
                        floorPrice !== undefined
                      ) {
                        return
                      }
                      navigate(
                        `/asset/${searchedAsset?.assetContractAddress}/${searchedAsset?.tokenID}`,
                      )
                    })
                  }}
                />
              )}
              <GridItem
                colSpan={responsiveSpan}
                hidden={!!debounceSearchValue}>
                <Flex
                  justifyContent='center'
                  mb={'40px'}
                  p='20px'
                  h='35px'>
                  {!noMore &&
                    (assetLoadingMore ? (
                      <Text>Loading more...</Text>
                    ) : (
                      <Button
                        onClick={loadMore}
                        variant='secondary'>
                        Click to load more
                      </Button>
                    ))}
                  {noMore && !isEmpty(assetsData?.list) && (
                    <Text>No more data</Text>
                  )}
                </Flex>
              </GridItem>
            </SimpleGrid>
          )}
        </Box>
      </Flex>
      <ConnectWalletModal
        visible={isOpen}
        handleClose={onClose}
      />
      <AlertDialog
        motionPreset='slideInBottom'
        leastDestructiveRef={cancelRef}
        onClose={closeCollectionDialog}
        isOpen={collectionDialogVisible}
        isCentered>
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Discard Changes?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            <Image src={collectionDialogState.url} />
            <div>{collectionDialogState.desc}</div>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={closeCollectionDialog}>
              No
            </Button>
            <Button
              colorScheme='red'
              ml={3}>
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {!collectionDialogVisible && collectionDialogState.btnGiftVisible && (
        <Image
          src='/gift.gif'
          style={{
            position: 'fixed',
            right: `${giftBtnPosition.right}px`,
            top: `${giftBtnPosition.top}px`,
            width: '84px',
            height: '84px',
            marginTop: '-36px',
            marginRight: '-14px',
          }}
          onClick={openCollectionDialog}
        />
      )}
    </RootLayout>
  )
}

export default Market

function ComingSoonCollectionItem(props: {
  day?: string
  src?: string
  name?: string
  status?: COLLECTION_STATUS_ENUM
}) {
  const [counter, setCounter] = useState('')
  useInterval(
    () => {
      if (props.day) {
        const _day = moment(props.day)
        const ms = _day.diff(Date.now())
        const days = Math.floor(ms / 1000 / 60 / 60 / 24)
        const hours = Math.floor(ms / 1000 / 60 / 60) - days * 24
        const minutes = Math.floor(ms / 1000 / 60) - hours * 60 - days * 24 * 60
        const seconds =
          Math.floor(ms / 1000) -
          minutes * 60 -
          hours * 60 * 60 -
          days * 24 * 60 * 60
        if (_day.isValid()) {
          setCounter(
            `${padStart(`${days}`, 2, '0')}D ${padStart(
              `${hours}`,
              2,
              '0',
            )}H ${padStart(`${minutes}`, 2, '0')}M ${padStart(
              `${seconds}`,
              2,
              '0',
            )}S`,
          )
        }
      }
    },
    1000,
    {
      immediate: true,
    },
  )
  return (
    <Tooltip
      hasArrow
      label='CommingSoon'
      placement='right'>
      <Box
        cursor={'default'}
        opacity={0.6}
        _hover={{
          opacity: 0.8,
        }}
        transition={'opacity .2s'}
        display={'flex'}
        padding={'8px 16px'}
        border={'1px solid rgb(233, 237, 243)'}
        borderRadius={'10px'}
        mb={'10px'}
        justifyContent={'space-between'}
        alignItems={'center'}>
        <Box display={'flex'}>
          <Img
            w='42px'
            marginRight={'10px'}
            borderRadius={'10px'}
            src={props.src}
          />
          <Box
            display={'flex'}
            flexDir={'column'}>
            <Text
              fontSize='14px'
              noOfLines={1}
              fontFamily={'HarmonyOS Sans Sc Bold'}>
              {props.name}
            </Text>
            <Text
              fontSize='12px'
              fontFamily={'HarmonyOS Sans Sc'}>
              Coming soon
            </Text>
          </Box>
        </Box>
        {props.day && props.status === COLLECTION_STATUS_ENUM.COUNTDOWN && (
          <Box
            display={'flex'}
            alignItems={'center'}>
            <Text fontSize={'10px'}>{counter}</Text>
          </Box>
        )}
      </Box>
    </Tooltip>
  )
}
