import { type ContainerProps } from '@chakra-ui/react'
import { useState } from 'react'

import { LenderGuideModal } from 'components'
import NewlyRichRewardsDialog from 'components/NewlyRichRewardsDialog'
import { useGuide } from 'hooks'

import RootLayout from './RootLayout'

const LendLayout: React.FC<ContainerProps> = ({ children, ...rest }) => {
  const [dialogVisible, setDialogVisible] = useState(false)
  const { isOpen: guideVisible, onClose: closeGuide } = useGuide({
    key: 'has-read-lp-guide',
  })
  return (
    <RootLayout {...rest}>
      <NewlyRichRewardsDialog
        dialogVisible={dialogVisible}
        setDialogVisible={setDialogVisible}
      />
      <LenderGuideModal
        isOpen={guideVisible}
        onClose={() => {
          closeGuide()
          if (typeof window !== 'undefined') {
            if (
              window.localStorage.getItem('newly-dialog-disabled') !== 'true'
            ) {
              setDialogVisible(true)
            }
          }
        }}
      />
      {children}
    </RootLayout>
  )
}

export default LendLayout
