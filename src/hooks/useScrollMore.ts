import useScroll from 'ahooks/lib/useScroll'
import { useMemo } from 'react'

type useScrollMoreProps = {
  screenCount?: number
  options?: {
    isReady?: boolean
  }
}
const useScrollMore = ({ screenCount, options }: useScrollMoreProps) => {
  const offsetHeight = useMemo(() => {
    return window.screen.availHeight * (screenCount || 1)
  }, [screenCount])
  const scrollData = useScroll(document, () => !!options?.isReady)
  return {
    isMoreThan: !!scrollData?.top && scrollData?.top >= offsetHeight,
  }
}

export default useScrollMore
