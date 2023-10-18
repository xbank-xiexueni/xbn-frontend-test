import { Box, Flex } from '@chakra-ui/react'

import type { FlexProps } from '@chakra-ui/react'
import type { FunctionComponent } from 'react'

const CustomCheckBox: FunctionComponent<
  FlexProps & {
    onToggle: (v: boolean) => void
    value: boolean
  }
> = ({ onToggle, value, children, ...rest }) => {
  return (
    <Flex
      justify={'center'}
      alignItems={'center'}
      gap={'4px'}
      onClick={() => onToggle(!value)}
      cursor={'pointer'}
      color={'gray.4'}
      mt='4px'
      {...rest}
    >
      {!!value ? (
        <svg
          width='21'
          height='20'
          viewBox='0 0 21 20'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M19 10C19 14.4183 15.4183 18 11 18C6.58172 18 3 14.4183 3 10C3 5.58173 6.58172 2.00001 11 2.00001C15.4183 2.00001 19 5.58173 19 10Z'
            fill='#0000FF'
          />
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M13.6332 7.09153C13.5111 6.96949 13.3133 6.96949 13.1912 7.09153L9.42104 10.8617L8.06061 9.50129C7.93857 9.37925 7.7407 9.37925 7.61866 9.50129L7.09153 10.0284C7.03292 10.087 7 10.1665 7 10.2494C7 10.3323 7.03292 10.4118 7.09153 10.4704L9.20007 12.5789C9.32211 12.7009 9.51997 12.7009 9.64201 12.5789L14.1603 8.06061C14.2189 8.002 14.2518 7.92251 14.2518 7.83963C14.2518 7.75675 14.2189 7.67727 14.1603 7.61866L13.6332 7.09153Z'
            fill='white'
          />
        </svg>
      ) : (
        <Box
          boxSize={'15px'}
          m='4px'
          mr={'2px'}
          borderColor={'blue.1'}
          borderRadius={'100%'}
          borderWidth={1}
        />
      )}
      {children}
    </Flex>
  )
}

export default CustomCheckBox
