import { minBy } from 'lodash'

const getRandomNumber = (min: number, max: number) => {
  if (!window?.crypto) {
    return ~~(Math.random() * max) + min
  }
  const range = max - min + 1
  const randomArray = new Uint32Array(1)
  let randomNumber = 0

  do {
    window.crypto.getRandomValues(randomArray)
    randomNumber = randomArray[0] % range
  } while (randomNumber >= range)

  return min + randomNumber
}

/**
 * exact apr pool
 * @returns minium apr pool
 */
const getMinAPRPool = (
  pools: {
    tenor: number
    lender: string
    apr: number
    offerHash: string
  }[],
  tenor?: number,
) => {
  if (!pools || !pools?.length) {
    return
  }
  if (pools?.length === 1) {
    return pools[0]
  }
  const minData = pools.filter(
    (poolItem) => poolItem.apr === minBy(pools, (i) => i.apr)?.apr,
  )
  const randomIndex = getRandomNumber(0, minData?.length - 1)
  console.log(
    '随机数:',
    randomIndex,
    ';',
    tenor,
    '天随机到',
    minData[randomIndex],
  )
  return minData[randomIndex]
}

export default getMinAPRPool
