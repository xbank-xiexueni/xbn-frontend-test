import { Box, Flex, Button, Spinner, Text } from '@chakra-ui/react'
import Lottie from 'lottie-react'

import uiSuccessJson from 'assets/ui-sucess.json'
import { H5SecondaryHeader, NftMedia, SvgComponent } from 'components'

import type { ReactNode, FunctionComponent } from 'react'

export type MiddleStatusProps = {
  step: 'loading' | 'success' | 'timeout'
  imagePreviewUrl?: string
  animationUrl?: string
  onLoadingBack?: () => void
  onSuccessBack?: () => void
  onTimeoutBack?: () => void
  successTitle?: string
  successDescription?: string
  isShowBack?: boolean
  loadingText?: string
  successButtonTitle?: string
  successButtonAction?: () => void
  timeoutText?: ReactNode
}
const MiddleStatus: FunctionComponent<MiddleStatusProps> = ({
  step,
  imagePreviewUrl,
  onLoadingBack,
  onSuccessBack,
  animationUrl,
  successDescription,
  successTitle,
  isShowBack = true,
  loadingText,
  successButtonTitle,
  successButtonAction,
  timeoutText,
  onTimeoutBack,
}) => {
  return (
    <>
      <H5SecondaryHeader />
      <Flex
        justify={{
          md: 'space-between',
          sm: 'center',
          xs: 'center',
        }}
        mt={{
          md: '44px',
          sm: '32px',
          xs: '32px',
        }}
        m='0 auto'
        w={'60%'}>
        <Button
          hidden={!isShowBack}
          leftIcon={<SvgComponent svgId='icon-arrow-left' />}
          onClick={() => {
            if (step === 'loading' && onLoadingBack) {
              onLoadingBack()
              return
            }
            if (step === 'success' && onSuccessBack) {
              onSuccessBack()
              return
            }
            if (step === 'timeout' && onTimeoutBack) {
              onTimeoutBack()
              return
            }
          }}
          display={{
            md: 'flex',
            sm: 'none',
            xs: 'none',
          }}
          minW={'100px'}
          mr='120px'>
          Back
        </Button>
        <Flex
          flexDir='column'
          alignItems='center'
          w='400px'>
          <Flex
            position={'relative'}
            mb={{ md: '40px', sm: '28px', xs: '28px' }}
            w={{ md: '285px', sm: '244px', xs: '244px' }}
            alignItems={'center'}
            justify='center'>
            <NftMedia
              data={{
                imagePreviewUrl,
                animationUrl,
              }}
              borderRadius={16}
              boxSize={{
                md: '240px',
                sm: '160px',
                xs: '160px',
              }}
              fit='contain'
            />
            <Flex
              pos='absolute'
              bottom={{
                md: '-20px',
                sm: '-10px',
                xs: '-10px',
              }}
              right={{ md: '6px', sm: '30px', xs: '30px' }}
              bg='white'
              borderRadius={'100%'}
              boxSize={{
                md: '64px',
                sm: '40px',
                xs: '40px',
              }}
              zIndex={10}>
              {step === 'loading' && (
                <Spinner
                  color='blue.1'
                  boxSize={'52px'}
                  thickness='3px'
                  speed='0.6s'
                />
              )}
              {step === 'success' && (
                <Lottie
                  animationData={uiSuccessJson}
                  loop={false}
                />
              )}
            </Flex>
            {step === 'loading' && (
              <Flex
                pos='absolute'
                bottom={{
                  md: '-20px',
                  sm: '-10px',
                  xs: '-10px',
                }}
                right={{ md: '6px', sm: '30px', xs: '30px' }}
                bg='white'
                borderRadius={'100%'}
                boxSize={{
                  md: '64px',
                  sm: '40px',
                  xs: '40px',
                }}
                zIndex={10}>
                <Spinner
                  color='blue.1'
                  boxSize={'52px'}
                  thickness='3px'
                  speed='0.6s'
                />
              </Flex>
            )}
          </Flex>
          {step === 'loading' && (
            <Flex
              flexDir={'column'}
              alignItems={'center'}>
              {loadingText && (
                <Text
                  fontWeight={'500'}
                  mt='8px'
                  textAlign={'center'}>
                  {loadingText}
                </Text>
              )}
            </Flex>
          )}
          {step === 'timeout' && (
            <Flex
              flexDir={'column'}
              alignItems={'center'}>
              {timeoutText}
            </Flex>
          )}

          {step === 'success' && (
            <Box textAlign={'center'}>
              <Text
                fontWeight={'700'}
                fontSize={{
                  md: '28px',
                  sm: '24px',
                  xs: '24px',
                }}>
                {successTitle}
              </Text>
              <Text
                color={'gray.3'}
                fontSize={{
                  md: '16px',
                  xs: '14px',
                  sm: '14px',
                }}
                mt={{
                  md: '16px',
                  sm: '8px',
                  xs: '8px',
                }}
                fontWeight={'500'}>
                {successDescription}
              </Text>

              {!!successButtonTitle && (
                <Button
                  mt='52px'
                  onClick={successButtonAction}
                  variant={'primary'}
                  w='100%'
                  h='48px'>
                  {successButtonTitle}
                </Button>
              )}
            </Box>
          )}
        </Flex>
      </Flex>
    </>
  )
}

export default MiddleStatus
