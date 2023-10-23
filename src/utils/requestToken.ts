import dayjs from 'dayjs'
import isEmpty from 'lodash-es/isEmpty'

const requestToken = () => {
  const tokenData = JSON.parse(
    localStorage.getItem('connect-account') || '{}',
  ) as AccountType
  if (
    !tokenData ||
    isEmpty(tokenData) ||
    !tokenData.expires ||
    dayjs().isAfter(dayjs(tokenData.expires))
  ) {
    localStorage.removeItem('connect-account')
    return undefined
  }
  return `Bear ${tokenData?.token}`
}

export default requestToken
