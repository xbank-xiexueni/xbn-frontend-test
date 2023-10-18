import { Box, Tooltip, type TooltipProps } from '@chakra-ui/react'
import { useState } from 'react'

import type { FunctionComponent } from 'react'

const TooltipComponent: FunctionComponent<TooltipProps> = ({
  isOpen,
  children,
  ...rest
}) => {
  const [isLabelOpen, setIsLabelOpen] = useState(isOpen)
  return (
    <Tooltip
      isOpen={isLabelOpen}
      placement='bottom-start'
      hasArrow={false}
      whiteSpace={'pre-line'}
      bg='white'
      borderRadius={8}
      p='10px'
      fontSize={'12px'}
      lineHeight={'18px'}
      fontWeight={'400'}
      color='gray.4'
      boxShadow={'0px 0px 10px #D1D6DC'}
      {...rest}
    >
      <Box
        cursor={'pointer'}
        onMouseEnter={() => setIsLabelOpen(true)}
        onMouseLeave={() => setIsLabelOpen(false)}
        onClick={() => setIsLabelOpen(true)}
      >
        {children}
      </Box>
    </Tooltip>
  )
}

export default TooltipComponent
