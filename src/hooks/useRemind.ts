import { useDisclosure } from '@chakra-ui/react'
import useLocalStorageState from 'ahooks/lib/useLocalStorageState'
import dayjs, { unix } from 'dayjs'
import { useCallback } from 'react'

type OptionType = {
  onFinish?: () => void
}

const useRemind = (key: string, { onFinish }: OptionType) => {
  const [lastReadTime, setLastReadTime] = useLocalStorageState<number>(key)

  const { isOpen, onClose, onOpen } = useDisclosure()

  const onOpenModal = useCallback(() => {
    if (!lastReadTime || dayjs().diff(unix(lastReadTime), 'seconds') > 0) {
      onOpen()
      setLastReadTime(undefined)
    } else {
      onFinish?.()
    }
  }, [lastReadTime, onOpen, onFinish, setLastReadTime])
  const onCloseGuide = useCallback(
    (timestamp?: number) => {
      if (!!timestamp) {
        setLastReadTime(dayjs(new Date()).unix() + timestamp)
      }
      onClose()
      onFinish?.()
    },
    [onClose, setLastReadTime, onFinish],
  )

  return {
    isOpen,
    onClose: onCloseGuide,
    onOpen: onOpenModal,
  }
}

export default useRemind
