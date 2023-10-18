import { Box, Img, Text } from '@chakra-ui/react'

import IconComplete from './icon-complete.png'
import IconPending from './icon-pending.png'

import type { ButtonProps } from '@chakra-ui/react'

function MissionButton(
  props: ButtonProps & {
    title: string
    status?: 'pending' | 'complete' | 'active'
  },
) {
  const status = props.status || 'active'
  return (
    <Box
      width={props.width}
      h={'41px'}
      position={'relative'}
      as='button'
      onClick={props.onClick}
      disabled={props.disabled}
      cursor={props?.disabled ? 'not-allowed' : 'initial'}
    >
      {status === 'active' && (
        <Box
          borderRadius={'90px'}
          position={'absolute'}
          top={'2px'}
          left={0}
          width={props.width}
          h={'42px'}
          padding={'1px'}
          backgroundImage={
            'linear-gradient(90deg, #76EED8 -2.54%, #76EE99 11.76%, #4891FF 32.57%, #CB37FF 51.97%, #EF76B6 74.8%, #FFD159 101.59%)'
          }
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Box
            borderRadius={'90px'}
            width={props.width}
            h={'40px'}
            bg={'#1D1C20'}
          />
        </Box>
      )}
      <Box
        cursor={status === 'active' ? 'pointer' : 'not-allowed'}
        borderRadius={'90px'}
        position={'absolute'}
        width={props.width}
        h={'41px'}
        border={'2px solid #FFF'}
        top={0}
        left={0}
        display={'flex'}
        alignItems={'center'}
        justifyContent={'center'}
        bg={
          status === 'active'
            ? 'linear-gradient(90deg, #76EED8 -2.54%, #76EE99 11.76%, #4891FF 32.57%, #CB37FF 51.97%, #EF76B6 74.8%, #FFD159 101.59%)'
            : 'radial-gradient(50% 50% at 50% 50%, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.00) 100%), rgba(255, 255, 255, 0.20)'
        }
        color={'#FFFFFF'}
        boxShadow={
          status !== 'active'
            ? '0px 12px 55px 0px rgba(110, 88, 135, 0.55)'
            : ''
        }
      >
        {status === 'complete' && (
          <Img w='24px' h={'24px'} src={IconComplete} marginRight={'5px'} />
        )}
        {status === 'pending' && (
          <Img w='24px' h={'24px'} src={IconPending} marginRight={'5px'} />
        )}
        <Text fontFamily={'Orbitron'} fontSize={'20px'} fontWeight={'700'}>
          {props.title}
        </Text>
      </Box>
    </Box>
  )
}

export default MissionButton
