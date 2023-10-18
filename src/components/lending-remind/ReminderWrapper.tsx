import {
  Flex,
  Highlight,
  Button,
  Text,
  chakra,
  type ButtonProps,
  type FlexProps,
} from '@chakra-ui/react'

import SvgComponent from '../svg-component/SvgComponent'

import BalanceCard from './BalanceCard'
import PoolsTable from './PoolsTable'

import type { FunctionComponent } from 'react'

const ReminderWrapper: FunctionComponent<
  {
    closeable?: boolean
    onClose?: () => void
    title: string
    description?: {
      text: string
      query: string[]
      link: {
        uri: string
        text: string
      }
    }
    balanceData: {
      balance?: number
      label: string
    }[]
    poolConfig: {
      data: Record<string, any>[]
      onViewMore: () => void
      title: string
    }
    buttonConfig: ButtonProps
  } & FlexProps
> = ({
  title,
  description,
  poolConfig,
  closeable,
  onClose,
  balanceData,
  buttonConfig,
  ...rest
}) => {
  return (
    <Flex alignItems={'start'} {...rest}>
      <Flex justify={'space-between'} w='100%'>
        <Text
          fontSize={'28px'}
          fontWeight={'700'}
          textAlign={'left'}
          lineHeight={1}
        >
          {title}
        </Text>
        {closeable && (
          <SvgComponent
            svgId='icon-close'
            onClick={onClose}
            cursor={'pointer'}
          />
        )}
      </Flex>

      {description && (
        <Text
          fontSize={{
            md: '16px',
            xs: '14px',
            sm: '14px',
          }}
          lineHeight={'1.2'}
          px={0}
          letterSpacing={'-0.28px'}
          mt='4px'
        >
          <Highlight
            query={description.query}
            styles={{
              fontWeight: '700',
            }}
          >
            {description.text}
          </Highlight>
          <chakra.span
            color={'blue.1'}
            fontWeight='700'
            cursor={'pointer'}
            onClick={() => window.open(description.link.uri)}
            _hover={{
              textDecoration: 'underline',
            }}
          >
            {description.link.text}
          </chakra.span>
        </Text>
      )}

      {/*  */}
      <Flex w='100%' direction={'column'} gap={'4px'} my='16px'>
        {balanceData.map((i) => (
          <BalanceCard {...i} key={i.label} />
        ))}
      </Flex>

      {/*  */}
      <Text mb='8px' lineHeight={1.1}>
        {poolConfig.title}
      </Text>

      {/* pools */}
      <PoolsTable data={poolConfig.data} onViewMore={poolConfig.onViewMore} />

      <Flex alignItems={'center'} justify={'center'} w='100%' mt='32px'>
        <Button w='240px' h='40px' variant={'primary'} {...buttonConfig}>
          {buttonConfig.title}
        </Button>
      </Flex>
    </Flex>
  )
}

export default ReminderWrapper
