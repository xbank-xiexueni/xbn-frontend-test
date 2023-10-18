export { }
// import useRequest from 'ahooks/lib/useRequest'
// import compact from 'lodash-es/compact'
// import isEmpty from 'lodash-es/isEmpty'
// import pLimit from 'p-limit'
// import { useCallback } from 'react'

// import { apiGetNftDetail } from 'api'

// import type { NftAsset } from '.'

// const limit = pLimit(10)

// /**
//  * 废弃 💣
//  * 批量请求 nft asset 详情
//  * @param assetParams asset 接口传参 []
//  * @returns
//  */
// const useBatchAsset = (
//   assetParams?: { assetContractAddress: string; assetTokenId: string }[],
// ) => {
//   const batchNftListInfo = useCallback(async () => {
//     let res: NftAsset[] = []
//     const input = assetParams?.map((item) => {
//       return limit(() =>
//         apiGetNftDetail({
//           ...item,
//         }),
//       )
//     })

//     if (!input) return res
//     const result = await Promise.allSettled(input)
//     // @ts-ignore
//     res = compact(result.map((i) => i?.value?.data?.asset))
//     return res
//   }, [assetParams])
//   return useRequest(batchNftListInfo, {
//     ready: !!assetParams && !isEmpty(assetParams),
//   })
// }

// export default useBatchAsset
