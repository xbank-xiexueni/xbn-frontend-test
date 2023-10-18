import axios from 'axios'

import { AXIOS_DEFAULT_CONFIG, requestInterceptor } from 'utils/request'
import requestToken from 'utils/requestToken'
const request = axios.create(AXIOS_DEFAULT_CONFIG)
request.interceptors.request.use(requestInterceptor)
request.interceptors.response.use((resp) => resp?.data)
export const apiGetBanBanMissionStatus: () => Promise<any> = () => {
  return request.get('/api/v1/xbn/banbanMissionStatus')
}
export const apiClaimBanBanPassCard: () => Promise<{ status: string }> = () => {
  const token = requestToken()
  if (!token) {
    return Promise.reject({
      code: 'unauthenticated',
      message: 'token is expired',
    })
  }
  return request.post('/api/v1/xbn/claimBanbanPassCard')
}

export const apiBanbanStats: () => Promise<{
  remaining?: {
    daily_supply_nft?: number // "daily_banban_nft" -> "daily_supply_nft"
    total_pass_cards?: number
  }
}> = () => {
  return request.get('lending/api/v1/campaigns/banban/stats')
}
