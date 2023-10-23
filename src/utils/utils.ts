// a list for saving subscribed event instances
// const subscribedEvents = {}
import BigNumber from 'bignumber.js'
import range from 'lodash-es/range'

import {
  BASE_RATE,
  RATE_POWER_MAP,
  TERM_POWER_MAP,
  RATIO_POWER_MAP,
  TENOR_VALUES,
} from '@/constants/interest'

const getKeyByValue = (map: any, searchValue: string | number) => {
  for (const [key, value] of map.entries()) {
    if (value === searchValue) return key
  }
}

const uniq = (arr: any[]) => {
  const map = new Map()
  for (const i of arr) {
    const id = JSON.stringify(i)
    if (!map.has(id)) {
      map.set(id, i)
    }
  }
  return [...map.values()]
}

// 基础利率
const getBaseRate = (tenorKey: number, collateralKey: number) => {
  const cKey = `${tenorKey}-${collateralKey}`
  return BigNumber(BASE_RATE.get(cKey) as number)
}

// 基础利率 * power
const getBaseRatePower = (baseRate: BigNumber, interestPowerKey: number) => {
  return baseRate
    .multipliedBy(RATE_POWER_MAP.get(interestPowerKey) as number)
    .integerValue(BigNumber.ROUND_UP)
}

const getBuyerExactInterest = (
  {
    tenor_multiplier,
    max_tenor,
    collateral_factor_multiplier,
    max_interest_rate,
    max_collateral_factor,
  }: PoolsListItemType,
  loanTenor: number,
  loanPercentage: number,
) => {
  const loanBottomPower = tenor_multiplier / 10000
  const bottomDistance =
    TENOR_VALUES.indexOf(max_tenor) - TENOR_VALUES.indexOf(loanTenor)

  const loanRightPower = collateral_factor_multiplier / 10000
  const rightDistance = (max_collateral_factor - loanPercentage) / 1000

  return BigNumber(max_interest_rate)
    .multipliedBy(BigNumber(loanBottomPower).pow(bottomDistance))
    .multipliedBy(BigNumber(loanRightPower).pow(rightDistance))
    .integerValue(BigNumber.ROUND_UP)
    .toNumber()
}

const getLenderTabledInterest = (
  tenorKey: number,
  collateralKey: number,
  interestPowerKey: number,
  tenorMultiplierKey: number,
  collateralFactorMultiplier: number,
) => {
  const baseRate = getBaseRate(tenorKey, collateralKey)
  const baseRatePower = getBaseRatePower(baseRate, interestPowerKey)
  const rowCount = collateralKey + 1
  const colCount = tenorKey + 1
  const arr: BigNumber[][] = new Array(rowCount)
  const sliderBottomValue = TERM_POWER_MAP.get(tenorMultiplierKey) as number
  const sliderRightValue = RATIO_POWER_MAP.get(
    collateralFactorMultiplier,
  ) as number
  for (let i = 0; i < rowCount; i++) {
    const forMapArr = range(colCount)
    arr[i] = forMapArr.map((item) => {
      const powerBottom = colCount - item - 1
      const powerRight = rowCount - i - 1
      const res = baseRatePower
        .multipliedBy(BigNumber(sliderBottomValue).pow(powerBottom))
        .multipliedBy(BigNumber(sliderRightValue).pow(powerRight))
      return res
    })
  }
  return arr
}

export { getKeyByValue, uniq, getLenderTabledInterest, getBuyerExactInterest }
