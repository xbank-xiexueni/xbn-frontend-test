import {
  Flex,
  Box,
  Text,
  Heading,
  Skeleton,
  Tooltip,
  chakra,
  type FlexProps,
} from '@chakra-ui/react'
import useSetState from 'ahooks/lib/useSetState'
import BigNumber from 'bignumber.js'
import get from 'lodash-es/get'
import isEmpty from 'lodash-es/isEmpty'
import isNil from 'lodash-es/isNil'
import range from 'lodash-es/range'
import React, {
  useRef,
  useState,
  type FunctionComponent,
  useEffect,
} from 'react'
import ReactMarkdown from 'react-markdown'

import {
  CollectionTag,
  EmptyComponent,
  ImageWithFallback,
  SvgComponent,
} from '@/components'
import { useBestCollectionBidLazyQuery, type NftCollection } from '@/hooks'
import { formatFloat } from '@/utils/format'
// mock field 数据
// const mockData = {
//   nftCollectionStat: {
//     averagePrice: 0.9204161434175563,
//     count: 2061,
//     createdAt: '2023-06-26T03:18:58Z',
//     floorPrice: 1.285,
//     floorPriceRate: 0,
//     id: '48721743413510146',
//     oneDayAveragePrice: 1.187475,
//     oneDayChange: -0.36752331256866455,
//     totalSales: 5794,
//     totalSupply: 2061,
//     totalVolume: 5332.891134961321,
//     // 以下为新增字段
//     bestCollectionBidAmount: 27.4,
//     bestCollectionBidUnit: 'ETH',
//     floorPriceOneWeekAmount: 23.78,
//     floorPriceOneWeekUnit: 'ETH',
//     volumeOneWeekAmount: 6971.907728643217180403,
//     volumeOneWeekUnit: 'ETH',
//     numberOwners: 5633,
//     totalListed: 666,
//     // 以上为新增字段
//     __typename: 'NFTCollectionStat',
//   },
// }
// const mockData = {
//   data: {
//     nftCollectionsByContractAddresses: [
//       {
//         contractAddress: '0x09e8617f391c54530cc2d3762ceb1da9f840c5a3',
//         nftCollection: {
//           assetsCount: 9973,
//           description:
//             'Free mint : https://mutant-nft.vercel.app/\n\nThe MUTANT APE YACHT CLUB is a collection of up to 10,000 Mutant Apes that can only be minted for FUN.',
//           featuredImageUrl:
//             'https://i.seadn.io/gcs/files/ab99486a3ad8c5798ab632d3c1022a29.png?w=500&auto=format',
//           fees: [
//             {
//               address: '0x0000a26b00c1f0df003000390027140000faa719',
//               name: 'opensea_fees',
//               value: 250,
//               __typename: 'NFTCollectionFee',
//             },
//           ],
//           id: '30924154232425195',
//           imagePreviewUrl:
//             'https://i.seadn.io/gcs/files/ab99486a3ad8c5798ab632d3c1022a29.png?w=500&auto=format=s250',
//           imageThumbnailUrl:
//             'https://i.seadn.io/gcs/files/ab99486a3ad8c5798ab632d3c1022a29.png?w=500&auto=format=s128',
//           imageUrl:
//             'https://i.seadn.io/gcs/files/ab99486a3ad8c5798ab632d3c1022a29.png?w=500&auto=format',
//           instagramUsername: '',
//           largeImageUrl:
//             'https://i.seadn.io/gcs/files/ab99486a3ad8c5798ab632d3c1022a29.png?w=500&auto=format',
//           name: 'MutantApeYachtClub - GOERLI',
//           nftCollectionStat: {
//             averagePrice: 2.4852886720663223,
//             count: 9973,
//             createdAt: '2023-02-23T08:35:49Z',
//             floorPrice: 3,
//             floorPriceRate: 0,
//             id: '30924154601523947',
//             oneDayAveragePrice: 0,
//             oneDayChange: 0,
//             totalSales: 3136,
//             totalSupply: 9973,
//             totalVolume: 7793.8652755999865,
//             bestCollectionBidAmount: '0.123',
//             bestCollectionBidUnit: 'ETH',
//             floorPriceOneWeekAmount: '0.321',
//             floorPriceOneWeekUnit: 'ETH',
//             volumeOneWeekAmount: '99.98',
//             volumeOneWeekUnit: 'ETH',
//             numberOwners: 999,
//             __typename: 'NFTCollectionStat',
//           },
//           safelistRequestStatus: 'not_requested',
//           shortDescription: '',
//           slug: 'mutantapeyachtclub-goerli',
//           isCreatorFeesEnforced: false,
//           totalListed: 123,
//           __typename: 'NFTCollection',
//         },
//         __typename: 'NFTCollectionByContractAddress',
//       },
//     ],
//   },
// }
// const mockApi = async () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(mockData)
//     }, 2000)
//   })
// }
const MediaWrapper: FunctionComponent<
  FlexProps & {
    data?: string
    svgId: string
    svgSize?: string
  }
> = ({ data, svgId, svgSize = '20px', ...rest }) => {
  if (!data) return null
  return (
    <Flex
      borderWidth={1}
      borderRadius={'8px'}
      borderColor={'gray.5'}
      boxSize={'36px'}
      justify={'center'}
      alignItems={'center'}
      {...rest}>
      <chakra.a
        href={data}
        color={'black.1'}
        target='_blank'>
        <SvgComponent
          svgId={svgId}
          svgSize={svgSize}
        />
      </chakra.a>
    </Flex>
  )
}

const CollectionDescription: FunctionComponent<{
  data?: NftCollection
  loading?: boolean
  bestPoolAmount?: number
  floorPrice?: number
  tags?: string[]
  contractAddress?: string
}> = ({ data, contractAddress, loading, bestPoolAmount, floorPrice, tags }) => {
  const [queryBestBid, { loading: isLoading }] = useBestCollectionBidLazyQuery()
  // const [queryNftCollections] = useNftCollectionsByContractAddressesLazyQuery()
  // useEffect(() => {
  //   queryNftCollections({
  //     variables: {
  //       assetContractAddresses: [data?.totalListed]
  //     },
  //   })
  // })

  const [show, setShow] = useState(false)
  const ref = useRef<HTMLParagraphElement>(null)
  const offsetHeight = ref.current?.offsetHeight
  // const { runAsync } = useRequest(mockApi)
  const [fields, setFields] = useSetState({
    topBid: '',
    weekChange: '',
    weekChangeTrendType: '',
    weekVolumn: '',
    listedAndSupply: '',
    floorPriceOneWeekAmount: '',
    numberOwners: 0,
    uniqueOwners: 0,
  })
  useEffect(() => {
    if (data?.slug) {
      queryBestBid({
        variables: {
          slug: data?.slug,
        },
      })
        .then((resp) => {
          console.log('slug', data?.slug)
          if (!resp.data) {
            setFields({
              topBid: '-',
            })
          } else {
            const topBid = `${resp.data?.nftCollectionMetadata.bestCollectionBid.amount}`
            setFields({
              topBid,
            })
          }
        })
        .catch(() => {
          setFields({
            topBid: '-',
          })
        })
    }

    const floorPriceOneWeekAmount = get(
      data,
      'nftCollectionStat.floorPriceOneWeekAmount',
      '',
    )
    setFields({
      floorPriceOneWeekAmount,
    })
    const weekVolumn =
      BigNumber(get(data, 'nftCollectionStat.volumeOneWeekAmount', '-'))
        .decimalPlaces(2)
        .toFormat() + get(data, 'nftCollectionStat.volumeOneWeekUnit')
    const numberOwners = get(data, 'nftCollectionStat.numberOwners', 0)
    const totalSupply = data?.nftCollectionStat.totalSupply || 0
    const _uniqueOwners = BigNumber(numberOwners)
      .dividedBy(totalSupply)
      .multipliedBy(100)
    const uniqueOwners = _uniqueOwners.isNaN()
      ? 0
      : _uniqueOwners.decimalPlaces(2).toNumber()
    setFields({
      uniqueOwners,
      numberOwners,
    })
    const totalListed = get(data, 'totalListed')
    const listedAndSupply = `${totalListed}/${totalSupply}`
    setFields({
      weekVolumn,
      listedAndSupply,
    })
  }, [data, queryBestBid, setFields])
  useEffect(() => {
    console.log(
      'fields.floorPriceOneWeekAmount',
      fields.floorPriceOneWeekAmount,
    )
    if (!isNil(floorPrice) && !isNaN(+fields.floorPriceOneWeekAmount)) {
      const weekChangeNum = BigNumber(
        (floorPrice - +fields.floorPriceOneWeekAmount) /
          +fields.floorPriceOneWeekAmount,
      )
      const weekChange =
        fields.floorPriceOneWeekAmount === '0'
          ? '-'
          : weekChangeNum.multipliedBy(100).decimalPlaces(2).toFormat() + '%'
      setFields({
        weekChange: `${weekChange || '-'}`,
        weekChangeTrendType:
          fields.floorPriceOneWeekAmount === '0'
            ? ''
            : weekChangeNum.gt(0)
            ? 'up'
            : weekChangeNum.lt(0)
            ? 'down'
            : '',
      })
    }
  }, [floorPrice, fields.floorPriceOneWeekAmount, setFields])
  if (loading || isLoading) {
    return (
      <Flex
        flexDirection={'column'}
        mb={'24px'}>
        <Flex
          mb={'40px'}
          gap={'24px'}>
          <Skeleton
            h='108px'
            w='108px'
            borderRadius={16}
            startColor='rgba(27, 34, 44, 0.1)'
            endColor='rgba(27, 34, 44, 0.2)'
          />
          <Skeleton
            h='108px'
            flex={1}
            startColor='rgba(27, 34, 44, 0.1)'
            endColor='rgba(27, 34, 44, 0.2)'
            borderRadius={16}
          />
        </Flex>

        <Flex
          rowGap={'16px'}
          wrap='wrap'
          justify={{
            md: 'flex-start',
            sm: 'space-between',
            xs: 'space-between',
          }}
          columnGap={{
            lg: '40px',
            md: '20px',
            sm: '10px',
            xs: '10px',
          }}>
          {[
            range(7).map((i) => (
              <Skeleton
                h='60px'
                key={i}
                w='80px'
                borderRadius={16}
                startColor='rgba(27, 34, 44, 0.1)'
                endColor='rgba(27, 34, 44, 0.2)'
              />
            )),
          ]}
        </Flex>
      </Flex>
    )
  }
  if (isEmpty(data)) {
    return <EmptyComponent />
  }
  const {
    name = '',
    description = '',
    imagePreviewUrl = '',
    safelistRequestStatus,
    externalUrl,
    discordUrl,
    mediumUsername,
    telegramUrl,
    twitterUsername,
  } = data

  const minDownPayment =
    floorPrice !== undefined && bestPoolAmount !== undefined
      ? formatFloat(
          BigNumber(floorPrice || 0)
            .minus(Number(bestPoolAmount))
            .toNumber(),
        )
      : '--'

  return (
    <Box
      mb={{
        md: '40px',
        sm: '20px',
        xs: '20px',
      }}>
      <Flex
        gap={'20px'}
        mb={'32px'}
        alignItems={!!description ? 'flex-start' : 'center'}>
        <ImageWithFallback
          src={imagePreviewUrl}
          borderRadius={{
            md: 16,
            sm: 8,
            xs: 8,
          }}
          fit='cover'
          bg='gray.100'
          boxSize={{
            md: '108px',
            sm: '48px',
            xs: '48px',
          }}
          borderWidth={2}
          borderColor={'gray.2'}
          borderStyle={'solid'}
        />
        <Box
          pos='relative'
          w='100%'>
          <Flex
            justify={'space-between'}
            alignItems={'center'}>
            <Flex
              alignItems={'center'}
              flexWrap={'wrap'}
              gap={'8px'}>
              <Heading fontSize={{ md: '32px', sm: '20px', xs: '20px' }}>
                {name}
              </Heading>
              {safelistRequestStatus === 'verified' && (
                <SvgComponent svgId='icon-verified-fill' />
              )}
              <Flex
                gap={'10px'}
                flexWrap={'wrap'}>
                {tags?.map((item) => (
                  <CollectionTag
                    key={item}
                    title={item}
                  />
                ))}
              </Flex>
            </Flex>

            <Flex gap={'12px'}>
              {/* contract */}
              <MediaWrapper
                data={`${process.env.REACT_APP_TARGET_CHAIN_BASE_URL}/address/${contractAddress}`}
                svgId={'icon-eth'}
              />
              {/* website */}
              <MediaWrapper
                data={externalUrl}
                svgId={'icon-website'}
                svgSize='24px'
              />
              {/* discord */}
              <MediaWrapper
                data={discordUrl}
                svgId={'icon-discord'}
              />
              {/* medium */}
              <MediaWrapper
                data={
                  mediumUsername
                    ? `https://medium.com/${mediumUsername}`
                    : undefined
                }
                svgId={'icon-medium'}
                svgSize='16px'
              />
              {/* telegram */}
              <MediaWrapper
                data={telegramUrl}
                svgId={'icon-telegram'}
                svgSize='20px'
              />
              {/* twitter */}
              <MediaWrapper
                data={
                  twitterUsername
                    ? `https://medium.com/${twitterUsername}`
                    : undefined
                }
                svgId={'icon-twitter'}
                svgSize='18px'
              />
            </Flex>
          </Flex>

          <Box
            color='gray.3'
            mt={'16px'}
            fontWeight='medium'
            noOfLines={!show ? 2 : undefined}
            lineHeight='20px'
            hidden={!description}
            overflow='hidden'
            textOverflow={'ellipsis'}
            display='-webkit-box'
            style={{
              WebkitBoxOrient: 'vertical',
              // WebkitLineClamp: 2,
            }}>
            <ReactMarkdown>{description}</ReactMarkdown>
          </Box>
          <Text
            color='transparent'
            mt={'8px'}
            fontWeight='medium'
            lineHeight='20px'
            ref={ref}
            position='absolute'
            left={0}
            right={0}
            top={'36px'}
            zIndex={-1}>
            {description}
          </Text>
          {!!offsetHeight && offsetHeight > 40 && (
            <Box
              as='a'
              color='blue.1'
              onClick={() => setShow((prev) => !prev)}
              cursor='pointer'
              fontWeight={700}
              borderRadius='99px'
              _hover={{
                bg: 'gray.5',
              }}
              px={'16px'}
              py={'4px'}
              ml={'-16px'}
              hidden={!description}>
              {show ? 'Less' : 'More'}
            </Box>
          )}
        </Box>
      </Flex>
      <Flex
        rowGap={'16px'}
        wrap='wrap'
        justify={{
          md: 'flex-start',
          sm: 'space-between',
          xs: 'space-between',
        }}
        columnGap={{
          xl: '40px',
          lg: '20px',
          md: '15px',
          sm: '10px',
          xs: '0px',
        }}>
        <Field
          // w='88px'
          iconVisible={true}
          label='Floor Price'
          value={formatFloat(floorPrice)}
        />
        {/* min dp */}
        <Field
          iconVisible={true}
          value={minDownPayment}
          label='Min Down Payment'
        />
        {/* TODO: top bid */}
        <Field
          iconVisible={true}
          value={fields.topBid}
          label='Top Bid'
        />
        {/* TODO: Owners(Unique Owners) */}
        <Field
          value={`${fields.numberOwners || '-'}(${
            fields.uniqueOwners || '-'
          }%)`}
          label='Owners(Unique Owners)'
          toolTipLabel={
            <div>
              <div>
                Dispersion = (Number of Holders / Number of NFTs) × 100%.
              </div>
              <div>
                A low dispersion suggests that a significant portion of the
                collection is held by a few, increasing the risk of price
                manipulation.
              </div>
            </div>
          }
        />
        {/* TODO: 7D Change */}
        <Field
          value={fields.weekChange}
          label='7D Change'
          trendType={fields.weekChangeTrendType as 'up' | 'down' | ''}
        />
        {/* TODO: 7D Volume */}
        <Field
          iconVisible={true}
          value={fields.weekVolumn}
          label='7D Volume'
        />
        {/* TODO: Listed/Supply */}
        <Field
          value={fields.listedAndSupply}
          label='Listed/Supply'
        />
        {/* 24h */}
        {/* <Flex flexDir='column' alignItems='center'>
          <Flex alignItems={'center'}>
            <SvgComponent svgId='icon-eth' svgSize='20px' />
            <Heading
              fontSize={{ md: '24px', sm: '20px', xs: '20px' }}
              fontWeight='700'
              display='flex'
              mb={'4px'}
            >
              {formatFloat(oneDayAveragePrice) || '--'}
            </Heading>
          </Flex>

          <Text
            color={oneDayChange < 0 ? 'red.1' : 'green.1'}
            fontSize={{ md: '14px', sm: '12px', xs: '12px' }}
          >
            <Highlight
              styles={{
                color: `gray.4`,
              }}
              query='24h'
            >
              {`24h ${BigNumber(oneDayChange).multipliedBy(100).toFixed(2)}%`}
            </Highlight>
          </Text>
        </Flex> */}
        {/* supply */}
        {/* <Field
          label='Supply'
          value={totalSupply.toLocaleString() || '--'}
        /> */}
        {/* listing */}
        {/* <Flex flexDir='column' alignItems='center'>
          <Flex alignItems={'center'}>
            <Heading
              fontSize={{ md: '24px', sm: '20px', xs: '20px' }}
              fontWeight='700'
              display='flex'
              mb={'4px'}
            >
              {totalSales?.toLocaleString() || '--'}
            </Heading>
          </Flex>

          <Text
            color='gray.4'
            fontSize={{ md: '14px', sm: '12px', xs: '12px' }}
          >
            Listing
          </Text>
        </Flex> */}
      </Flex>
    </Box>
  )
}
export default CollectionDescription

function Field(props: {
  w?: string | Record<string, string>
  label: string
  value: string
  iconVisible?: boolean
  toolTipLabel?: React.ReactNode
  trendType?: 'up' | 'down' | ''
}) {
  return (
    <Tooltip
      hasArrow
      label={props.toolTipLabel}
      isDisabled={!props.toolTipLabel}>
      <Flex
        flexDir='column'
        alignItems='center'
        justifyContent={'center'}
        w={props.w}
        justify={'center'}>
        <Flex
          alignItems={'center'}
          justifyContent={'center'}>
          {props.iconVisible && (
            <SvgComponent
              svgId='icon-eth'
              svgSize='20px'
            />
          )}
          {props.trendType === 'up' && (
            <SvgComponent
              svgId='icon-arrow'
              fill={'green'}
              transform={'rotate(-90deg)'}
              fontSize={'16px'}
            />
          )}
          {props.trendType === 'down' && (
            <SvgComponent
              svgId='icon-arrow'
              fill={'red'}
              transform={'rotate(270deg)'}
              fontSize={'16px'}
            />
          )}
          <Heading
            fontSize={{ md: '24px', sm: '20px', xs: '20px' }}
            fontWeight='700'
            display='flex'
            textAlign={'center'}>
            {props.value || '--'}
          </Heading>
        </Flex>
        <Text
          color='gray.4'
          fontSize={{ md: '14px', sm: '12px', xs: '12px' }}>
          {props.label}
        </Text>
      </Flex>
    </Tooltip>
  )
}
