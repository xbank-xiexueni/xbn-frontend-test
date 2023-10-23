import useRequest from 'ahooks/lib/useRequest'
import { useMemo } from 'react'

import { useAssetSimpleLazyQuery } from '@/hooks'

type MaybeRenderProp<P> = React.ReactNode | ((props: P) => React.ReactNode)

type NftInfoComponentProps = {
  contractAddress: string
  tokenId: string
  children: MaybeRenderProp<{
    img: string
    loading: boolean
    name: string
  }>
}

/* eslint-disable */
const isFunction = <T extends Function = Function>(value: any): value is T =>
  typeof value === 'function'

function runIfFn<T, U>(
  valueOrFn: T | ((...fnArgs: U[]) => T),
  ...args: U[]
): T {
  return isFunction(valueOrFn) ? valueOrFn(...args) : valueOrFn
}

const NftInfoComponent: (p: NftInfoComponentProps) => JSX.Element = ({
  contractAddress,
  tokenId,
  children,
}) => {
  const [run] = useAssetSimpleLazyQuery()
  const { data, loading } = useRequest(
    () =>
      run({
        variables: {
          assetContractAddress: contractAddress,
          assetTokenId: tokenId,
        },
      }),
    {
      ready: !!contractAddress && !!tokenId,
      cacheKey: `nft-detail-${contractAddress}-${tokenId}`,
      staleTime: 10 * 60 * 1000,
    },
  )

  const result = useMemo(() => {
    if (!data?.data?.asset)
      return {
        img: '',
        name: '',
      }
    const {
      data: {
        asset: { imagePreviewUrl, name, tokenID },
      },
    } = data
    return {
      img: imagePreviewUrl,
      name: name || (tokenID ? `#${tokenID}` : '--'),
    }
  }, [data])
  return (
    <>
      {runIfFn(children, {
        loading,
        ...result,
      })}
    </>
  )
}

export default NftInfoComponent
