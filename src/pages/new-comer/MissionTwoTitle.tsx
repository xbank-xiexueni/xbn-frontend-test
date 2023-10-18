import { Box, Text, Img } from '@chakra-ui/react'

import Mission2Title from './mission-2-title.png'

const MissionTwoTitle = () => {
  return (
    <Box minHeight={'100px'} className='mission-logo' marginBottom={'45px'}>
      <Box className='mission-logo-gradient' />
      <Box className='mission-title-wrapper'>
        <Text>Mission 2</Text>
      </Box>
      <Img
        width={'846px'}
        position={'absolute'}
        bottom={0}
        left={'50%'}
        transform={'translateX(-50%)'}
        src={Mission2Title}
      />
    </Box>
  )
}
export default MissionTwoTitle
