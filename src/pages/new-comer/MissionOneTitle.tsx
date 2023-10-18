import { Box, Text, Img } from '@chakra-ui/react'

import Mission1Title from './mission-1-title.png'
const MissionOneTitle = () => {
  return (
    <Box minHeight={'100px'} className='mission-logo' marginBottom={'45px'}>
      <Box className='mission-logo-gradient' />
      <Box className='mission-title-wrapper'>
        <Text>Mission 1</Text>
      </Box>
      <Img
        width={'480px'}
        position={'absolute'}
        bottom={0}
        left={'50%'}
        transform={'translateX(-50%)'}
        src={Mission1Title}
      />
    </Box>
  )
}

export default MissionOneTitle
