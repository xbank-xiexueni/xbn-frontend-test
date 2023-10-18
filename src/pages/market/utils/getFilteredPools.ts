import BigNumber from 'bignumber.js'

const getFilteredPools = (
  loanWeiAmount: BigNumber,
  loanPercentage: number,
  condition: {
    originPoolList: PoolsListItemType[]
    floorPriceWei: number
  },
) => {
  const { originPoolList, floorPriceWei } = condition
  return originPoolList.filter((item) => {
    // 此 pool 创建者最新 weth 资产
    // 此 pool 最新可用资产
    const poolLatestCanUseAmount = BigNumber(item.supply_cap).minus(
      item.supply_used,
    )
    // 单笔最大贷款金额
    const maxSingleLoanAmount = BigNumber(item.single_cap)
    // 三者取较小值用于比较
    /**
     * 1. 该 pool 最新可借出去的钱 pool amount - pool used amount
     * 2. 该 pool 的 owner 最新的 weth 余额
     * 3. 该 pool 最大单笔可贷
     * 4. 该 collection 地板价
     */
    const forCompareWei = BigNumber.minimum(
      poolLatestCanUseAmount,
      BigNumber(item.owner_weth_balance),
      BigNumber(item.owner_weth_allowance),
      maxSingleLoanAmount,
      BigNumber(floorPriceWei),
    )

    return (
      item.max_collateral_factor >= loanPercentage &&
      loanWeiAmount.lte(forCompareWei)
    )
  })
}

export default getFilteredPools
