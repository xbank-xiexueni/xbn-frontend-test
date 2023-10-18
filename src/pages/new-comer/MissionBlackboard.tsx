import { Box } from '@chakra-ui/react'

import type { BoxProps } from '@chakra-ui/react'

function MissionBlackboard(
  props: React.PropsWithChildren & { boxProps?: BoxProps },
) {
  return (
    <Box
      padding={'20px 10px'}
      display={'flex'}
      flexDir={'column'}
      justifyContent={'center'}
      alignItems={'center'}
      borderRadius={'24px'}
      border={'1px solid rgba(255, 255, 255, 0.10)'}
      backgroundColor={'#1D1C20'}
      boxShadow={'0px 4px 4px 0px rgba(22, 2, 2, 0.25) inset'}
      {...props.boxProps}
    >
      {props.children}
    </Box>
  )
}
export default MissionBlackboard
