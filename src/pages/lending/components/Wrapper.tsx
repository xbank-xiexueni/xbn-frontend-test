import { Flex } from '@chakra-ui/react'

import { STEPS_DESCRIPTIONS } from 'constants/index'

import StepDescription from './StepDescription'

import type { CardProps } from '@chakra-ui/react'
import type { FunctionComponent } from 'react'

const Wrapper: FunctionComponent<
  {
    stepIndex: number
  } & CardProps
> = ({ stepIndex, children }) => {
  return (
    <Flex
      justify={'space-between'}
      alignItems='center'
      flexWrap={{
        md: 'nowrap',
        sm: 'wrap',
        xs: 'wrap',
      }}
      rowGap={'24px'}
      columnGap={'16px'}
      display={{
        md: 'flex',
        xs: 'block',
        sm: 'block',
      }}
      borderRadius={16}
      bg='gray.5'
      p={{ md: '32px', sm: '12px', xs: '12px' }}>
      <StepDescription
        data={{
          step: stepIndex,
          ...STEPS_DESCRIPTIONS[stepIndex - 1],
        }}
      />
      {children}
      {/* {isEmpty(params) ? <InputSearch /> : params.collectionId} */}
    </Flex>
  )
}

export default Wrapper
