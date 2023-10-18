import { Box, Img, Text } from '@chakra-ui/react'

import MissionBoxBody from './MissionBoxBody.svg'
import MissionBoxLongBody from './MissionBoxLongBody.svg'
import MissionBoxTitleTopLine from './MissionBoxTitleTopLine.svg'
import MissionBoxTitleTopLongLine from './MissionBoxTitleTopLongLine.svg'

import type { BoxProps } from '@chakra-ui/react'
const MissionBox = (
  props: React.PropsWithChildren & {
    boxProps?: BoxProps
    title?: string
    contentBoxProps?: BoxProps
    longTitle?: boolean
  },
) => {
  return (
    <Box
      position={'relative'}
      width={'1120px'}
      height={'142px'}
      {...props.boxProps}
    >
      <Img
        width={props.longTitle ? '386.77px' : '238.153px'}
        height={'20.979px'}
        src={
          props.longTitle ? MissionBoxTitleTopLongLine : MissionBoxTitleTopLine
        }
        position={'absolute'}
        left={'22px'}
        top={'0px'}
      />
      <Img
        src={props.longTitle ? MissionBoxLongBody : MissionBoxBody}
        position={'absolute'}
        bottom={0}
        left={0}
      />
      <Box position={'absolute'} top={0} left={'52.5px'}>
        <Text
          fontSize={'24px'}
          fontFamily={'Orbitron'}
          textShadow={'0px 2px 0px #CD79FF'}
          fontWeight={700}
          color={'#FFFFFF'}
        >
          {props.title}
        </Text>
      </Box>
      <Box
        width={'1120px'}
        height={'121px'}
        position={'absolute'}
        bottom={0}
        left={0}
        {...{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: '20px',
          paddingRight: '50px',
        }}
        {...props.contentBoxProps}
      >
        {props.children}
      </Box>
    </Box>
  )
}

export default MissionBox
