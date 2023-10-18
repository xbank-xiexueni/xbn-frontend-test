import BigNumber from 'bignumber.js'

import { FORMAT_NUMBER } from 'constants/index'

import { eth2Wei, wei2Eth } from './unit-conversion'

// Captures 0x + 4 characters, then the last 4 characters.
const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/

/**
 * Truncates an ethereum address to the format 0x0000…0000
 * @param address Full address to truncate
 * @returns Truncated address
 */
const formatAddress = (address?: string) => {
  if (!address) return ''
  const match = address.match(truncateRegex)
  if (!match) return address
  return `${match[1]}…${match[2]}`
}
const getFullNum = (num: number) => {
  //处理非数字
  if (isNaN(num)) {
    return num
  }

  //处理不需要转换的数字
  const str = '' + num
  if (!/e/i.test(str)) {
    return num
  }

  return num.toFixed(18).replace(/\.?0+$/, '')
}
const formatFloat = (
  x?: number | string | BigNumber,
  y?: number,
  roundFloor?: boolean,
) => {
  if (x === undefined) return '--'
  if (x === 0) return '0'
  const xx = BigNumber.isBigNumber(x)
    ? x.toNumber()
    : typeof x === 'string'
      ? Number(x)
      : x
  if (isNaN(xx)) return '--'
  if (xx < 0) return '0'
  const yy = y || FORMAT_NUMBER

  const f = Number(
    BigNumber(xx).toFixed(
      yy,
      roundFloor ? BigNumber.ROUND_FLOOR : BigNumber.ROUND_UP,
    ),
  )
  // const f = Math.round(xx * 10 ** yy) / 10 ** yy
  const s = getFullNum(f).toString()
  return s
}

const formatWei = (x?: BigNumber, y?: number) => {
  if (x === undefined) return 0
  return eth2Wei(formatFloat(wei2Eth(x), y || FORMAT_NUMBER))
}

const formatPluralUnit = (x?: number, y?: string, special?: string) => {
  if (x === undefined) return
  if (y === undefined) return
  if (special) return `${x} ${x <= 1 ? y : special}`
  return `${x} ${y}${x <= 1 ? '' : 's'}`
}

const formatBalance = (v?: number) => {
  if (v === undefined) return '--'
  if (v === 0) return '0'
  if (v < 0.0001) return '> 0.0000'
  if (v > 9999) return '> 9999'
  return formatFloat(v, 4, true)
}

// 123e+23 => 123000000.....
const formatBigNum2Str = (v?: number | string) => {
  if (v === undefined) return
  if (BigNumber(v).lt(1)) {
    return getFullNum(BigNumber(v).toNumber())
  }
  return v?.toLocaleString()?.replace(/\$|\,/g, '')
}

const formatWagmiErrorMsg = (v?: string) => {
  if (!v) return
  let i = v.length
  if (v.indexOf('\n') !== -1) {
    i = v.indexOf('\n')
  } else if (v.indexOf('\n\n') !== -1) {
    i = v.indexOf('\n\n')
  } else if (v.indexOf('Version:') !== -1) {
    i = v.indexOf('Version:')
  }

  return v?.substring(0, i)
}

const formatTypedSignData = (prev: TypedDataType) => {
  const formattedDomain = {
    ...prev.domain,
    // 后端规范 0x5, 前端签名规范 5
    chainId: Number(Number(prev.domain.chainId).toString(10)),
  }
  // const uint256MessageTypes = prev.types[prev.primaryType]?.filter(
  //   (i) => i.type === 'uint256',
  // )

  // const formattedMessage: Record<string, number | string> = { ...prev.message }
  // uint256MessageTypes.forEach((i) => {
  //   if (typeof formattedMessage[i.name] !== 'string') {
  //     formattedMessage[i.name] = `${formattedMessage[i.name]}`
  //   }
  // })
  return {
    ...prev,
    domain: formattedDomain,
    primaryType: 'Pool',
    // message: formattedMessage,
  }
}

export {
  formatAddress,
  formatFloat,
  formatWei,
  getFullNum,
  formatPluralUnit,
  formatBalance,
  formatBigNum2Str,
  formatWagmiErrorMsg,
  formatTypedSignData,
}
