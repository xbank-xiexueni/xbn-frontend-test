import BigNumber from 'bignumber.js'

const wei2Eth: (
  wei?: BigNumber | number | string | bigint,
) => number | undefined = (wei) => {
  try {
    if (wei === undefined) return
    let weiStr = wei
    if (BigNumber.isBigNumber(weiStr)) {
      weiStr = weiStr.integerValue().toFormat().replaceAll(',', '')
    } else {
      weiStr = wei.toString()
    }

    return BigNumber(weiStr).dividedBy(BigNumber(10).pow(18)).toNumber()
  } catch (error) {
    console.log('🚀 ~ file: unit-conversion.ts:16 ~ wei2Eth ~ error:', error)
    return
  }
}

const eth2Wei: (eth?: number | string | bigint) => number | undefined = (
  eth,
) => {
  try {
    if (eth === undefined) return
    const ethStr = eth.toString()
    return BigNumber(ethStr).multipliedBy(BigNumber(10).pow(18)).toNumber()
  } catch (error) {
    console.log('🚀 ~ file: unit-conversion.ts:26 ~ eth2Wei ~ error:', error)
    return
  }
}

export { wei2Eth, eth2Wei }
