import useRequest from 'ahooks/lib/useRequest'
import bigNumber from 'bignumber.js'
import { compact } from 'lodash'
import { useMemo, type DependencyList } from 'react'

import { apiGetNotice } from 'api'
import type { NoticeItemType } from 'components/notice-slider/NoticeSlider'
import { NotificationType } from 'constants/index'

import useWallet from './useWallet'

type OptionType = {
  ready?: boolean
  refreshDeps?: DependencyList
  manual?: boolean
}
const useNotice = (
  address: string,
  { ready = true, refreshDeps, manual = false }: OptionType,
) => {
  // const navigate = useNavigate()
  const { handleDisconnect } = useWallet()

  const { data, loading, refresh, ...rest } = useRequest(
    () =>
      apiGetNotice({
        wallet_address: address,
      }),
    {
      ready,
      refreshDeps,
      manual,
      debounceWait: 100,
      onError: (error: any) => {
        if (error.code === 'unauthenticated') {
          handleDisconnect()
        }
      },
    },
  )
  const formatData: NoticeItemType[] | undefined = useMemo(() => {
    if (!data) return
    return compact(
      data?.map(({ type, left_time, sum }) => {
        switch (type) {
          case NotificationType.loan_repayment:
            let formatTime = ''
            if (left_time && left_time > 24) {
              formatTime = `${bigNumber(left_time)
                .dividedBy(24)
                .toFormat(bigNumber.ROUND_UP)} days`
            } else {
              formatTime = `${left_time} hours`
            }
            return {
              title: `You have ${sum} loan that is due in ${formatTime}, remember to repay`,
              button: 'See Now',
              link: '/loans',
              type,
            }
          case NotificationType.loan_in_generating:
            return {
              title: `You have ${sum} loans in the process of being generated`,
              button: 'View Details',
              link: '/history',
              type,
            }

          default:
            return
        }
      }),
    )
  }, [data])
  return {
    data: formatData,
    loading,
    refresh,
    ...rest,
  }
}

export default useNotice
