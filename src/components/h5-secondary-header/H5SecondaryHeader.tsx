import { Flex, type FlexProps, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

import { SvgComponent } from '..'

import type { FunctionComponent } from 'react'

const H5SecondaryHeader: FunctionComponent<
  FlexProps & {
    title?: string
    onBack?: () => void
  }
> = ({ title, onBack, ...rest }) => {
  const navigate = useNavigate()
  return (
    <Flex
      onClick={() => {
        if (onBack) {
          onBack()
          return
        }
        navigate(-1)
      }}
      w='100%'
      bg='white'
      h='56px'
      justify={'space-between'}
      alignItems={'center'}
      display={{
        md: 'none',
        sm: 'flex',
        xs: 'flex',
      }}
      {...rest}
    >
      <SvgComponent
        svgId='icon-arrow-down'
        transform={'rotate(90deg)'}
        svgSize='18px'
        fill={'black.1'}
      />
      <Text fontSize={'14px'} fontWeight='700' hidden={!title}>
        {title}
      </Text>
      <Flex w='18px' hidden={!title} />
    </Flex>
  )
}

export default H5SecondaryHeader
