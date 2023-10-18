import type { NftCollectionsByContractAddressesQuery } from 'hooks'
import request from 'utils/request'
import requestToken from 'utils/requestToken'

export const apiPostOffers: (data: {
  signature: string
  typed_data: any
  marketplace: string
  floor_price: string
  collateral_price: string
}) => Promise<{
  server_sig: string
  accept_offer_request: AcceptOfferRequestDataType
}> = async (data) => {
  const token = requestToken()
  if (!token) {
    return Promise.reject({
      code: 'unauthenticated',
      message: 'token is expired',
    })
  }
  return await request.post(`/lending/api/v1/offers`, data, {
    headers: {
      Authorization: token,
    },
  })
}

export const apiGetMyAssets: (query: {
  wallet_address?: string
}) => Promise<MyAssetListItemType[]> = async (params) => {
  const isTokenValid = requestToken()
  if (!isTokenValid) {
    return Promise.reject({
      code: 'unauthenticated',
      message: 'token is expired',
    })
  }
  return await request.get(`/lending/api/v1/assets/nfts`, {
    params,
  })
}

export const apiGetCollectionDetail: (variables: {
  assetContractAddresses: string[]
}) => Promise<{
  data: NftCollectionsByContractAddressesQuery
}> = async (variables) => {
  return await request.post(`/lending/query`, {
    operationName: 'NftCollectionsByContractAddresses',
    variables,
    query: `query NftCollectionsByContractAddresses($assetContractAddresses: [String!]!) {\n  nftCollectionsByContractAddresses(\n    assetContractAddresses: $assetContractAddresses\n  ) {\n    contractAddress\n    nftCollection {\n      name\n    safelistRequestStatus\n      slug\n      __typename\n    }\n    __typename\n  }\n}`,
  })
}

export const apiTest: (id: string) => Promise<any> = async (variables) => {
  return await request.post(
    `https://www.fastmock.site/mock/9b1763038152f49675038983b826d34e/api/asset/${variables}`,
  )
}

export const apiPostListing: (data: ListingDataType) => Promise<any> = async (
  data,
) => {
  const token = requestToken()
  if (!token) {
    return Promise.reject({
      code: 'unauthenticated',
      message: 'token is expired',
    })
  }
  return await request.post(`/lending/api/v1/listings`, data, {
    headers: {
      Authorization: token,
    },
  })
}

export const apiGetListings: (query: {
  borrower_address: string
  contract_address?: string
  token_id?: string
  type?: 1 | 2
  status?: 1 | 4096
}) => Promise<ListingsItemType[]> = async (params) => {
  const token = requestToken()
  if (!token) {
    return Promise.reject({
      code: 'unauthenticated',
      message: 'token is expired',
    })
  }
  return await request.get(`/lending/api/v1/listings`, {
    params: {
      ...params,
    },
    headers: {
      Authorization: token,
    },
  })
}

export const apiGetAssetPrice: (query: {
  contract_address: string
  token_id: string
}) => Promise<AssetPriceType> = async (params) => {
  return await request.get('/api/v1/nft/price', {
    params: {
      ...params,
      mode:
        process.env.REACT_APP_CURRENT_ENV !== 'PRODUCTION' ? 'dev' : undefined,
    },
  })
}

export const apiGetConfig: () => Promise<{
  config: ConfigDataType
}> = async () => {
  return await request.get(`/api/v1/xbn/config`)
}

export const apiGetLoanOrder: (query: {
  borrower: string
}) => Promise<LoanOrderItemType[]> = async (data) => {
  const token = requestToken()
  if (!token) {
    return Promise.reject({
      code: 'unauthenticated',
      message: 'token is expired',
    })
  }
  return await request.get(`/lending/api/v1/loan-orders`, {
    params: data,
    headers: {
      Authorization: token,
    },
  })
}

export const apiGetNotice: (params: {
  wallet_address: string
}) => Promise<NotificationsItemType[]> = async (params) => {
  const token = requestToken()
  if (!token) {
    return Promise.reject({
      code: 'unauthenticated',
      message: 'token is expired',
    })
  }
  return await request.get(`/lending/api/v1/notifications`, {
    params,
    headers: {
      Authorization: token,
    },
  })
}

export const apiGetRepayments: (query: {
  borrower: string
}) => Promise<RepaymentItemType[]> = async (data) => {
  const token = requestToken()
  if (!token) {
    return Promise.reject({
      code: 'unauthenticated',
      message: 'token is expired',
    })
  }
  return await request.get(`/lending/api/v1/loans/repayments`, {
    params: data,
    headers: {
      Authorization: token,
    },
  })
}

export const apiGetWalletMetaData: (
  borrower: string,
) => Promise<BanbanMetaDataType> = async (borrower) => {
  const token = requestToken()
  if (!token) {
    return Promise.reject({
      code: 'unauthenticated',
      message: 'token is expired',
    })
  }
  return await request.get(
    `/lending/api/v1/campaigns/banban/buyable/${borrower}`,
    {
      headers: {
        Authorization: token,
      },
    },
  )
}
