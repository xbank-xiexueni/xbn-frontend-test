import { Box, Img, Modal, ModalContent, ModalOverlay } from '@chakra-ui/react'

import ImgStartNow from 'assets/btn-start-now.png'
import ImgClose from 'assets/close.png'
import DialogGradient from 'assets/dialog-gradient.png'
import NewlyRichRewardsSubtitle from 'assets/newly-rich-rewards-sub-title.png'
import NewlyRichRewards from 'assets/newly-rich-rewards.png'

const NewlyRichRewardsDialog = (props: {
  dialogVisible: boolean
  setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  return (
    <Modal
      isCentered
      isOpen={props.dialogVisible}
      onClose={() => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('newly-dialog-disabled', 'true')
        }
        props.setDialogVisible(false)
      }}
      size={'auto'}>
      <ModalOverlay />
      <ModalContent
        width={'776px'}
        borderRadius={'10px'}>
        <Box className='newly-rich-rewards-background'>
          <Img
            src={DialogGradient}
            className='border-line'
          />
          <Box
            as='button'
            className='btn-close'
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.localStorage.setItem('newly-dialog-disabled', 'true')
              }
              props.setDialogVisible(false)
            }}
            _focus={{
              border: '0px solid #ddd',
              outline: 'none',
            }}>
            <Img src={ImgClose} />
          </Box>
          <Box
            display={'flex'}
            flexDir={'column'}
            alignItems={'center'}>
            <Img
              position={'relative'}
              width={'640px'}
              src={NewlyRichRewards}
            />
            <Img
              marginTop={'20px'}
              position={'relative'}
              width={'458px'}
              src={NewlyRichRewardsSubtitle}
            />
            <Img
              width={'231px'}
              h={'56px'}
              src={ImgStartNow}
              className='btn-start-now'
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.localStorage.setItem('newly-dialog-disabled', 'true')
                  window.location.pathname = '/newcomer'
                }
              }}
            />
          </Box>
        </Box>
      </ModalContent>
    </Modal>
  )
}

export default NewlyRichRewardsDialog
