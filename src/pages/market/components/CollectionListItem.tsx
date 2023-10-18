import { Flex, Text, type FlexProps } from '@chakra-ui/react'

import { CollectionTag, ImageWithFallback, SvgComponent } from 'components'

import type { FunctionComponent } from 'react'

const CollectionListItem: FunctionComponent<
  {
    data?: Record<string, any>
    onClick?: () => void
    isActive?: boolean
    count?: number
    iconSize?: number | string
  } & FlexProps
> = ({ data, onClick, isActive, iconSize = '44px', ...rest }) => {
  return (
    <Flex
      key={`${data?.contractAddress}-${data?.nftCollection?.id}`}
      px='16px'
      py='8px'
      alignItems={'center'}
      justifyContent='space-between'
      border={`1px solid var(--chakra-colors-gray-2)`}
      borderRadius={8}
      _hover={{
        bg: 'blue.2',
      }}
      cursor='pointer'
      bg={isActive ? 'blue.2' : 'white'}
      onClick={onClick}
      {...rest}>
      <Flex
        alignItems={'center'}
        gap='10px'
        w='80%'>
        <Flex
          boxSize={iconSize}
          alignItems={'center'}
          bg='white'
          borderWidth={1}
          borderRadius={8}>
          <ImageWithFallback
            src={
              data?.nftCollection?.imagePreviewUrl ||
              data?.nftCollection?.image_url
            }
            w={iconSize}
            borderRadius={8}
            fit='cover'
            preview={false}
          />
        </Flex>

        <Flex
          flexDir={'column'}
          alignItems={'flex-start'}
          w='70%'>
          <Text
            fontSize='14px'
            // display='inline-block'
            // overflow='hidden'
            // whiteSpace='nowrap'
            // textOverflow='ellipsis'
            noOfLines={1}
            fontFamily={'HarmonyOS Sans Sc Bold'}>
            {data?.nftCollection?.name || '--'}
            &nbsp;
          </Text>
          {data?.tags && data?.tags?.length ? (
            <CollectionTag
              title={data?.tags[0]}
              maxW={'140px'}
            />
          ) : null}
        </Flex>
      </Flex>
      <SvgComponent
        svgId='icon-verified-fill'
        fontSize={{
          md: '20px',
          sm: '16px',
          xs: '16px',
        }}
      />
    </Flex>
  )
}

export default CollectionListItem
