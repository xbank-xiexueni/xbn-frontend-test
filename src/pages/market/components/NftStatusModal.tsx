import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Button,
  Flex,
  Box,
  Text,
  type ImageProps,
} from '@chakra-ui/react'
import { type FunctionComponent } from 'react'

import { ImageWithFallback, NftTag } from 'components'

export enum NFT_STATUS {
  SOLD_OUT = 'Sold Out',
  NORMAL = 'normal',
  NO_OFFER = 'No Offer',
}
const DESCRIPTION_CONSTANT: Record<string, string> = {
  [NFT_STATUS.SOLD_OUT]:
    'This NFT is sold out. \nPlease go back to select another NFT.',
  [NFT_STATUS.NO_OFFER]: 'No matching loan offers for this collection. ',
}
const NftStatusModal: FunctionComponent<{
  status?: NFT_STATUS
  onConfirm?: () => void
  imgProps: ImageProps
  onClose: () => void
  isOpen: boolean
  showTag?: boolean
  confirmText?: string
}> = ({
  isOpen,
  onClose,
  status,
  imgProps: { src, boxSize = '240px', ...rest },
  onConfirm,
  showTag = true,
  confirmText = 'OK',
}) => {
  if (!status) return null
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      closeOnOverlayClick={false}>
      <ModalOverlay bg='black.2' />
      <ModalContent
        maxW={{
          md: '576px',
          sm: '350px',
          xs: '326px',
        }}
        borderRadius={16}
        p={'40px'}>
        <ModalCloseButton
          top='40px'
          right={'40px'}
        />
        <ModalBody
          m={0}
          p={0}
          mt='44px'>
          <Flex
            alignItems={'center'}
            direction={'column'}
            px='50px'>
            <Box
              boxSize={boxSize}
              position={'relative'}>
              <ImageWithFallback
                src={src}
                preview={false}
                {...rest}
              />
              {showTag && (
                <NftTag
                  fontSize={'18px'}
                  left={0}
                  right={0}>
                  {status}
                </NftTag>
              )}
            </Box>
            <Text
              textAlign={'center'}
              whiteSpace={'pre-line'}
              fontSize={'26px'}
              fontFamily={'HarmonyOS Sans SC Bold'}
              mt={'40px'}
              mb='24px'
              lineHeight={'32px'}>
              {DESCRIPTION_CONSTANT[status]}
            </Text>
          </Flex>
          <Flex
            direction={'column'}
            px='50px'>
            <Button
              variant={'primary'}
              h='52px'
              onClick={onConfirm}>
              {confirmText}
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default NftStatusModal
