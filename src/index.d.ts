type NftCollection = Node & {
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

interface XBNCollectionItemType extends CollectionListItemType {
  contractAddress: string
  nftCollection: NftCollection
}

type AccountType = {
  address: string
  expires: string
  token: string
}

type ConnectArgs = {
  /** Chain ID to connect to */
  chainId?: number
  /** Connector to connect */
  connector: Connector
}

type FetchBalanceResult = {
  decimals: number
  formatted: string
  symbol: string
  value: bigint
}

declare module 'viem'

declare module 'api' {
  type apiGetActiveCollection = any;
  type apiGetPools = any;
  type apiGetWalletMetaData = any;
}