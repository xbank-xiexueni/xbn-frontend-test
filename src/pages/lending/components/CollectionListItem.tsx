import { Flex, Text, type FlexProps } from '@chakra-ui/react'

import { ImageWithFallback, SvgComponent } from '@/components'

import type { FunctionComponent } from 'react'

const CollectionListItem: FunctionComponent<
  {
    data?: Record<string, any>
    onClick?: () => void
    isActive?: boolean
    count?: number
    iconSize?: number | string
    rightIconId?: string
  } & FlexProps
> = ({
  data,
  onClick,
  isActive,
  count,
  iconSize = '44px',
  rightIconId = 'icon-checked',
  ...rest
}) => {
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
      {...rest}
    >
      <Flex alignItems={'center'} gap='16px' w={isActive ? '95%' : '100%'}>
        <Flex
          boxSize={iconSize}
          alignItems={'center'}
          bg='white'
          borderWidth={1}
          borderRadius={8}
        >
          <ImageWithFallback
            src={
              data?.nftCollection?.imagePreviewUrl ||
              data?.nftCollection?.image_url
            }
            w={iconSize}
            borderRadius={8}
            preview={false}
          />
        </Flex>

        <Text
          fontSize='14px'
          display='inline-block'
          overflow='hidden'
          whiteSpace='nowrap'
          textOverflow='ellipsis'
          flex={1}
        >
          {data?.nftCollection?.name || '--'}
          &nbsp;
        </Text>
        {data?.nftCollection?.safelistRequestStatus === 'verified' ||
          (true && <SvgComponent svgId='icon-verified-fill' />)}
      </Flex>
      {isActive ? (
        <SvgComponent svgId={rightIconId} />
      ) : (
        !!count && <Text fontSize='14px'>{count}</Text>
      )}
    </Flex>
  )
}

export default CollectionListItem
