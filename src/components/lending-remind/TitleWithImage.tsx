import {
  Text,
  Image,
  Flex,
  type ImageProps,
  type TextProps,
  type FlexProps,
} from '@chakra-ui/react'

import type { FunctionComponent } from 'react'

const TitleWithImage: FunctionComponent<
  FlexProps & {
    imageProps?: ImageProps
    textProps?: TextProps
    title: string
  }
> = ({ title, imageProps, textProps, ...rest }) => {
  return (
    <Flex w='100%' direction={'column'} alignItems={'center'} {...rest}>
      <Image boxSize={'120px'} {...imageProps} />
      <Text
        fontSize={'20px'}
        fontWeight={'700'}
        textAlign={'center'}
        lineHeight={'1.1'}
        {...textProps}
      >
        {title}
      </Text>
    </Flex>
  )
}

export default TitleWithImage
