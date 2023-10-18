import { createStandaloneToast } from '@chakra-ui/react'
import axios, { type InternalAxiosRequestConfig } from 'axios'
import { isEmpty } from 'lodash'

import { TOAST_OPTION_CONFIG } from 'constants/index'
// import { type Request } from 'aws4'
// import { decrypt } from './decrypt'
// import { PWD } from '@consts/crypt'

const {
  MODE,
  REACT_APP_LENDING_BASE_URL,
  REACT_APP_APP_KEY,
  REACT_APP_TEST_BASE_URL,
  REACT_APP_BASE_URL,
} = process.env

export const standaloneToast = createStandaloneToast({
  defaultOptions: {
    ...TOAST_OPTION_CONFIG,
  },
})

const { toast } = standaloneToast
export const AXIOS_DEFAULT_CONFIG = {
  baseURL: '',
  timeout: 20000,
}
const request = axios.create(AXIOS_DEFAULT_CONFIG)

export const requestInterceptor = async ({
  url,
  baseURL,
  ...config
}: InternalAxiosRequestConfig) => {
  let _baseURL = baseURL
  if (MODE !== 'development') {
    if (url?.startsWith('/api/v')) {
      _baseURL = REACT_APP_TEST_BASE_URL
    } else if (url?.startsWith('/lending/query')) {
      _baseURL = REACT_APP_BASE_URL
    } else {
      _baseURL = REACT_APP_LENDING_BASE_URL
    }
  }
  if (!url?.startsWith('/lending/query')) {
    const userToken = JSON.parse(
      localStorage.getItem('connect-account') || '{}',
    )
    config.headers.Authorization = !isEmpty(userToken)
      ? `Bearer ${userToken?.token}`
      : undefined
    config.headers.appkey = REACT_APP_APP_KEY
  }
  return {
    ...config,
    url,
    baseURL: _baseURL,
  }
}
request.interceptors.request.use(requestInterceptor)
request.interceptors.response.use(
  (resp) => {
    return resp?.data
  },
  (e) => {
    console.log(e)
    // 超时提示 axios 超时后, error.code = "ECONNABORTED" (https://github.com/axios/axios/blob/26b06391f831ef98606ec0ed406d2be1742e9850/lib/adapters/xhr.js#L95-L101)
    if (
      (e?.code == 'ECONNABORTED' && e?.message.indexOf('timeout') != -1) ||
      e?.response?.status >= 500
    ) {
      if (!toast.isActive('network-error')) {
        toast({
          title: 'Network problems, please refresh and try again.',
          status: 'error',
          duration: 6000,
          id: `network-error`,
          isClosable: true,
        })
      }

      throw new Error('network error')
    }
    const {
      response: { data },
    } = e
    if (typeof data === 'string') {
      toast({
        title: 'Oops, network error...',
        description: data,
        status: 'error',
        isClosable: true,
        id: 'request-error-toast',
      })
      throw new Error(data)
    }

    throw data
  },
)

export default request
