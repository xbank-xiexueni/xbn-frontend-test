import { gql } from '@apollo/client'
import * as Apollo from '@apollo/client'
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends Record<string, unknown>> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
const defaultOptions = {} as const
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  Cursor: any
  Decimal: any
  Time: any
}

export enum AssetType {
  Hot = 'Hot',
  New = 'New',
  Top = 'Top',
}

export type BuyYouFirstNft = {
  __typename?: 'BuyYouFirstNFT'
  /** asset 标签 */
  label: BuyYouFirstNftLabel
  nftAsset?: Maybe<NftAsset[]>
}

export enum BuyYouFirstNftLabel {
  Below_5 = 'BELOW_5',
  Hot = 'HOT',
  MostFamous = 'MOST_FAMOUS',
}

/** gas price 统计 */
export type GasPriceStatistic = {
  __typename?: 'GasPriceStatistic'
  /** 对应 https://etherscan.io/gastracker 中的 Average */
  average: Scalars['Int']
  /** 最终 gasFee 计算值对应的大小阈值，单位为美元 */
  gasFeeThreshold: Scalars['Float']
  /** opensea 合约预估使用量 */
  gasLimit: Scalars['Int']
  /** 对应 https://etherscan.io/gastracker 中的 High */
  high: Scalars['Int']
  /** 对应 https://etherscan.io/gastracker 中的 Low */
  low: Scalars['Int']
  /** 过去 7 天最小值 */
  lowest: Scalars['Int']
}

export type MarketStats = {
  __typename?: 'MarketStats'
  marketCap: Scalars['Float']
  maxSupply: Scalars['Float']
  name: Scalars['String']
  percentChange24h: Scalars['Float']
  price: Scalars['Float']
  slug: Scalars['String']
  symbol: Scalars['String']
  volume: Scalars['Float']
}

export type Mutation = {
  __typename?: 'Mutation'
  /** 点赞 */
  likeAsset: Scalars['Boolean']
  /** 用户订阅 collection */
  subscribeCollection: Scalars['Boolean']
  /** 取消点赞 */
  unLikeAsset: Scalars['Boolean']
  /** 用户取消订阅 collection */
  unSubscribeCollection: Scalars['Boolean']
}

export type MutationLikeAssetArgs = {
  assetContractAddress?: InputMaybe<Scalars['String']>
  assetId?: InputMaybe<Scalars['ID']>
  assetTokenID?: InputMaybe<Scalars['String']>
}

export type MutationSubscribeCollectionArgs = {
  collection_id: Scalars['ID']
}

export type MutationUnLikeAssetArgs = {
  assetContractAddress?: InputMaybe<Scalars['String']>
  assetId?: InputMaybe<Scalars['ID']>
  assetTokenID?: InputMaybe<Scalars['String']>
}

export type MutationUnSubscribeCollectionArgs = {
  collection_id: Scalars['ID']
}

export type NftAsset = Node & {
  __typename?: 'NFTAsset'
  animationOriginalUrl: Scalars['String']
  animationUrl: Scalars['String']
  assetContractAddress: Scalars['String']
  backgroundColor: Scalars['String']
  chain: Scalars['String']
  createdAt: Scalars['Time']
  creator: Scalars['String']
  description: Scalars['String']
  externalLink: Scalars['String']
  id: Scalars['ID']
  imageOriginalUrl: Scalars['String']
  imagePreviewUrl: Scalars['String']
  imageThumbnailUrl: Scalars['String']
  imageUrl: Scalars['String']
  name: Scalars['String']
  /** asset 关联的合约地址 */
  nftAssetContract: NftAssetContract
  nftAssetMetaData: NftAssetMetaData
  /** asset 关联特征 */
  nftAssetTraits?: Maybe<NftAssetTrait[]>
  orderChain: Scalars['String']
  orderCoin: Scalars['String']
  orderPrice: Scalars['Decimal']
  orderPriceMarket: Scalars['String']
  owner: Scalars['String']
  rarity: Scalars['Float']
  rarityLevel: Scalars['String']
  rarityRank: Scalars['Int']
  tokenID: Scalars['String']
  transferFee: Scalars['String']
  transferFeePaymentToken: Scalars['String']
  updatedAt: Scalars['Time']
}

export type NftAssetConnection = {
  __typename?: 'NFTAssetConnection'
  edges?: Maybe<Maybe<NftAssetEdge>[]>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type NftAssetContract = {
  __typename?: 'NFTAssetContract'
  address: Scalars['String']
  assetContractType: Scalars['String']
  buyerFeeBasisPoints: Scalars['Int']
  createdAt: Scalars['Time']
  createdDate: Scalars['String']
  description: Scalars['String']
  externalLink: Scalars['String']
  id: Scalars['ID']
  imageUrl: Scalars['String']
  name: Scalars['String']
  nftVersion: Scalars['String']
  openseaBuyerFeeBasisPoints: Scalars['Int']
  openseaSellerFeeBasisPoints: Scalars['Int']
  openseaVersion: Scalars['String']
  payoutAddress: Scalars['String']
  schemaName: Scalars['String']
  sellerFeeBasisPoints: Scalars['Int']
  symbol: Scalars['String']
  totalSupply: Scalars['String']
  updatedAt: Scalars['Time']
}

export type NftAssetEdge = {
  __typename?: 'NFTAssetEdge'
  cursor: Scalars['Cursor']
  node?: Maybe<NftAsset>
}

export type NftAssetMetaData = {
  __typename?: 'NFTAssetMetaData'
  /** 是否点赞 */
  like: Scalars['Boolean']
  /** 点赞数 */
  likeCount: Scalars['Int']
}

export type NftAssetOrderBy = {
  direction: OrderDirection
  field: NftAssetOrderByField
}

export enum NftAssetOrderByField {
  CreatedAt = 'CREATED_AT',
  Likes = 'LIKES',
  Price = 'PRICE',
  Random = 'RANDOM',
  Rarity = 'RARITY',
}

export type NftAssetOrderConnection = {
  __typename?: 'NFTAssetOrderConnection'
  edges?: Maybe<Maybe<NftAssetOrderEdge>[]>
  pageInfo: PageInfo
}

export type NftAssetOrderEdge = {
  __typename?: 'NFTAssetOrderEdge'
  cursor: Scalars['Cursor']
  node?: Maybe<NftOrder>
}

export enum NftAssetOrderType {
  /** 卖单 */
  Listings = 'LISTINGS',
}

export type NftAssetOrderWhere = {
  orderType?: InputMaybe<NftAssetOrderType>
}

export type NftAssetProperty = {
  __typename?: 'NFTAssetProperty'
  /** 数量 */
  count: Scalars['Int']
  /** asset 特征 */
  trait_type: Scalars['String']
  /** asset 特征值 */
  value: Scalars['String']
}

export enum NftAssetStatus {
  BuyNow = 'BUY_NOW',
  HasOffers = 'HAS_OFFERS',
  OnAuction = 'ON_AUCTION',
}

export type NftAssetTrait = {
  __typename?: 'NFTAssetTrait'
  id: Scalars['ID']
  percentage: Scalars['Float']
  rarity: Scalars['Float']
  traitType: Scalars['String']
  value: Scalars['String']
}

export type NftAssetWhere = {
  /** 货币筛选 */
  CryptoCurrency?: InputMaybe<Scalars['String'][]>
  /** 产品运营配置的 collectionId */
  famous?: InputMaybe<Scalars['ID'][]>
  /** 认证状态筛选条件 */
  isVerified?: InputMaybe<Scalars['Boolean']>
  /** 价格大于等于 */
  priceGTE?: InputMaybe<Scalars['Float']>
  /** 价格小于等于 */
  priceLTE?: InputMaybe<Scalars['Float']>
  /** asset 的状态 */
  status?: InputMaybe<NftAssetStatus[]>
  /** asset 特征 */
  traitType?: InputMaybe<Scalars['String']>
  /** asset 特征值 */
  traitTypeValue?: InputMaybe<Scalars['String'][]>
}

export type NftCollection = Node & {
  __typename?: 'NFTCollection'
  assetsCount: Scalars['Int']
  bannerImageUrl: Scalars['String']
  chatUrl: Scalars['String']
  createdAt: Scalars['Time']
  createdDate: Scalars['Time']
  description: Scalars['String']
  discordUrl: Scalars['String']
  externalUrl: Scalars['String']
  featuredImageUrl: Scalars['String']
  fees?: Maybe<NftCollectionFee[]>
  id: Scalars['ID']
  imagePreviewUrl: Scalars['String']
  imageThumbnailUrl: Scalars['String']
  imageUrl: Scalars['String']
  instagramUsername: Scalars['String']
  isCreatorFeesEnforced: Scalars['Boolean']
  largeImageUrl: Scalars['String']
  mediumUsername: Scalars['String']
  name: Scalars['String']
  nftCollectionMetaData: NftCollectionMetaData
  /** collection 的统计 */
  nftCollectionStat: NftCollectionStat
  onlyProxiedTransfers: Scalars['Boolean']
  openseaBuyerFeeBasisPoints: Scalars['String']
  openseaSellerFeeBasisPoints: Scalars['String']
  payoutAddress: Scalars['String']
  safelistRequestStatus: Scalars['String']
  shortDescription: Scalars['String']
  slug: Scalars['String']
  subscriberCount: Scalars['Int']
  telegramUrl: Scalars['String']
  /** OpenSea + Blur total listed */
  totalListed: Scalars['Int']
  twitterUsername: Scalars['String']
  updatedAt: Scalars['Time']
  wikiUrl: Scalars['String']
}

export type NftCollectionByContractAddress = {
  __typename?: 'NFTCollectionByContractAddress'
  contractAddress: Scalars['String']
  nftCollection: NftCollection
}

export type NftCollectionConnection = {
  __typename?: 'NFTCollectionConnection'
  edges?: Maybe<Maybe<NftCollectionEdge>[]>
  pageInfo: PageInfo
  totalCount: Scalars['Int']
}

export type NftCollectionEdge = {
  __typename?: 'NFTCollectionEdge'
  cursor: Scalars['Cursor']
  node?: Maybe<NftCollection>
}

export type NftCollectionFee = {
  __typename?: 'NFTCollectionFee'
  /** 酬金地址 */
  address: Scalars['String']
  /** 酬金名称 */
  name: Scalars['String']
  /** 酬金比例 250 => 2.5% */
  value: Scalars['Int']
}

export type NftCollectionMetaData = {
  __typename?: 'NFTCollectionMetaData'
  /** collection 是否订阅 */
  subscribe: Scalars['Boolean']
  /** collection 订阅数 */
  subscribeCount: Scalars['Int']
}

/** NFT Collection 的元数据信息 */
export type NftCollectionMetadata = {
  __typename?: 'NFTCollectionMetadata'
  /** NFT Top Bid */
  bestCollectionBid: NftCollectionPriceInfo
}

export type NftCollectionOrder = {
  direction: OrderDirection
  field?: InputMaybe<NftCollectionOrderField>
}

export enum NftCollectionOrderField {
  CreatedAt = 'CREATED_AT',
}

/** 表示 Floor Price 等金额的基础结构体 */
export type NftCollectionPriceInfo = {
  __typename?: 'NFTCollectionPriceInfo'
  /** 金额 */
  amount: Scalars['Decimal']
  /** 单位 (通常是 ETH) */
  unit: Scalars['String']
}

export type NftCollectionStat = {
  __typename?: 'NFTCollectionStat'
  averagePrice: Scalars['Float']
  count: Scalars['Int']
  createdAt: Scalars['Time']
  floorPrice: Scalars['Float']
  /** 7D 前的地板价金额 */
  floorPriceOneWeekAmount: Scalars['Decimal']
  /** 7D 前的地板价单位，通常是 ETH */
  floorPriceOneWeekUnit: Scalars['String']
  /** 地板价 24h 变化率 */
  floorPriceRate: Scalars['Float']
  id: Scalars['ID']
  marketCap: Scalars['Float']
  numOwners: Scalars['Int']
  numReports: Scalars['Int']
  /** 持有者总数（数据来源: Blur） */
  numberOwners: Scalars['Int']
  oneDayAveragePrice: Scalars['Float']
  oneDayChange: Scalars['Float']
  oneDaySales: Scalars['Int']
  oneDayVolume: Scalars['Float']
  sevenDayAveragePrice: Scalars['Float']
  sevenDayChange: Scalars['Float']
  sevenDaySales: Scalars['Int']
  sevenDayVolume: Scalars['Float']
  thirtyDayAveragePrice: Scalars['Float']
  thirtyDayChange: Scalars['Float']
  thirtyDaySales: Scalars['Int']
  thirtyDayVolume: Scalars['Float']
  totalSales: Scalars['Int']
  totalSupply: Scalars['Int']
  totalVolume: Scalars['Float']
  updatedAt: Scalars['Time']
  /** 7D 交易总金额 */
  volumeOneWeekAmount: Scalars['Decimal']
  /** 7D 交易总金额的单位，通常是 ETH */
  volumeOneWeekUnit: Scalars['String']
}

export type NftCollectionWhere = {
  /** collection系列assets数量下限 */
  AssetsCountGTE?: InputMaybe<Scalars['Int']>
  /** collection系列assets数量上限 */
  AssetsCountLTE?: InputMaybe<Scalars['Int']>
  /** 币种 */
  CryptoCurrency?: InputMaybe<Scalars['String'][]>
  /** 产品运营配置的 collectionId */
  Famous?: InputMaybe<Scalars['ID'][]>
  /** collection 地板价下限 */
  FloorPriceGTE?: InputMaybe<Scalars['Float']>
  /** collection 地板价上限 */
  FloorPriceLTE?: InputMaybe<Scalars['Float']>
}

export type NftConnectionOrderBy = {
  direction: OrderDirection
  field: NftConnectionOrderByField
}

export enum NftConnectionOrderByField {
  /** 创建时间 */
  CreatedAt = 'CREATED_AT',
  /** 地板价 */
  FloorPrice = 'FLOOR_PRICE',
  /** 24h 地板价变化率 */
  FloorPriceRate = 'FLOOR_PRICE_RATE',
}

export type NftFamous = {
  __typename?: 'NFTFamous'
  /** collection 的 id */
  id: Scalars['ID']
  /** collection 的 image_url */
  image_url: Scalars['String']
  /** collection 的 name */
  name: Scalars['String']
  /** collection 的 tags */
  tags?: Maybe<Scalars['String'][]>
}

export type NftOrder = {
  __typename?: 'NFTOrder'
  assetContractAddress: Scalars['String']
  cancelled: Scalars['Boolean']
  closeAt: Scalars['Time']
  finalized: Scalars['Boolean']
  id: Scalars['ID']
  maker: Scalars['String']
  nftPaymentToken: NftPaymentToken
  orderCreatedAt: Scalars['Time']
  orderHash: Scalars['String']
  orderType: Scalars['String']
  price: Scalars['Decimal']
  remainingQuantity: Scalars['Int']
  side: Scalars['String']
  taker: Scalars['String']
  tokenId: Scalars['String']
  updatedAt: Scalars['Time']
}

export type NftPaymentToken = {
  __typename?: 'NFTPaymentToken'
  /** 地址 */
  address: Scalars['String']
  /** 链名 */
  chain: Scalars['String']
  /** 币名 */
  coin: Scalars['String']
  /** 精度位数 */
  decimals: Scalars['Int']
  id: Scalars['ID']
  /** 币种名 */
  name: Scalars['String']
}

export type NftSubscribedAsset = {
  __typename?: 'NFTSubscribedAsset'
  collectionId: Scalars['ID']
  nftAssets?: Maybe<NftAsset[]>
}

export type Node = {
  id: Scalars['ID']
}

export enum Os {
  Android = 'ANDROID',
  Ios = 'IOS',
}

export enum OrderDirection {
  Asc = 'ASC',
  Desc = 'DESC',
}

export type PageInfo = {
  __typename?: 'PageInfo'
  endCursor?: Maybe<Scalars['Cursor']>
  hasNextPage: Scalars['Boolean']
}

export type Query = {
  __typename?: 'Query'
  /** 通过 asset id 获取 asset 实体 */
  asset: NftAsset
  /** 通过 asset id 获取 asset orders */
  assetOrders: NftAssetOrderConnection
  /** 根据 collection_id 获取特征值集合 */
  assetProperties?: Maybe<NftAssetProperty[]>
  /** 通过条件和排序获取 assets，主要为 Art 等常规标签 */
  assets: NftAssetConnection
  /** 获取 Hot，Top 等特殊标签下的 assets */
  assetsChannel: NftAssetConnection
  /** Buy you first NFTs */
  buyYouFirstNFTs: Maybe<BuyYouFirstNft>[]
  /** 获取点赞上升速度最快的 assets */
  fastestRisingAssets: Maybe<NftAsset>[]
  /** 获取收藏 asset 列表 */
  favoriteAssets: NftAssetConnection
  /** ForU 标签下的 assets */
  forU: NftAssetConnection
  /** 获取实时 gas price 统计信息，后台一分钟更新一次，前端按需调整 */
  gasPrice: GasPriceStatistic
  /** 查询是否关闭购买开关，os 传枚举，version 传送版本号，如 2.9.1 */
  isTurnOnPurchase: Scalars['Boolean']
  /**
   * 主要用于 Web3 Square 下的市场数据
   * slug: 平台唯一标识符，对于以下链接，slug 为 ethereum-name-service
   * https://coinmarketcap.com/currencies/ethereum-name-service/
   */
  marketStats: MarketStats
  /** 通过 collectionId 或 assetId 或 assetContractAddress和assetTokenID 获取collection实体 */
  nftCollection: NftCollection
  /** 通过 collectionId 获取其系列下的 asset列表 */
  nftCollectionAssets: NftAssetConnection
  /** 通过 asset contract address 获取 collection，如果有多个返回第一个 */
  nftCollectionByContractAddress: NftCollection
  /** 获取运营配置的 collection 列表 */
  nftCollectionByFamous?: Maybe<NftFamous[]>
  /** 随机获取 collection */
  nftCollectionByRandom: NftCollectionConnection
  /** 通过 collection slug 查询元数据 */
  nftCollectionMetadata: NftCollectionMetadata
  /** 通过 collectionId 和 asset的name或token_id 精确搜索asset实体 */
  nftCollectionSearchAsset: NftAsset
  /** 获取订阅的 collection 下的 asset 列表 */
  nftCollectionSubscribedAssets?: Maybe<NftSubscribedAsset[]>
  nftCollectionsByContractAddresses?: Maybe<NftCollectionByContractAddress[]>
  /** 获取所有 nft_payment_token */
  nftPaymentToken?: Maybe<NftPaymentToken[]>
  /** 获取用户订阅列表 */
  nftSubscriptionCollection: NftCollectionConnection
  /** Node */
  node?: Maybe<Node>
  nodes: Maybe<Node>[]
  /** collection 收藏数排名在前10的 assets */
  popularAssets: Maybe<NftAsset>[]
  /** assets 模糊搜索 */
  searchNFTAssets: NftAssetConnection
  /** collections 模糊搜索 */
  searchNFTCollections: NftCollectionConnection
  /** 历史搜索结果排名前 20 的搜索记录 */
  topSearches?: Maybe<Scalars['String'][]>
  /** 根据 id 获取 web3_square 数据 */
  web3Square: Web3Square
  /** 分页获取 web3_square 数据 */
  web3Squares: Web3SquareConnection
}

export type QueryAssetArgs = {
  assetContractAddress?: InputMaybe<Scalars['String']>
  assetTokenID?: InputMaybe<Scalars['String']>
  id?: InputMaybe<Scalars['ID']>
}

export type QueryAssetOrdersArgs = {
  after?: InputMaybe<Scalars['Cursor']>
  assetContractAddress?: InputMaybe<Scalars['String']>
  assetID?: InputMaybe<Scalars['ID']>
  assetTokenID?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Int']>
  where?: InputMaybe<NftAssetOrderWhere>
  withUpdate?: InputMaybe<Scalars['Boolean']>
}

export type QueryAssetPropertiesArgs = {
  collectID: Scalars['ID']
}

export type QueryAssetsArgs = {
  after?: InputMaybe<Scalars['Cursor']>
  first?: InputMaybe<Scalars['Int']>
  orderBy: NftAssetOrderBy
  tag: Scalars['String']
  where?: InputMaybe<NftAssetWhere>
}

export type QueryAssetsChannelArgs = {
  after?: InputMaybe<Scalars['Cursor']>
  assetType: AssetType
  first?: InputMaybe<Scalars['Int']>
  orderBy: NftAssetOrderBy
  tags?: InputMaybe<Scalars['String'][]>
  where?: InputMaybe<NftAssetWhere>
}

export type QueryFastestRisingAssetsArgs = {
  offset: Scalars['Int']
  pageSize: Scalars['Int']
}

export type QueryFavoriteAssetsArgs = {
  after?: InputMaybe<Scalars['Cursor']>
  first?: InputMaybe<Scalars['Int']>
}

export type QueryForUArgs = {
  after?: InputMaybe<Scalars['Cursor']>
  first?: InputMaybe<Scalars['Int']>
  orderBy: NftAssetOrderBy
  tags?: InputMaybe<Scalars['String'][]>
  where?: InputMaybe<NftAssetWhere>
}

export type QueryIsTurnOnPurchaseArgs = {
  os: Os
  version: Scalars['String']
}

export type QueryMarketStatsArgs = {
  slug: Scalars['String']
}

export type QueryNftCollectionArgs = {
  assetContractAddress?: InputMaybe<Scalars['String']>
  assetId?: InputMaybe<Scalars['ID']>
  assetTokenID?: InputMaybe<Scalars['String']>
  collectionId?: InputMaybe<Scalars['ID']>
}

export type QueryNftCollectionAssetsArgs = {
  after?: InputMaybe<Scalars['Cursor']>
  collectionID: Scalars['ID']
  first?: InputMaybe<Scalars['Int']>
  orderBy: NftAssetOrderBy
  where?: InputMaybe<NftAssetWhere>
}

export type QueryNftCollectionByContractAddressArgs = {
  assetContractAddress: Scalars['String']
}

export type QueryNftCollectionByRandomArgs = {
  after?: InputMaybe<Scalars['Cursor']>
  assetContractAddress?: InputMaybe<Scalars['String']>
  assetID?: InputMaybe<Scalars['ID']>
  assetTokenID?: InputMaybe<Scalars['String']>
  first?: InputMaybe<Scalars['Int']>
}

export type QueryNftCollectionMetadataArgs = {
  slug: Scalars['String']
}

export type QueryNftCollectionSearchAssetArgs = {
  collectionId: Scalars['ID']
  search: Scalars['String']
}

export type QueryNftCollectionSubscribedAssetsArgs = {
  collectionID?: InputMaybe<Scalars['ID'][]>
}

export type QueryNftCollectionsByContractAddressesArgs = {
  assetContractAddresses: Scalars['String'][]
}

export type QueryNftSubscriptionCollectionArgs = {
  after?: InputMaybe<Scalars['Cursor']>
  first?: InputMaybe<Scalars['Int']>
  orderBy: NftConnectionOrderBy
  status?: InputMaybe<Scalars['String'][]>
  tags?: InputMaybe<Scalars['String'][]>
  where?: InputMaybe<NftCollectionWhere>
}

export type QueryNodeArgs = {
  id: Scalars['ID']
}

export type QueryNodesArgs = {
  ids: Scalars['ID'][]
}

export type QueryPopularAssetsArgs = {
  lastId?: InputMaybe<Scalars['ID']>
  pageSize: Scalars['Int']
}

export type QuerySearchNftAssetsArgs = {
  after?: InputMaybe<Scalars['Cursor']>
  first?: InputMaybe<Scalars['Int']>
  query: Scalars['String']
}

export type QuerySearchNftCollectionsArgs = {
  after?: InputMaybe<Scalars['Cursor']>
  first?: InputMaybe<Scalars['Int']>
  query: Scalars['String']
}

export type QueryWeb3SquareArgs = {
  id: Scalars['ID']
}

export type QueryWeb3SquaresArgs = {
  after?: InputMaybe<Scalars['Cursor']>
  first?: InputMaybe<Scalars['Int']>
}

export type Web3Square = {
  __typename?: 'Web3Square'
  benefits: Scalars['String']
  createdAt: Scalars['Time']
  discordURL: Scalars['String']
  externalURL: Scalars['String']
  followers: Scalars['Int']
  getStarted: Scalars['String']
  id: Scalars['ID']
  linkedinURL: Scalars['String']
  medium: Scalars['String']
  members: Scalars['Int']
  preOrders: Scalars['Int']
  projectBanner: Scalars['String']
  projectDescription: Scalars['String']
  projectName: Scalars['String']
  token: Scalars['String']
  tokenName: Scalars['String']
  topSales?: Maybe<Scalars['String'][]>
  twitter: Scalars['String']
  updatedAt: Scalars['Time']
}

export type Web3SquareConnection = {
  __typename?: 'Web3SquareConnection'
  edges?: Maybe<Maybe<Web3SquareEdge>[]>
  pageInfo: PageInfo
}

export type Web3SquareEdge = {
  __typename?: 'Web3SquareEdge'
  cursor: Scalars['Cursor']
  node?: Maybe<Web3Square>
}

export type AssetQueryVariables = Exact<{
  assetId?: InputMaybe<Scalars['ID']>
  assetContractAddress?: InputMaybe<Scalars['String']>
  assetTokenId?: InputMaybe<Scalars['String']>
}>

export type AssetQuery = {
  __typename?: 'Query'
  asset: {
    __typename?: 'NFTAsset'
    id: string
    assetContractAddress: string
    tokenID: string
    imageUrl: string
    imagePreviewUrl: string
    imageThumbnailUrl: string
    imageOriginalUrl: string
    animationUrl: string
    animationOriginalUrl: string
    backgroundColor: string
    name: string
    owner: string
    orderChain: string
    orderCoin: string
    orderPrice: any
    orderPriceMarket: string
  }
}

export type AssetOrdersPriceQueryVariables = Exact<{
  assetContractAddress?: InputMaybe<Scalars['String']>
  assetTokenId?: InputMaybe<Scalars['String']>
  withUpdate?: InputMaybe<Scalars['Boolean']>
}>

export type AssetOrdersPriceQuery = {
  __typename?: 'Query'
  assetOrders: {
    __typename?: 'NFTAssetOrderConnection'
    edges?:
      | ({
          __typename?: 'NFTAssetOrderEdge'
          node?: {
            __typename?: 'NFTOrder'
            assetContractAddress: string
            updatedAt: any
            price: any
            tokenId: string
            orderType: string
            nftPaymentToken: {
              __typename?: 'NFTPaymentToken'
              decimals: number
            }
          } | null
        } | null)[]
      | null
  }
}

export type AssetSimpleQueryVariables = Exact<{
  assetContractAddress?: InputMaybe<Scalars['String']>
  assetTokenId?: InputMaybe<Scalars['String']>
}>

export type AssetSimpleQuery = {
  __typename?: 'Query'
  asset: {
    __typename?: 'NFTAsset'
    id: string
    imagePreviewUrl: string
    name: string
    tokenID: string
  }
}

export type BestCollectionBidQueryVariables = Exact<{
  slug: Scalars['String']
}>

export type BestCollectionBidQuery = {
  __typename?: 'Query'
  nftCollectionMetadata: {
    __typename?: 'NFTCollectionMetadata'
    bestCollectionBid: {
      __typename?: 'NFTCollectionPriceInfo'
      amount: any
      unit: string
    }
  }
}

export type NftCollectionAssetsQueryVariables = Exact<{
  collectionId: Scalars['ID']
  orderBy: NftAssetOrderBy
  first?: InputMaybe<Scalars['Int']>
  after?: InputMaybe<Scalars['Cursor']>
  where?: InputMaybe<NftAssetWhere>
}>

export type NftCollectionAssetsQuery = {
  __typename?: 'Query'
  nftCollectionAssets: {
    __typename?: 'NFTAssetConnection'
    totalCount: number
    edges?:
      | ({
          __typename?: 'NFTAssetEdge'
          cursor: any
          node?: {
            __typename?: 'NFTAsset'
            id: string
            assetContractAddress: string
            tokenID: string
            imageUrl: string
            imagePreviewUrl: string
            imageThumbnailUrl: string
            imageOriginalUrl: string
            animationUrl: string
            animationOriginalUrl: string
            backgroundColor: string
            name: string
            owner: string
            orderPrice: any
            orderPriceMarket: string
            nftAssetContract: {
              __typename?: 'NFTAssetContract'
              id: string
              address: string
              name: string
              totalSupply: string
              imageUrl: string
            }
          } | null
        } | null)[]
      | null
    pageInfo: {
      __typename?: 'PageInfo'
      hasNextPage: boolean
      endCursor?: any | null
    }
  }
}

export type NftCollectionsByContractAddressesQueryVariables = Exact<{
  assetContractAddresses: Scalars['String'][] | Scalars['String']
}>

export type NftCollectionsByContractAddressesQuery = {
  __typename?: 'Query'
  nftCollectionsByContractAddresses?:
    | {
        __typename?: 'NFTCollectionByContractAddress'
        contractAddress: string
        nftCollection: {
          __typename?: 'NFTCollection'
          assetsCount: number
          description: string
          featuredImageUrl: string
          id: string
          instagramUsername: string
          mediumUsername: string
          discordUrl: string
          externalUrl: string
          twitterUsername: string
          telegramUrl: string
          imagePreviewUrl: string
          imageThumbnailUrl: string
          imageUrl: string
          largeImageUrl: string
          name: string
          safelistRequestStatus: string
          shortDescription: string
          slug: string
          isCreatorFeesEnforced: boolean
          totalListed: number
          fees?:
            | {
                __typename?: 'NFTCollectionFee'
                address: string
                name: string
                value: number
              }[]
            | null
          nftCollectionStat: {
            __typename?: 'NFTCollectionStat'
            averagePrice: number
            count: number
            createdAt: any
            floorPrice: number
            floorPriceRate: number
            id: string
            oneDayAveragePrice: number
            oneDayChange: number
            totalSales: number
            totalSupply: number
            totalVolume: number
            volumeOneWeekAmount: any
            volumeOneWeekUnit: string
            floorPriceOneWeekAmount: any
            floorPriceOneWeekUnit: string
            numberOwners: number
          }
        }
      }[]
    | null
}

export type NftCollectionSearchAssetQueryVariables = Exact<{
  collectionId: Scalars['ID']
  search: Scalars['String']
}>

export type NftCollectionSearchAssetQuery = {
  __typename?: 'Query'
  nftCollectionSearchAsset: {
    __typename?: 'NFTAsset'
    id: string
    assetContractAddress: string
    tokenID: string
    imageUrl: string
    imagePreviewUrl: string
    imageThumbnailUrl: string
    imageOriginalUrl: string
    animationUrl: string
    animationOriginalUrl: string
    backgroundColor: string
    name: string
    owner: string
    orderPrice: any
    orderPriceMarket: string
    nftAssetContract: {
      __typename?: 'NFTAssetContract'
      id: string
      address: string
      name: string
      totalSupply: string
      imageUrl: string
    }
  }
}

export const AssetDocument = gql`
  query Asset(
    $assetId: ID
    $assetContractAddress: String
    $assetTokenId: String
  ) {
    asset(
      id: $assetId
      assetContractAddress: $assetContractAddress
      assetTokenID: $assetTokenId
    ) {
      id
      assetContractAddress
      tokenID
      imageUrl
      imagePreviewUrl
      imageThumbnailUrl
      imageOriginalUrl
      animationUrl
      animationOriginalUrl
      backgroundColor
      name
      owner
      orderChain
      orderCoin
      orderPrice
      orderPriceMarket
    }
  }
`

/**
 * __useAssetQuery__
 *
 * To run a query within a React component, call `useAssetQuery` and pass it any options that fit your needs.
 * When your component renders, `useAssetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssetQuery({
 *   variables: {
 *      assetId: // value for 'assetId'
 *      assetContractAddress: // value for 'assetContractAddress'
 *      assetTokenId: // value for 'assetTokenId'
 *   },
 * });
 */
export function useAssetQuery(
  baseOptions?: Apollo.QueryHookOptions<AssetQuery, AssetQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<AssetQuery, AssetQueryVariables>(
    AssetDocument,
    options,
  )
}
export function useAssetLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<AssetQuery, AssetQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<AssetQuery, AssetQueryVariables>(
    AssetDocument,
    options,
  )
}
export type AssetQueryHookResult = ReturnType<typeof useAssetQuery>
export type AssetLazyQueryHookResult = ReturnType<typeof useAssetLazyQuery>
export type AssetQueryResult = Apollo.QueryResult<
  AssetQuery,
  AssetQueryVariables
>
export const AssetOrdersPriceDocument = gql`
  query AssetOrdersPrice(
    $assetContractAddress: String
    $assetTokenId: String
    $withUpdate: Boolean
  ) {
    assetOrders(
      assetContractAddress: $assetContractAddress
      assetTokenID: $assetTokenId
      withUpdate: $withUpdate
    ) {
      edges {
        node {
          assetContractAddress
          updatedAt
          price
          tokenId
          orderType
          nftPaymentToken {
            decimals
          }
        }
      }
    }
  }
`

/**
 * __useAssetOrdersPriceQuery__
 *
 * To run a query within a React component, call `useAssetOrdersPriceQuery` and pass it any options that fit your needs.
 * When your component renders, `useAssetOrdersPriceQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssetOrdersPriceQuery({
 *   variables: {
 *      assetContractAddress: // value for 'assetContractAddress'
 *      assetTokenId: // value for 'assetTokenId'
 *      withUpdate: // value for 'withUpdate'
 *   },
 * });
 */
export function useAssetOrdersPriceQuery(
  baseOptions?: Apollo.QueryHookOptions<
    AssetOrdersPriceQuery,
    AssetOrdersPriceQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<AssetOrdersPriceQuery, AssetOrdersPriceQueryVariables>(
    AssetOrdersPriceDocument,
    options,
  )
}
export function useAssetOrdersPriceLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    AssetOrdersPriceQuery,
    AssetOrdersPriceQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<
    AssetOrdersPriceQuery,
    AssetOrdersPriceQueryVariables
  >(AssetOrdersPriceDocument, options)
}
export type AssetOrdersPriceQueryHookResult = ReturnType<
  typeof useAssetOrdersPriceQuery
>
export type AssetOrdersPriceLazyQueryHookResult = ReturnType<
  typeof useAssetOrdersPriceLazyQuery
>
export type AssetOrdersPriceQueryResult = Apollo.QueryResult<
  AssetOrdersPriceQuery,
  AssetOrdersPriceQueryVariables
>
export const AssetSimpleDocument = gql`
  query AssetSimple($assetContractAddress: String, $assetTokenId: String) {
    asset(
      assetContractAddress: $assetContractAddress
      assetTokenID: $assetTokenId
    ) {
      id
      imagePreviewUrl
      name
      tokenID
    }
  }
`

/**
 * __useAssetSimpleQuery__
 *
 * To run a query within a React component, call `useAssetSimpleQuery` and pass it any options that fit your needs.
 * When your component renders, `useAssetSimpleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssetSimpleQuery({
 *   variables: {
 *      assetContractAddress: // value for 'assetContractAddress'
 *      assetTokenId: // value for 'assetTokenId'
 *   },
 * });
 */
export function useAssetSimpleQuery(
  baseOptions?: Apollo.QueryHookOptions<
    AssetSimpleQuery,
    AssetSimpleQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<AssetSimpleQuery, AssetSimpleQueryVariables>(
    AssetSimpleDocument,
    options,
  )
}
export function useAssetSimpleLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    AssetSimpleQuery,
    AssetSimpleQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<AssetSimpleQuery, AssetSimpleQueryVariables>(
    AssetSimpleDocument,
    options,
  )
}
export type AssetSimpleQueryHookResult = ReturnType<typeof useAssetSimpleQuery>
export type AssetSimpleLazyQueryHookResult = ReturnType<
  typeof useAssetSimpleLazyQuery
>
export type AssetSimpleQueryResult = Apollo.QueryResult<
  AssetSimpleQuery,
  AssetSimpleQueryVariables
>
export const BestCollectionBidDocument = gql`
  query BestCollectionBid($slug: String!) {
    nftCollectionMetadata(slug: $slug) {
      bestCollectionBid {
        amount
        unit
      }
    }
  }
`

/**
 * __useBestCollectionBidQuery__
 *
 * To run a query within a React component, call `useBestCollectionBidQuery` and pass it any options that fit your needs.
 * When your component renders, `useBestCollectionBidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBestCollectionBidQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useBestCollectionBidQuery(
  baseOptions: Apollo.QueryHookOptions<
    BestCollectionBidQuery,
    BestCollectionBidQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<
    BestCollectionBidQuery,
    BestCollectionBidQueryVariables
  >(BestCollectionBidDocument, options)
}
export function useBestCollectionBidLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    BestCollectionBidQuery,
    BestCollectionBidQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<
    BestCollectionBidQuery,
    BestCollectionBidQueryVariables
  >(BestCollectionBidDocument, options)
}
export type BestCollectionBidQueryHookResult = ReturnType<
  typeof useBestCollectionBidQuery
>
export type BestCollectionBidLazyQueryHookResult = ReturnType<
  typeof useBestCollectionBidLazyQuery
>
export type BestCollectionBidQueryResult = Apollo.QueryResult<
  BestCollectionBidQuery,
  BestCollectionBidQueryVariables
>
export const NftCollectionAssetsDocument = gql`
  query NftCollectionAssets(
    $collectionId: ID!
    $orderBy: NFTAssetOrderBy!
    $first: Int
    $after: Cursor
    $where: NFTAssetWhere
  ) {
    nftCollectionAssets(
      collectionID: $collectionId
      orderBy: $orderBy
      first: $first
      after: $after
      where: $where
    ) {
      edges {
        node {
          id
          assetContractAddress
          tokenID
          imageUrl
          imagePreviewUrl
          imageThumbnailUrl
          imageOriginalUrl
          animationUrl
          animationOriginalUrl
          backgroundColor
          name
          owner
          orderPrice
          nftAssetContract {
            id
            address
            name
            totalSupply
            imageUrl
          }
          orderPriceMarket
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`

/**
 * __useNftCollectionAssetsQuery__
 *
 * To run a query within a React component, call `useNftCollectionAssetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useNftCollectionAssetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNftCollectionAssetsQuery({
 *   variables: {
 *      collectionId: // value for 'collectionId'
 *      orderBy: // value for 'orderBy'
 *      first: // value for 'first'
 *      after: // value for 'after'
 *      where: // value for 'where'
 *   },
 * });
 */
export function useNftCollectionAssetsQuery(
  baseOptions: Apollo.QueryHookOptions<
    NftCollectionAssetsQuery,
    NftCollectionAssetsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<
    NftCollectionAssetsQuery,
    NftCollectionAssetsQueryVariables
  >(NftCollectionAssetsDocument, options)
}
export function useNftCollectionAssetsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    NftCollectionAssetsQuery,
    NftCollectionAssetsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<
    NftCollectionAssetsQuery,
    NftCollectionAssetsQueryVariables
  >(NftCollectionAssetsDocument, options)
}
export type NftCollectionAssetsQueryHookResult = ReturnType<
  typeof useNftCollectionAssetsQuery
>
export type NftCollectionAssetsLazyQueryHookResult = ReturnType<
  typeof useNftCollectionAssetsLazyQuery
>
export type NftCollectionAssetsQueryResult = Apollo.QueryResult<
  NftCollectionAssetsQuery,
  NftCollectionAssetsQueryVariables
>
export const NftCollectionsByContractAddressesDocument = gql`
  query NftCollectionsByContractAddresses($assetContractAddresses: [String!]!) {
    nftCollectionsByContractAddresses(
      assetContractAddresses: $assetContractAddresses
    ) {
      contractAddress
      nftCollection {
        assetsCount
        description
        featuredImageUrl
        fees {
          address
          name
          value
        }
        id
        instagramUsername
        mediumUsername
        discordUrl
        externalUrl
        twitterUsername
        telegramUrl
        imagePreviewUrl
        imageThumbnailUrl
        imageUrl
        largeImageUrl
        name
        nftCollectionStat {
          averagePrice
          count
          createdAt
          floorPrice
          floorPriceRate
          id
          oneDayAveragePrice
          oneDayChange
          totalSales
          totalSupply
          totalVolume
          volumeOneWeekAmount
          volumeOneWeekUnit
          floorPriceOneWeekAmount
          floorPriceOneWeekUnit
          numberOwners
        }
        safelistRequestStatus
        shortDescription
        slug
        isCreatorFeesEnforced
        totalListed
      }
    }
  }
`

/**
 * __useNftCollectionsByContractAddressesQuery__
 *
 * To run a query within a React component, call `useNftCollectionsByContractAddressesQuery` and pass it any options that fit your needs.
 * When your component renders, `useNftCollectionsByContractAddressesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNftCollectionsByContractAddressesQuery({
 *   variables: {
 *      assetContractAddresses: // value for 'assetContractAddresses'
 *   },
 * });
 */
export function useNftCollectionsByContractAddressesQuery(
  baseOptions: Apollo.QueryHookOptions<
    NftCollectionsByContractAddressesQuery,
    NftCollectionsByContractAddressesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<
    NftCollectionsByContractAddressesQuery,
    NftCollectionsByContractAddressesQueryVariables
  >(NftCollectionsByContractAddressesDocument, options)
}
export function useNftCollectionsByContractAddressesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    NftCollectionsByContractAddressesQuery,
    NftCollectionsByContractAddressesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<
    NftCollectionsByContractAddressesQuery,
    NftCollectionsByContractAddressesQueryVariables
  >(NftCollectionsByContractAddressesDocument, options)
}
export type NftCollectionsByContractAddressesQueryHookResult = ReturnType<
  typeof useNftCollectionsByContractAddressesQuery
>
export type NftCollectionsByContractAddressesLazyQueryHookResult = ReturnType<
  typeof useNftCollectionsByContractAddressesLazyQuery
>
export type NftCollectionsByContractAddressesQueryResult = Apollo.QueryResult<
  NftCollectionsByContractAddressesQuery,
  NftCollectionsByContractAddressesQueryVariables
>
export const NftCollectionSearchAssetDocument = gql`
  query NftCollectionSearchAsset($collectionId: ID!, $search: String!) {
    nftCollectionSearchAsset(collectionId: $collectionId, search: $search) {
      id
      assetContractAddress
      tokenID
      imageUrl
      imagePreviewUrl
      imageThumbnailUrl
      imageOriginalUrl
      animationUrl
      animationOriginalUrl
      backgroundColor
      name
      owner
      orderPrice
      nftAssetContract {
        id
        address
        name
        totalSupply
        imageUrl
      }
      orderPriceMarket
    }
  }
`

/**
 * __useNftCollectionSearchAssetQuery__
 *
 * To run a query within a React component, call `useNftCollectionSearchAssetQuery` and pass it any options that fit your needs.
 * When your component renders, `useNftCollectionSearchAssetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNftCollectionSearchAssetQuery({
 *   variables: {
 *      collectionId: // value for 'collectionId'
 *      search: // value for 'search'
 *   },
 * });
 */
export function useNftCollectionSearchAssetQuery(
  baseOptions: Apollo.QueryHookOptions<
    NftCollectionSearchAssetQuery,
    NftCollectionSearchAssetQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useQuery<
    NftCollectionSearchAssetQuery,
    NftCollectionSearchAssetQueryVariables
  >(NftCollectionSearchAssetDocument, options)
}
export function useNftCollectionSearchAssetLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    NftCollectionSearchAssetQuery,
    NftCollectionSearchAssetQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions }
  return Apollo.useLazyQuery<
    NftCollectionSearchAssetQuery,
    NftCollectionSearchAssetQueryVariables
  >(NftCollectionSearchAssetDocument, options)
}
export type NftCollectionSearchAssetQueryHookResult = ReturnType<
  typeof useNftCollectionSearchAssetQuery
>
export type NftCollectionSearchAssetLazyQueryHookResult = ReturnType<
  typeof useNftCollectionSearchAssetLazyQuery
>
export type NftCollectionSearchAssetQueryResult = Apollo.QueryResult<
  NftCollectionSearchAssetQuery,
  NftCollectionSearchAssetQueryVariables
>
