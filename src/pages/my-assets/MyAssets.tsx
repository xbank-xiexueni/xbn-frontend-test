import {
  Heading,
  Tabs,
  TabPanel,
  TabList,
  Tab,
  TabPanels,
  Tag,
  SimpleGrid,
  GridItem,
  Flex,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import isEmpty from 'lodash-es/isEmpty'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { apiGetMyAssets } from '@/api'
import {
  ConnectWalletModal,
  EmptyComponent,
  LoadingComponent,
  NftInfoComponent,
  SvgComponent,
} from '@/components'
import { useSign, useWallet } from '@/hooks'
import RootLayout from '@/layouts/RootLayout'

import MyAssetNftListCard from './components/MyAssetNftListCard'

// const SORT_OPTIONS = [
//   {
//     label: 'Price: low to high',
//     value: {
//       direction: OrderDirection.Asc,
//       field: NftAssetOrderByField.Price,
//     },
//   },
//   {
//     label: 'Price: high to low',
//     value: {
//       direction: OrderDirection.Desc,
//       field: NftAssetOrderByField.Price,
//     },
//   },
//   {
//     label: 'Recent Created',
//     value: {
//       direction: OrderDirection.Desc,
//       field: NftAssetOrderByField.CreatedAt,
//     },
//   },
// ]

const MyAssets = () => {
  const navigate = useNavigate()
  const {
    interceptFn,
    currentAccount,
    isOpen,
    onClose,
    isConnected,
    handleDisconnect,
  } = useWallet()
  const { debounceRunAsync: handleSignDebounce, loading: signLoading } =
    useSign()

  const {
    data,
    loading,
    runAsync: fetchMyAsset,
  } = useRequest(
    () => apiGetMyAssets({ wallet_address: currentAccount?.address || '' }),
    {
      ready: !!isConnected,
      debounceWait: 100,
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

  useEffect(() => {
    interceptFn()
  }, [interceptFn])

  // const [
  //   grid,
  //   // setGrid
  // ] = useState(5)

  const responsiveSpan = useMemo(
    () => ({
      xl: 5,
      lg: 5,
      md: 3,
      sm: 2,
      xs: 2,
    }),
    [],
  )

  const [page, setPage] = useState(1)
  const currentData = useMemo(() => {
    return data?.slice(0, page * 10)
  }, [data, page])
  const hasMore = useMemo(() => {
    if (!currentData || !data) return false
    return currentData?.length < data?.length
  }, [data, currentData])

  return (
    <RootLayout mb='100px'>
      <Flex
        py='20px'
        onClick={() => navigate(-1)}
        display={{
          md: 'none',
          sm: 'flex',
          xs: 'flex',
        }}
      >
        <SvgComponent svgId='icon-arrow-down' transform={'rotate(90deg)'} />
      </Flex>
      <Heading
        mt={{
          md: '60px',
          sm: '10px',
          xs: '10px',
        }}
        mb={{
          md: '56px',
          sm: '32px',
          xs: '32px',
        }}
        fontSize={{
          md: '48px',
          sm: '24px',
          xs: '24px',
        }}
      >
        My Assets
      </Heading>
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
                if (!currentAccount?.address) return
                handleSignDebounce(currentAccount.address)
              }}
              variant={'outline'}
              isDisabled={signLoading}
              isLoading={signLoading}
            >
              Click to Sign
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs position='relative'>
          <TabList
            _active={{
              color: 'blue.1',
              fontWeight: 'bold',
            }}
          >
            <Tab
              pt='16px'
              px={'4px'}
              pb={'20px'}
              _selected={{
                color: 'blue.1',
                borderBottomWidth: 2,
                borderColor: 'blue.1',
              }}
              fontWeight='bold'
            >
              Collected &nbsp;
              {!isEmpty(data) && (
                <Tag
                  bg='blue.1'
                  color='white'
                  borderRadius={15}
                  fontSize={'12px'}
                  lineHeight={'20px'}
                >
                  {data?.length}
                </Tag>
              )}
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0} pb='40px'>
              {/* <Toolbar
              loading={loading}
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
              }}
              loadingProps={{
                mt: '25px',
              }}
            /> */}

              <SimpleGrid
                spacingX={'16px'}
                spacingY={'20px'}
                columns={responsiveSpan}
                position={'relative'}
                mt='20px'
              >
                <LoadingComponent loading={loading} top={0} />
                {(!data || isEmpty(data)) && (
                  <GridItem colSpan={responsiveSpan}>
                    <EmptyComponent />
                  </GridItem>
                )}

                {currentData &&
                  currentData?.map((item) => {
                    return (
                      <NftInfoComponent
                        tokenId={item.token_id}
                        contractAddress={item.asset_contract_address}
                        key={`${item?.asset_contract_address}-${item?.token_id}`}
                      >
                        {({ img, name }) => (
                          <MyAssetNftListCard
                            imageSize={{
                              '2xl': '260px',
                              xl: '260px',
                              lg: '225px',
                              md: '243px',
                              sm: '174px',
                              xs: '160px',
                            }}
                            data={{
                              assetData: {
                                img,
                                name:
                                  !name || name === '--'
                                    ? `#${item.token_id}`
                                    : name,
                              },
                              contractData: { ...item },
                            }}
                            onRefreshList={fetchMyAsset}
                          />
                        )}
                      </NftInfoComponent>
                    )
                  })}
              </SimpleGrid>

              <Flex justifyContent='center' p='20px' h='35px' hidden={loading}>
                {hasMore ? (
                  <Button
                    onClick={() => setPage((prev) => prev + 1)}
                    variant='secondary'
                  >
                    Load More
                  </Button>
                ) : (
                  '-- end --'
                )}
              </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}

      <ConnectWalletModal visible={isOpen} handleClose={onClose} />
    </RootLayout>
  )
}

export default MyAssets
