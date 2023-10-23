import { Button, Divider, Flex, chakra, type FlexProps } from '@chakra-ui/react'

import { formatFloat } from '@/utils/format'

import ImageWithFallback from '../image-with-fallback/ImageWithFallback'
import SvgComponent from '../svg-component/SvgComponent'
import TooltipComponent from '../tooltip-component/TooltipComponent'

import type { FunctionComponent } from 'react'

const PoolsTable: FunctionComponent<
  {
    data: Record<string, any>[]
    onViewMore: () => void
  } & FlexProps
> = ({ data, onViewMore, ...rest }) => {
  return (
    <Flex
      direction={'column'}
      bg='gray.5'
      px={'16px'}
      pt='8px'
      pb='12px'
      borderRadius={8}
      gap={'8px'}
      w='100%'
      mt='8px'
      {...rest}
    >
      <Flex justify={'space-between'} color={'gray.4'} fontSize={'14px'}>
        <chakra.span>Name</chakra.span>
        <chakra.span>Required Amount</chakra.span>
      </Flex>
      <Divider borderColor={'gray.1'} opacity={1} />

      {data?.slice(0, 3).map((item) => (
        <Flex
          w='100%'
          key={item.collateral_contract}
          justify={'space-between'}
          fontSize={'14px'}
          mt='4px'
        >
          <Flex alignItems={'center'} gap='4px' flex={1}>
            <ImageWithFallback
              preview={false}
              src={item?.imagePreviewUrl}
              boxSize={'24px'}
              key={item?.name}
              fit='cover'
              borderRadius={4}
            />
            <TooltipComponent label={item.name} placement='top' hasArrow>
              <chakra.span fontWeight={'500'} noOfLines={1}>
                {item?.name}
              </chakra.span>
            </TooltipComponent>
            {item?.safelistRequestStatus === 'verified' && (
              <SvgComponent svgId='icon-verified-fill' />
            )}
          </Flex>
          <Flex alignItems={'center'} flex={1} justify={'end'}>
            <SvgComponent
              svgId='icon-eth'
              svgSize={'12px'}
              fill={'blue.1'}
              mt='1px'
            />
            <chakra.span color={'blue.1'} fontWeight={700}>
              {formatFloat(item.requiredAmount)}
            </chakra.span>
          </Flex>
        </Flex>
      ))}
      {data?.length > 3 && (
        <Flex justify={'center'}>
          <Button
            variant={'secondary'}
            onClick={onViewMore}
            w='90px'
            h='20px'
            fontSize={'12px'}
            fontWeight={'400'}
            pb='2px'
          >
            View More
          </Button>
        </Flex>
      )}
    </Flex>
  )
}

export default PoolsTable
