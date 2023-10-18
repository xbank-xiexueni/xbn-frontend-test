import request from 'utils/request'
import requestToken from 'utils/requestToken'

export const apiGetActiveCollection: () => Promise<
  CollectionListItemType[]
> = async (params?: any) => {
  return await request.get('/lending/api/v1/nft/collections ', {
    params,
  })
}

export const apiGetPools: (query: {
  collateral_contract?: string
  owner?: string
}) => Promise<PoolsListItemType[]> = async (query) => {
  return await request.get(`/lending/api/v1/pools`, {
    params: query,
  })
}

export const apiGetLoans: (query: {
  lender?: string
  borrower?: string
  collateral_contract?: string
  token_id?: string
}) => Promise<LoanListItemType[]> = async (params) => {
  return await request.get('/lending/api/v1/loans', {
    params,
  })
}

export const apiGetFloorPrice: (query: {
  slug: string
}) => Promise<number> = async (params) => {
  const floorPriceData = (await request.get('/api/v1/xbn/marketFloorPrice', {
    params: {
      ...params,
      mode:
        process.env.REACT_APP_CURRENT_ENV !== 'PRODUCTION' ? 'dev' : undefined,
    },
  })) as {
    floor_price: number
  }
  return floorPriceData?.floor_price
}

export const apiGetPoolPoints: (params: {
  contract_address: string
}) => Promise<{
  percent: number[]
}> = async (params) => {
  return await request.get(`/api/v1/xbn/poolPoints`, {
    params: {
      ...params,
      mode:
        process.env.REACT_APP_CURRENT_ENV !== 'PRODUCTION' ? 'dev' : undefined,
    },
  })
}

export const apiGetCollectionFees: (query: {
  slug: string
}) => Promise<CollectionFeesType> = async (params) => {
  return await request.get('/api/v1/xbn/collectionFees', {
    params: {
      ...params,
      mode:
        process.env.REACT_APP_CURRENT_ENV !== 'PRODUCTION' ? 'dev' : undefined,
    },
  })
}

// 请求唯一 nonce
export const apiGetPoolsTypedData: (
  params: PoolsActionData,
) => Promise<TypedDataType> = async (params) => {
  const token = requestToken()
  if (!token) {
    return Promise.reject({
      code: 'unauthenticated',
      message: 'token is expired',
    })
  }
  return await request.get(`/lending/api/v1/pools/typed-data`, {
    params: {
      ...params,
    },
    headers: {
      Authorization: token,
    },
  })
}

// 创建 pool
export const apiPostPool: (data: {
  signature: string
  typed_data: string
}) => Promise<any> = async (data) => {
  const token = requestToken()
  if (!token) {
    return Promise.reject({
      code: 'unauthenticated',
      message: 'token is expired',
    })
  }
  return await request.post(`/lending/api/v1/pools`, data, {
    headers: {
      Authorization: token,
    },
  })
}

// 编辑 pool
export const apiPutPool: (data: {
  signature: string
  // 需要序列化
  typed_data: string
}) => Promise<any> = async (data) => {
  const token = requestToken()
  if (!token) {
    return Promise.reject({
      code: 'unauthenticated',
      message: 'token is expired',
    })
  }
  return await request.put(`/lending/api/v1/pools`, data, {
    headers: {
      Authorization: token,
    },
  })
}
