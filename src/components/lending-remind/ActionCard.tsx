import { Box, Flex, Text, type FlexProps } from '@chakra-ui/react'

import SvgComponent from '../svg-component/SvgComponent'

import type { FunctionComponent } from 'react'

const ActionCard: FunctionComponent<
  FlexProps & {
    name: string
    index: number
  }
> = ({ onClick, name, index, ...rest }) => {
  return (
    <Flex
      px='16px'
      py='8px'
      bg='gray.5'
      mb='16px'
      borderRadius={'16px'}
      w='100%'
      justify={'space-between'}
      alignItems={'center'}
      cursor={'pointer'}
      onClick={onClick}
      {...rest}
    >
      <Box fontSize={'16px'}>
        <Text color={'gray.4'} lineHeight={'1.2'}>
          Issue {index + 1}
        </Text>
        <Text lineHeight={'1.2'} fontWeight={'700'} fontSize={'18px'}>
          {name === 'Allowance' && 'Low Allowance'}
          {name === 'WETH' && 'Low WETH Balance'}
        </Text>
      </Box>
      <SvgComponent
        svgId='icon-arrow-down'
        fill={'blue.1'}
        transform={'rotate(-90deg)'}
        fontSize={'20px'}
      />
    </Flex>
  )
}

export default ActionCard
