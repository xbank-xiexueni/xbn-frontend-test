import { Flex, Text, type FlexProps } from '@chakra-ui/react'

import { formatBalance } from '@/utils/format'

import SvgComponent from '../svg-component/SvgComponent'

import type { FunctionComponent } from 'react'

const NUM_WRAPPER_PROPS: FlexProps = {
  direction: 'column',
  px: '16px',
  justify: 'center',
  borderWidth: 1,
  borderColor: 'gray.1',
  borderRadius: 8,
  gap: '6px',
  w: '100%',
  h: '88px',
}
const BalanceCard: FunctionComponent<
  FlexProps & {
    balance?: number
    label: string
  }
> = ({ balance, label, ...rest }) => {
  return (
    <Flex {...NUM_WRAPPER_PROPS} {...rest}>
      <Flex alignItems={'center'} gap={'2px'}>
        <SvgComponent svgId='icon-eth' svgSize={'20px'} mt='2px' ml='-4px' />
        <Text fontSize={'28px'} lineHeight={1} fontWeight={'700'}>
          {formatBalance(balance ?? 0)}
        </Text>
      </Flex>

      <Text color='gray.4' fontSize={'14px'} lineHeight={1.1}>
        {label}
      </Text>
    </Flex>
  )
}

export default BalanceCard
