import { Flex, Box, Text } from '@chakra-ui/react'
import { type FunctionComponent } from 'react'

import { TooltipComponent, SvgComponent } from 'components'

import type { FlexProps } from '@chakra-ui/react'

const SecondaryWrapper: FunctionComponent<
  {
    title: string
    description: string
  } & FlexProps
> = ({ description, title, children }) => {
  return (
    <Flex
      justify={'space-between'}
      w='100%'
      alignItems={'center'}
      p={{
        md: '10px 0 10px 8px',
        sm: '10px 0 10px 8px',
        xs: '10px 0 10px 8px',
      }}
      flexWrap={{
        md: 'nowrap',
        sm: 'wrap',
        xs: 'wrap',
      }}
      gap='10px'>
      <Flex
        alignItems={'center'}
        gap='6px'>
        <Box
          boxSize={'16px'}
          borderRadius={'100%'}
          borderWidth={4}
          borderColor={'blue.1'}
          mr={{
            md: '18px',
            sm: '4px',
            xs: '4px',
          }}
        />
        <Text fontWeight={'500'}> {title}</Text>
        <TooltipComponent
          label={description}
          placement='auto-start'>
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
      </Flex>
      <Box
        w={{
          md: 'auto',
          sm: '100%',
          xs: '100%',
        }}>
        {children}
      </Box>
    </Flex>
  )
}

export default SecondaryWrapper
