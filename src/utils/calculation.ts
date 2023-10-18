import BigNumber from 'bignumber.js'
import { find } from 'lodash'
import { findLastIndex } from 'lodash'

import {
  BASE_RATE,
  COLLATERAL_MAP,
  RATE_POWER_VALUES,
  TENOR_MAP,
} from 'constants/interest'
import type { LOAN_DAYS_ENUM } from 'pages/market/NftAssetDetail'

import { wei2Eth } from './unit-conversion'
import { getKeyByValue } from './utils'
/**
 *
 * @param p 贷款本金
 * @param i 每月利率 （年利率 除以 12）
 * @param n 每月利率
 * @returns 每月还款金额
 */
const amortizationCal = (p: number, i: number, n: number) => {
  return (p * (i * Math.pow(1 + i, n))) / (Math.pow(1 + i, n) - 1)
}

const TEST_DATA = [
  {
    principal: BigNumber(24000000000000000),
    offerIr: 1032,
    protocolFeeRate: 50,
    duration_secs: 5184000,
    number_of_installments: 3,
    each_payment: '8090646773452229',
    each_payment_exact: '8090646773452228.729702960441',
    principalForNo1: '7954931704959078',
    interestForNo1: '135715068493151',
    protocolFee: '120000000000000',
  },
  {
    principal: BigNumber(30000000000000000),
    offerIr: 585,
    protocolFeeRate: 50,
    duration_secs: 259200,
    number_of_installments: 1,
    each_payment: '30014424657534247',
    each_payment_exact: '30014424657534246.5753424657534246',
    principalForNo1: '30000000000000000',
    interestForNo1: '14424657534247',
    protocolFee: '150000000000000',
  },
  {
    principal: BigNumber(42000000000000000),
    offerIr: 758,
    protocolFeeRate: 50,
    duration_secs: 1209600,
    number_of_installments: 2,
    each_payment: '21045802593299600',
    each_payment_exact: '21045802593299599.39907667562135',
    principalForNo1: '20984747250833846',
    interestForNo1: '61055342465754',
    protocolFee: '210000000000000',
  },
  {
    principal: BigNumber('11111111111111111'),
    offerIr: 758,
    protocolFeeRate: 50,
    duration_secs: 1209600,
    number_of_installments: 2,
    each_payment: '5567672643730053',
    each_payment_exact: '5567672643730052.6954017591768',
    principalForNo1: '5551520436728530',
    interestForNo1: '16152207001523',
    protocolFee: '55555555555555',
  },
  {
    principal: BigNumber('5555555555555555555'),
    offerIr: 758,
    protocolFeeRate: 50,
    duration_secs: 1209600,
    number_of_installments: 2,
    each_payment: '2783836321865026376',
    each_payment_exact: '2783836321865026375.2608591748',
    principalForNo1: '2775760218364265340',
    interestForNo1: '8076103500761036',
    protocolFee: '27777777777777777',
  },
]

/**
 *
 * @param principal 贷款本金
 * @param interest_rate 年利率
 * @param loan_period_days 贷款期数（以秒为单位） 7 | 14 | 30 | 60 | 90
 * @param x 分 x 期 1 | 2 | 3
 * @returns 每 n 天还款金额
 */
const amortizationCalByDays = (
  principal: BigNumber,
  interest_rate: number,
  loan_period_seconds: LOAN_DAYS_ENUM,
  x: 1 | 2 | 3,
) => {
  if (
    Number.isNaN(principal) ||
    Number.isNaN(interest_rate) ||
    Number.isNaN(loan_period_seconds) ||
    Number.isNaN(x)
  ) {
    return BigNumber(0)
  }
  if (interest_rate === 0) {
    return principal.dividedBy(x)
  }
  const loan_period_days = BigNumber(loan_period_seconds).dividedBy(3600 * 24)
  // installment = loan_period_days / x 表示：每 installment 天还款
  const installment = BigNumber(loan_period_days).dividedBy(x)
  // i = interest_rate / 365 / installment
  const i = BigNumber(interest_rate).dividedBy(365).multipliedBy(installment)
  // n =  loan_period_days / installment
  const n = BigNumber(loan_period_days).dividedBy(installment).integerValue()
  /**
   * return
   * principal * ( i * (1+i)**n ) / ((1+i)**n - 1)
   */
  const iPlus1powN = i.plus(1).pow(n)
  return iPlus1powN
    .multipliedBy(i)
    .dividedBy(iPlus1powN.minus(1))
    .multipliedBy(principal)
}

const calScheduledPaymentTest = () => {
  TEST_DATA.forEach((item) => {
    const prevEachPayment = amortizationCalByDays(
      item.principal,
      item.offerIr / 10000,
      item.duration_secs,
      item.number_of_installments as 1 | 2 | 3,
    )
      .integerValue(BigNumber.ROUND_UP)
      ?.toString()
    console.log(
      'each_payment',
      prevEachPayment,
      item.each_payment,
      prevEachPayment === item.each_payment,
    )
    console.log(
      'diff',
      amortizationCalByDays(
        item.principal,
        item.offerIr / 10000,
        item.duration_secs / 60 / 60 / 24,
        item.number_of_installments as 1 | 2 | 3,
      )?.toString(),
      item.each_payment_exact,
    )
    if (prevEachPayment !== item.each_payment) {
      console.warn(
        'data:',
        amortizationCalByDays(
          item.principal,
          item.offerIr / 10000,
          item.duration_secs / 60 / 60 / 24,
          item.number_of_installments as 1 | 2 | 3,
        )?.toString(),
        '\n',
        'target:',
        item.each_payment_exact,
      )
    }
    console.log('---------------------------------')
  })
}

const computePoolPoint = (score?: BigNumber, pointsData?: number[]) => {
  if (score === undefined) return
  if (!pointsData) return
  // const calculateScore = BigNumber(600)
  // const percent = [
  //   500, 500, 500, 1000, 1000, 1000, 1000, 1000, 1500, 1500, 1500,
  // ]
  // const percent = [500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500]
  // const percent = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  // const percent = [500, 500, 500, 500, 500, 500, 500, 500, 1007, 1009, 1010]

  const index = findLastIndex(pointsData, (i) => score.gte(i))
  if (index === pointsData.length - 1) return 100
  if (index === -1) return 0
  // 1000
  const nextScore = BigNumber(pointsData[index + 1])
  const prevScore = BigNumber(pointsData[index])
  const diff = score.minus(prevScore)
  const rangeDiff = nextScore.minus(prevScore)
  const subPercent = diff.dividedBy(rangeDiff)
  return Number(
    subPercent
      .multipliedBy(10)
      .plus(index * 10)
      .toFixed(2),
  )
}

const getMaxSingleLoanScore = (amount: number, config: Map<number, number>) => {
  const arr = [...config.keys()].reverse()
  for (let i = 0; i < arr.length; i++) {
    if (amount >= arr[i]) {
      return config.get(arr[i])
    }
  }
}
//
const computePoolScore = (
  poolData?: {
    max_collateral_factor: number
    single_cap: string
    max_tenor: number
    max_interest_rate: number
    collateral_factor_multiplier: number
    tenor_multiplier: number
  },
  configData?: ConfigDataType,
  floorPrice?: number,
) => {
  if (!floorPrice) return
  if (!poolData) return
  if (!configData) return
  const {
    weight: { x, y, z, w, u, v },
    loan_ratio,
    loan_term,
    // 贷款期限微调 bottom
    loan_term_adjustment_factor,
    // 贷款比例微调 right
    loan_ratio_adjustment_factor,
    max_loan_interest_rate,
    max_loan_amount,
  } = configData

  const {
    max_collateral_factor,
    single_cap,
    max_tenor,
    max_interest_rate,
    collateral_factor_multiplier,
    tenor_multiplier,
  } = poolData

  const maxSingleLoanEth = wei2Eth(single_cap) || 0

  const collateralKey =
    getKeyByValue(COLLATERAL_MAP, max_collateral_factor) ?? 4
  const tenorKey = getKeyByValue(TENOR_MAP, max_tenor) ?? 5

  const cKey = `${tenorKey}-${collateralKey}`
  const defaultRate = BigNumber(BASE_RATE.get(cKey) as number)
  const interestRank =
    (find(RATE_POWER_VALUES, (element) => {
      return (
        defaultRate.multipliedBy(element).toFixed(0, BigNumber.ROUND_UP) ===
        max_interest_rate.toString()
      )
    }) || -1) * 10000

  const maxLoanAmountMap: Map<number, number> = new Map()
  max_loan_amount.forEach(({ key, value }) => {
    const [start] = key.split('-')
    maxLoanAmountMap.set(Number(start) / 10000, value)
  })

  // 贷款比例分数
  const collateralScore = BigNumber(
    loan_ratio.find((i) => i.key === max_collateral_factor.toString())?.value ||
    0,
  ).multipliedBy(x)

  // 单笔最大贷款金额分数
  const maxLoanAmountScore = BigNumber(
    getMaxSingleLoanScore(
      BigNumber(maxSingleLoanEth).dividedBy(floorPrice).toNumber(),
      maxLoanAmountMap,
    ) || 0,
  ).multipliedBy(y)

  // 贷款期限分数
  const tenorScore = BigNumber(
    loan_term.find((i) => i.key == (max_tenor / 3600 / 24).toString())?.value ||
    0,
  ).multipliedBy(z)

  const maxInterestScore = BigNumber(
    max_loan_interest_rate.find((i) => i.key === interestRank?.toString())
      ?.value || 0,
  ).multipliedBy(w)

  // 按贷款比例微调分数
  const ratioScore = BigNumber(
    loan_ratio_adjustment_factor.find(
      (i) => i.key === collateral_factor_multiplier.toString(),
    )?.value || 0,
  ).multipliedBy(u)

  // 按贷款期限微调分数
  const termScore = BigNumber(
    loan_term_adjustment_factor.find(
      (i) => i.key === tenor_multiplier.toString(),
    )?.value || 0,
  ).multipliedBy(v)

  return collateralScore
    .plus(maxLoanAmountScore)
    .plus(tenorScore)
    .plus(maxInterestScore)
    .plus(ratioScore)
    .plus(termScore)
}

export {
  amortizationCal,
  amortizationCalByDays,
  computePoolPoint,
  getMaxSingleLoanScore,
  computePoolScore,
  calScheduledPaymentTest,
}
