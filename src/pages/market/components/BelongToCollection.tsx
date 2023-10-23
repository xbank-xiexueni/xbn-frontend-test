import { Box, type BoxProps, Heading, Flex, Text } from '@chakra-ui/react'
import { type FunctionComponent } from 'react'
import { useNavigate } from 'react-router-dom'

import { ImageWithFallback, SvgComponent } from '@/components'
import { UNIT } from '@/constants'
import { formatFloat } from '@/utils/format'

const BelongToCollection: FunctionComponent<
  BoxProps & {
    data: {
      name?: string
      imagePreviewUrl?: string
      safelistRequestStatus?: string
      floorPrice?: number
      id?: string
    }
  }
> = ({
  data: {
    name = '',
    imagePreviewUrl = '',
    safelistRequestStatus,
    floorPrice,
    id,
  },
  ...rest
}) => {
  const navigate = useNavigate()
  return (
    <Box
      {...rest}
      mt='60px'
      w={{
        xl: '600px',
        lg: '500px',
        sm: '100%',
        xs: '100%',
      }}
      cursor={id === undefined ? 'inherit' : 'pointer'}
      onClick={() => {
        if (id === undefined) return
        navigate(`/market/${id}`)
      }}
    >
      <Heading size={'lg'} mb='16px'>
        Collection
      </Heading>
      <Flex
        alignItems={'center'}
        p='16px'
        borderRadius={16}
        bg='gray.5'
        gap='16px'
      >
        <Flex
          w='72px'
          h='72px'
          alignItems={'center'}
          bg='white'
          borderRadius={2}
        >
          <ImageWithFallback
            src={imagePreviewUrl}
            borderRadius={8}
            fit={'cover'}
            preview={false}
          />
        </Flex>

        <Box>
          <Flex>
            <Text fontSize={'18px'} fontWeight='bold'>
              {name}
            </Text>
            {safelistRequestStatus === 'verified' && (
              <SvgComponent svgId='icon-verified-fill' />
            )}
          </Flex>

          <Text fontSize={'18px'} fontWeight='bold'>
            {formatFloat(floorPrice)}
            &nbsp;
            {UNIT}
          </Text>
        </Box>
      </Flex>
    </Box>
  )
}

export default BelongToCollection
