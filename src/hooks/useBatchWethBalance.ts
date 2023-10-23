import isEmpty from 'lodash-es/isEmpty'
import { useMemo } from 'react'
import { useContractReads } from 'wagmi'

import { WETH_CONTRACT_ABI, WETH_CONTRACT_ADDRESS } from '@/constants'

/**
 * 获取每个 pool 的 owner_address 的最新 weth 资产
 *
 * @param addressArr address 数组
 * @returns
 */
const useBatchWethBalance = (addressArr?: string[]) => {
  const uniqAddress = useMemo(() => {
    if (!addressArr || isEmpty(addressArr)) return []

    return [...new Set([...addressArr])]
  }, [addressArr])

  const configs: any = useMemo(() => {
    return uniqAddress.map((i) => {
      return {
        address: WETH_CONTRACT_ADDRESS as `0x${string}`,
        abi: [WETH_CONTRACT_ABI.find((item) => item.name === 'balanceOf')],
        args: [i as `0x${string}`],
        functionName: 'balanceOf',
      }
    })
  }, [uniqAddress])

  const { data, ...rest } = useContractReads({
    contracts: configs,
    enabled: configs && !isEmpty(configs),
    allowFailure: true,
  })

  const _data = useMemo(() => {
    if (!data || isEmpty(data) || isEmpty(uniqAddress)) return
    const wethMap = new Map()
    data.forEach((item: any, i: number) => {
      if (item.status === 'failure') return
      wethMap.set(uniqAddress[i], item.result.toString())
    })
    return wethMap
  }, [data, uniqAddress])

  return { data: _data, ...rest }
}

export default useBatchWethBalance
