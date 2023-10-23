import axios from 'axios'

import { AXIOS_DEFAULT_CONFIG, requestInterceptor } from '@/utils/request'
import requestToken from '@/utils/requestToken'
const request = axios.create(AXIOS_DEFAULT_CONFIG)
request.interceptors.request.use(requestInterceptor)
request.interceptors.response.use((resp) => resp?.data)
export const apiGetBoxes: () => Promise<{
  box_bronze?: number
  box_diamond?: number
  box_gold?: number
  box_platinum?: number
  box_silver?: number
}> = () => {
  const token = requestToken()
  if (!token) {
    return Promise.reject({
      code: 'unauthenticated',
      message: 'token is expired',
    })
  }
  return request.get('/api/v1/xbn/user/box')
}

export const apiGetInviteCode: () => Promise<{ code: string }> = () => {
  const token = requestToken()
  if (!token) {
    return Promise.reject({
      code: 'unauthenticated',
      message: 'token is expired',
    })
  }
  return request.get('/api/v1/xbn/user/invite-code')
}

// 检测用户是否在 galxe 平台上完成任务 /api/v1/xbn/user/galxe/status
export const apiGalxeStatus: () => Promise<{ status: boolean }> = () => {
  const token = requestToken()
  if (!token) {
    return Promise.reject({
      code: 'unauthenticated',
      message: 'token is expired',
    })
  }
  return request.get('/api/v1/xbn/user/galxe/status')
}

// 检测用户是否在我们平台获取该奖励 /api/v1/xbn/user/galxe/reward-exists
export const apiRewardExists: () => Promise<{ status: boolean }> = () => {
  const token = requestToken()
  if (!token) {
    return Promise.reject({
      code: 'unauthenticated',
      message: 'token is expired',
    })
  }
  return request.get('/api/v1/xbn/user/galxe/reward-exists')
}

// 如果用户完成了任务，且没有在我们平台激活奖励，可以直接调用该接口激活阳光普照奖励 /api/v1/xbn/user/galxe/redeem
export const apiGalxeRedeem: () => Promise<any> = () => {
  const token = requestToken()
  if (!token) {
    return Promise.reject({
      code: 'unauthenticated',
      message: 'token is expired',
    })
  }
  return request.post('/api/v1/xbn/user/galxe/redeem')
}

// 获取盒子排行榜
export const apiGetRanking: () => Promise<{
  data: RankDataType
}> = () => {
  // const token = requestToken()
  // if (!token) {
  //   return Promise.reject({
  //     code: 'unauthenticated',
  //     message: 'token is expired',
  //   })
  // }
  return request.get('/api/v1/xbn/ranking')
}
