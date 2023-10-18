import { Box } from '@chakra-ui/react'

import BanBanLogo from './banban-logo.png'

import type { BoxProps } from '@chakra-ui/react'

const IconBanBan = (props: BoxProps) => {
  return (
    <Box
      {...props}
      boxSize={'44px'}
      bgImage={BanBanLogo}
      backgroundRepeat={'no-repeat'}
      backgroundSize={'100%'}
    />
  )
}

export default IconBanBan
