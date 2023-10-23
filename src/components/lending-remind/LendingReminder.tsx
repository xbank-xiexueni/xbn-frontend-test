import {
  Box,
  Button,
  Flex,
  useToast,
  type ToastId,
  type FlexProps,
} from '@chakra-ui/react'
import useLocalStorageState from 'ahooks/lib/useLocalStorageState'
import BigNumber from 'bignumber.js'
import dayjs from 'dayjs'
import isEmpty from 'lodash-es/isEmpty'
import max from 'lodash-es/max'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useContractWrite, useWaitForTransaction } from 'wagmi'

import imgLendingReminder from '@/assets/lending-reminder.png'
import imgLowAllowance from '@/assets/low-allowance.png'
import {
  ACCOUNT_MODAL_TAB_KEY,
  MIN_LOAN_COUNT,
  WETH_CONTRACT_ABI,
  WETH_CONTRACT_ADDRESS,
  XBANK_CONTRACT_ADDRESS,
} from '@/constants'
import { useWallet } from '@/hooks'
import { formatWagmiErrorMsg } from '@/utils/format'
import { eth2Wei, wei2Eth } from '@/utils/unit-conversion'

import { CustomCheckBox, SvgComponent } from '..'

import ActionCard from './ActionCard'
import ReminderWrapper from './ReminderWrapper'
import TitleWithImage from './TitleWithImage'

enum STEP_ENUM {
  SUMMARY = 'SUMMARY',
  ALLOWANCE = 'Allowance',
  WETH = 'WETH',
  LOW_ALLOWANCE = 'LOW Allowance',
}

const WRAPPER_PROPS: FlexProps = {
  direction: 'column',
  w: '340px',
  boxShadow: 'var(--chakra-shadows-default)',
  borderRadius: 8,
  bg: 'white',
  py: '32px',
  px: '10px',
  alignItems: 'center',
}

const LendingRemind = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [lastReadTime, setLastReadTime] = useLocalStorageState<number>(
    'lending-reminder-timestamp',
  )
  const [isReject24h, setIsReject24h] = useState(false)

  const toast = useToast()

  const toastIdRef = useRef<ToastId>()

  const [step, setStep] = useState<STEP_ENUM>(STEP_ENUM.SUMMARY)

  const {
    myPoolsConfig: { data: pools, refresh: runPoolsAsync },
    collectionList,
    isConnected,
    chainEnable,
    accountModalConfig: { onOpen },
    accountConfig: {
      wethConfig: {
        data: wethData,
        // loading: wethLoading,
        refreshAsync: refreshWethData,
      },
      allowanceConfig: {
        data: allowanceData,
        loading: allowanceLoading,
        refreshAsync: refreshAllowanceData,
      },
    },
  } = useWallet()

  const poolList = useMemo(() => {
    if (!pools) return
    if (!pools?.length) return []
    return pools?.map(
      ({
        collateral_contract,
        max_collateral_factor,
        supply_cap,
        supply_used = 0,
      }) => {
        const nftCollection = collectionList.find(
          (i) =>
            i.contractAddress.toLowerCase() ===
            collateral_contract.toLowerCase(),
        )?.nftCollection
        const poolAvailable = BigNumber(supply_cap).minus(supply_used)
        return {
          collateral_contract,
          name: nftCollection?.name,
          safelistRequestStatus: nftCollection?.safelistRequestStatus,
          imagePreviewUrl: nftCollection?.imagePreviewUrl,
          supplyCaps: wei2Eth(poolAvailable.lt(0) ? 0 : poolAvailable) ?? 0,
          requiredAmount:
            BigNumber(nftCollection?.nftCollectionStat.floorPrice)
              .multipliedBy(BigNumber(max_collateral_factor).dividedBy(10000))
              .multipliedBy(MIN_LOAN_COUNT)
              .toNumber() ?? 0,
        }
      },
    )
  }, [pools, collectionList])

  const lowAllowancePools = useMemo(() => {
    if (!poolList || !poolList.length) return []
    if (!allowanceData) return poolList
    const allowanceEth = wei2Eth(allowanceData)

    if (allowanceEth === undefined) return []
    return poolList.filter((i) => BigNumber(i.requiredAmount).gt(allowanceEth))
  }, [poolList, allowanceData])

  const lowWethPools = useMemo(() => {
    if (!poolList || !poolList.length) return []
    const weth = wei2Eth(wethData)
    if (!weth) return poolList
    return poolList.filter((i) => BigNumber(i.requiredAmount).gt(weth))
  }, [poolList, wethData])

  const totalNeededAllowance = useMemo(() => {
    if (!poolList || isEmpty(poolList)) return
    return poolList.reduce((sum, i) => sum.plus(i.requiredAmount), BigNumber(0))
  }, [poolList])

  const totalNeededWeth = useMemo(() => {
    if (!poolList || isEmpty(poolList)) return
    return poolList.reduce((sum, i) => sum.plus(i.supplyCaps), BigNumber(0))
  }, [poolList])

  const reminders = useMemo(() => {
    if (!chainEnable) return []
    const res = []
    if (!isEmpty(lowAllowancePools)) {
      res.push({
        name: STEP_ENUM.ALLOWANCE,
        data: lowAllowancePools,
      })
    }
    if (!isEmpty(lowWethPools)) {
      res.push({
        name: STEP_ENUM.WETH,
        data: lowWethPools,
      })
    }
    return res
  }, [lowAllowancePools, lowWethPools, chainEnable])

  const onRefresh = useCallback(() => {
    setStep(STEP_ENUM.SUMMARY)
    if (!isConnected) return
    setTimeout(() => {
      runPoolsAsync()
      refreshAllowanceData()
      refreshWethData()
    }, 1000)
  }, [refreshWethData, refreshAllowanceData, runPoolsAsync, isConnected])

  useEffect(() => {
    if (!!onRefresh && !!isConnected && !!location?.pathname) onRefresh()
  }, [location?.pathname, onRefresh, isConnected])

  const maxWeth = useMemo(
    () => eth2Wei(max([...lowAllowancePools.map((i) => i.requiredAmount)])),
    [lowAllowancePools],
  )

  const {
    writeAsync: runApproveAsync,
    data: approveData,
    isLoading: isWriteApproveLoading,
  } = useContractWrite({
    address: WETH_CONTRACT_ADDRESS,
    abi: [WETH_CONTRACT_ABI.find((i) => i.name === 'approve')],
    functionName: 'approve',
    onError: (err: any) => {
      toast({
        status: 'error',
        title: formatWagmiErrorMsg(err?.cause?.message),
        duration: 3000,
      })
    },
  })
  const { isLoading: isWaitApproveLoading } = useWaitForTransaction({
    hash: approveData?.hash,
    async onSuccess() {
      toast({
        status: 'success',
        title: 'approve successfully.',
      })
      const latestAllowance = await refreshAllowanceData()
      if (BigNumber(latestAllowance).lt(maxWeth ?? 0)) {
        setStep(STEP_ENUM.LOW_ALLOWANCE)
      } else {
        onRefresh()
      }
    },
  })
  const approveLoading = useMemo(() => {
    return isWaitApproveLoading || isWriteApproveLoading
  }, [isWaitApproveLoading, isWriteApproveLoading])

  const handleApprove = useCallback(() => {
    if (!maxWeth) return
    try {
      runApproveAsync?.({
        args: [XBANK_CONTRACT_ADDRESS as `0x${string}`, BigInt(maxWeth || 0)],
      })
    } catch (error: any) {
      toast({
        status: 'error',
        title: formatWagmiErrorMsg(error?.cause?.message),
      })
      console.log(
        '🚀 ~ file: LendingReminder.tsx:226 ~ handleApprove ~ error:',
        error,
      )
    }
  }, [runApproveAsync, maxWeth, toast])

  const lendingToast = useToast({
    position: 'top-right',
    duration: null,
    id: 'lending-reminder',
  })

  const renderFn = useCallback(() => {
    switch (step) {
      case STEP_ENUM.SUMMARY:
        return (
          <Flex {...WRAPPER_PROPS}>
            <TitleWithImage
              imageProps={{
                src: imgLendingReminder,
              }}
              title='You may not be able to offer more loans soon due to below issue'
            />

            <Box
              mt='32px'
              mb='16px'
              w='100%'>
              {reminders?.map((item, index) => (
                <ActionCard
                  key={JSON.stringify(item)}
                  name={item.name}
                  index={index}
                  onClick={() => setStep(item.name)}
                />
              ))}
            </Box>

            <Button
              w='200px'
              h='40px'
              variant={'primary'}
              onClick={() => {
                if (isReject24h) {
                  setLastReadTime(dayjs(new Date()).unix() + 24 * 60 * 60)
                } else {
                  setLastReadTime(dayjs(new Date()).unix() + 60 * 60)
                }
                lendingToast.closeAll()
              }}>
              GOT IT
            </Button>
            <CustomCheckBox
              value={isReject24h}
              onToggle={(v) => setIsReject24h(v)}>
              Don&apos;t Remind Me Today
            </CustomCheckBox>
          </Flex>
        )
      case STEP_ENUM.ALLOWANCE:
        return (
          <ReminderWrapper
            title='Allowance Reminder'
            closeable
            onClose={() => setStep(STEP_ENUM.SUMMARY)}
            description={{
              query: ['cannot', 'decreases', `won't renew`, 'must update'],
              link: {
                text: 'Read More',
                uri: `${process.env.REACT_APP_DOCS_URL}/~/changes/xNBa1UTDe3cFb6VrsAMh/fundamentals/lending-q-and-a`,
              },
              text: `Authorize an allowance to enable lending. Each loan decreases allowance. It won't renew automatically, You must update the allowance to lend more.`,
            }}
            balanceData={[
              {
                label: 'Current Allowance',
                balance: wei2Eth(allowanceData),
              },
              {
                label: 'The amount required to support all collection pools',
                balance: totalNeededAllowance?.toNumber(),
              },
            ]}
            poolConfig={{
              title:
                'The pools below require more allowance to support at least 3 loans.',
              data: lowAllowancePools,
              onViewMore: () => navigate('/lending/my-pools'),
            }}
            buttonConfig={{
              title: ' Set Allowance',
              onClick: handleApprove,
              isLoading: approveLoading || allowanceLoading,
            }}
            {...WRAPPER_PROPS}
          />
        )

      case STEP_ENUM.WETH:
        return (
          <ReminderWrapper
            title='WETH Reminder'
            closeable
            onClose={() => setStep(STEP_ENUM.SUMMARY)}
            balanceData={[
              {
                label: 'Current WETH Balance',
                balance: wei2Eth(wethData),
              },
              {
                label: 'for supporting all supply caps',
                balance: totalNeededWeth?.toNumber(),
              },
            ]}
            poolConfig={{
              title:
                'The pools below require more WETH Balance to support at least 3 loans.',
              data: lowWethPools,
              onViewMore: () => navigate('/lending/my-pools'),
            }}
            buttonConfig={{
              title: 'Swap More',
              onClick: () => {
                lendingToast.closeAll()
                onOpen(ACCOUNT_MODAL_TAB_KEY.SWAP_TAB)
              },
              isLoading: allowanceLoading,
            }}
            {...WRAPPER_PROPS}
          />
        )
      case STEP_ENUM.LOW_ALLOWANCE:
        return (
          <Flex
            {...WRAPPER_PROPS}
            px='44px'>
            <Flex
              w='100%'
              justify={'flex-end'}>
              <SvgComponent
                svgId='icon-close'
                onClick={() => {
                  setStep(STEP_ENUM.ALLOWANCE)
                }}
                cursor={'pointer'}
              />
            </Flex>

            <TitleWithImage
              imageProps={{
                src: imgLowAllowance,
                mb: '16px',
              }}
              textProps={{
                fontSize: '16px',
                textTransform: 'capitalize',
              }}
              title='The allowance you set is still insufficient to provide at least three Loans for all collection pools.'
            />
            <Flex
              alignItems={'center'}
              justify={'center'}
              w='100%'
              mt='24px'>
              <Button
                w='240px'
                h='40px'
                variant={'primary'}
                onClick={handleApprove}
                isLoading={approveLoading || allowanceLoading}>
                Set New Allowance
              </Button>
            </Flex>
          </Flex>
        )
      default:
        return null
    }
  }, [
    step,
    handleApprove,
    approveLoading,
    allowanceLoading,
    wethData,
    lendingToast,
    isReject24h,
    allowanceData,
    onOpen,
    reminders,
    setLastReadTime,
    totalNeededAllowance,
    totalNeededWeth,
    lowAllowancePools,
    lowWethPools,
    navigate,
  ])

  const handleToast = useCallback(() => {
    if (isEmpty(reminders)) {
      lendingToast.closeAll()
      return
    }
    const currentToast = toastIdRef.current
    setLastReadTime(undefined)
    if (!lendingToast.isActive('lending-reminder')) {
      console.log(1)
      setStep(STEP_ENUM.SUMMARY)

      toastIdRef.current = lendingToast({
        render: renderFn,
      })
    } else {
      if (currentToast) {
        console.log(2)
        lendingToast.update(currentToast, {
          render: renderFn,
        })
      } else {
        console.log(3)

        lendingToast.closeAll()
        toastIdRef.current = lendingToast({
          render: renderFn,
        })
      }
    }
  }, [lendingToast, reminders, toastIdRef, renderFn, setLastReadTime])

  useEffect(() => {
    if (!lastReadTime) {
      handleToast()
    } else {
      if (dayjs(new Date()).unix() - lastReadTime > 0) {
        handleToast()
      } else {
        lendingToast.closeAll()
      }
    }
  }, [handleToast, lendingToast, lastReadTime])

  return null
}

export default LendingRemind
