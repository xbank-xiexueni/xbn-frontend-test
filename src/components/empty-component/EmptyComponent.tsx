import { Box, type BoxProps, Flex, Text } from '@chakra-ui/react'

// import defaultEmptyIcon from '@/assets/empty.svg'

// import { ImageWithFallback } from '..'

import type { FunctionComponent, ReactElement } from 'react'

const EmptyComponent: FunctionComponent<
  {
    icon?: string
    description?: string
    action?: () => ReactElement
  } & BoxProps
> = ({ description, action, ...rest }) => {
  return (
    <Box textAlign={'center'} my={'80px'} {...rest}>
      <Flex justify={'center'} mb='16px'>
        <svg
          width='40'
          height='40'
          viewBox='0 0 40 40'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <g clipPath='url(#clip0_218_19510)'>
            <mask
              id='mask0_218_19510'
              // styles='mask-type:luminance'
              maskUnits='userSpaceOnUse'
              x='0'
              y='0'
              width='40'
              height='40'
            >
              <path
                d='M32 0H8C3.58172 0 0 3.58172 0 8V32C0 36.4183 3.58172 40 8 40H32C36.4183 40 40 36.4183 40 32V8C40 3.58172 36.4183 0 32 0Z'
                fill='white'
              />
            </mask>
            <g mask='url(#mask0_218_19510)'>
              <path
                d='M18.9334 22.0686H20.8358L21.316 15.752L21.4083 13H18.3608L18.4532 15.752L18.9334 22.0686ZM19.8938 27C20.8173 27 21.5191 26.3166 21.5191 25.3562C21.5191 24.3958 20.8173 23.7309 19.8938 23.7309C18.9518 23.7309 18.25 24.3958 18.25 25.3562C18.25 26.3166 18.9334 27 19.8938 27Z'
                fill='#97ADC7'
              />
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M6.4387 39.8477L6.82684 37.8858C7.20466 37.9605 7.59673 38 8 38H10V40H8C7.46572 40 6.94367 39.9476 6.4387 39.8477ZM30 40V38H32C32.4033 38 32.7953 37.9605 33.1732 37.8858L33.5613 39.8477C33.0563 39.9476 32.5343 40 32 40H30ZM36.4449 38.6525L35.3323 36.9906C35.9875 36.552 36.552 35.9875 36.9906 35.3323L38.6525 36.4449C38.0685 37.3173 37.3173 38.0685 36.4449 38.6525ZM40 10H38V8C38 7.59673 37.9605 7.20466 37.8858 6.82684L39.8477 6.4387C39.9476 6.94367 40 7.46572 40 8V10ZM38.6525 3.55508L36.9906 4.66771C36.552 4.01254 35.9875 3.44804 35.3323 3.00941L36.4449 1.34748C37.3173 1.93154 38.0685 2.68266 38.6525 3.55508ZM10 0H8C7.46572 0 6.94367 0.0523755 6.4387 0.152272L6.82684 2.11425C7.20466 2.0395 7.59673 2 8 2H10V0ZM3.55508 1.34748L4.66771 3.00941C4.01254 3.44804 3.44804 4.01254 3.00941 4.66771L1.34748 3.55507C1.93154 2.68266 2.68266 1.93154 3.55508 1.34748ZM0 30H2V32C2 32.4033 2.0395 32.7953 2.11425 33.1732L0.152272 33.5613C0.0523755 33.0563 0 32.5343 0 32V30ZM3.55507 38.6525L4.66771 36.9906C4.01254 36.552 3.44804 35.9875 3.00941 35.3323L1.34748 36.4449C1.93154 37.3173 2.68266 38.0685 3.55507 38.6525ZM0 26H2V22H0V26ZM0 18H2V14H0V18ZM0 10H2V8C2 7.59673 2.0395 7.20466 2.11425 6.82684L0.152272 6.4387C0.0523756 6.94367 0 7.46572 0 8V10ZM14 0V2H18V0H14ZM22 0V2H26V0H22ZM30 0V2H32C32.4033 2 32.7953 2.0395 33.1732 2.11425L33.5613 0.152273C33.0563 0.0523757 32.5343 0 32 0H30ZM40 14H38V18H40V14ZM40 22H38V26H40V22ZM40 30H38V32C38 32.4033 37.9605 32.7953 37.8858 33.1732L39.8477 33.5613C39.9476 33.0563 40 32.5343 40 32V30ZM26 40V38H22V40H26ZM18 40V38H14V40H18Z'
                fill='#97ADC7'
              />
            </g>
          </g>
          <defs>
            <clipPath id='clip0_218_19510'>
              <rect width='40' height='40' fill='white' />
            </clipPath>
          </defs>
        </svg>

        {/* <ImageWithFallback src={icon || defaultEmptyIcon} w='40px' h='40px' /> */}
      </Flex>
      <Text color='gray.3' mb='24px' fontSize='14px' fontWeight={'700'}>
        {description || 'No data yet...'}
      </Text>
      {action && action()}
    </Box>
  )
}

export default EmptyComponent
