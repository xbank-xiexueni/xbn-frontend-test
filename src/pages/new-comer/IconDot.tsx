import { Box } from '@chakra-ui/react'

import ImgDot from './icon-dot.png'

import type { BoxProps } from '@chakra-ui/react'

const IconDot = (props: BoxProps) => {
  return (
    <Box
      {...props}
      boxSize={'32px'}
      bgImage={ImgDot}
      backgroundRepeat={'no-repeat'}
      backgroundSize={'100%'}
    />
  )
}

export default IconDot
