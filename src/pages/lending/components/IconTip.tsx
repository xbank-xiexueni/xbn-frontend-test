import { TooltipComponent, SvgComponent } from 'components'

import type { TooltipProps } from '@chakra-ui/react'
import type { FunctionComponent } from 'react'

const IconTip: FunctionComponent<Omit<TooltipProps, 'children'>> = ({
  ...rest
}) => {
  return (
    <TooltipComponent
      placement='auto-start'
      {...rest}>
      <SvgComponent
        svgId='icon-tip'
        fill='gray.1'
        fontSize={{
          md: '20px',
          sm: '14px',
          xs: '14px',
        }}
      />
    </TooltipComponent>
  )
}

export default IconTip
