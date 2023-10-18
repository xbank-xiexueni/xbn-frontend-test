import { useCountDown } from 'ahooks'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { MiddleStatus } from 'components'
import RootLayout from 'layouts/RootLayout'

const CompleteList = () => {
  const { search } = useLocation()
  const navigate = useNavigate()
  const imgUrl = useMemo(() => {
    return decodeURI(Object.fromEntries(new URLSearchParams(search))?.img || '')
  }, [search])
  const [step, setStep] = useState<'loading' | 'success'>('loading')

  useCountDown({
    leftTime: 5000,
    onEnd: () => {
      setStep('success')
    },
  })
  return (
    <RootLayout>
      <MiddleStatus
        step={step}
        imagePreviewUrl={imgUrl}
        onSuccessBack={() => {
          navigate('/my-assets')
        }}
        successDescription='You need to repay the outstanding loan unless your NFT has been sold'
        successTitle='Listing Completed'
        loadingText=''
      />
    </RootLayout>
  )
}

export default CompleteList
