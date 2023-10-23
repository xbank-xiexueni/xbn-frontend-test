import { Flex, Text, type TextProps } from '@chakra-ui/react'
import { type FunctionComponent } from 'react'

import { SvgComponent } from '@/components'

const EthText: FunctionComponent<TextProps> = ({ children, ...rest }) => {
  return (
    <Flex alignItems={'center'}>
      <SvgComponent svgId='icon-eth' />
      <Text {...rest}>{children}</Text>
    </Flex>
  )
}

export default EthText
