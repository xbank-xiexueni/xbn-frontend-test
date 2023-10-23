import { Box, Flex, Heading, Text } from '@chakra-ui/react'
import { type FunctionComponent } from 'react'
import Slider from 'react-slick'

import { ImageWithFallback } from '@/components'
import { LENDING_SLIDER_IMAGES } from '@/constants'

// import './custom-slider.css'

// const Item: FunctionComponent<
//   FlexProps & {
//     label: string
//     value?: string | number
//     isEth?: boolean
//     isDollar?: boolean
//   }
// > = ({ label, value, isDollar, isEth, ...rest }) => (
//   <Flex flexDir={'column'} alignItems='center' {...rest}>
//     <Flex alignItems={'center'} mb={'4px'}>
//       {isEth && <SvgComponent svgId='icon-eth' svgSize='20px' />}
//       <Text
//         color={'black.3'}
//         fontWeight='700'
//         fontSize={{
//           md: '28px',
//           sm: '20px',
//           xs: '20px',
//         }}
//       >
//         {isDollar && '$'}
//         {value || '--'}
//       </Text>
//     </Flex>
//     <Text
//       color='gray.4'
//       fontSize={{
//         md: '14px',
//         sm: '12px',
//         xs: '12px',
//       }}
//       fontWeight='500'
//     >
//       {label}
//     </Text>
//   </Flex>
// )
const settings = {
  dots: true,
  infinite: true,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 5000,
  cssEase: 'linear',
}
const AllPoolsDescription: FunctionComponent<{
  data: {
    titleImage?: string
    title?: string
    description?: string
    img?: string
  }
}> = ({ data: { title = '', description = '', img = '' } }) => {
  return (
    <Flex
      justify={{
        xs: 'center',
        sm: 'center',
        md: 'space-between',
      }}
      alignItems='center'
      wrap='wrap'
    >
      <Box
        maxW={{
          md: '40%',
          xl: '50%',
          sm: '100%',
          xs: '100%',
        }}
      >
        <Heading
          fontSize={{
            md: '64px',
            sm: '24px',
            xs: '24px',
          }}
        >
          {title}
        </Heading>

        <Text
          color='gray.3'
          mt={'8px'}
          mb={{ md: '40px', sm: '32px', xs: '32px' }}
          fontSize={{ md: '20px', sm: '14px', xs: '14px' }}
          fontWeight='medium'
          whiteSpace={'pre-wrap'}
        >
          {description}
        </Text>

        {/* 总览数据 */}
        {/* {loading ? (
          <Flex gap={'10px'}>
            {range(3).map((i) => (
              <Skeleton
                w={{
                  md: '160px',
                  sm: '33%',
                  xs: '33%',
                }}
                key={i}
                borderRadius={16}
                h={{
                  md: '66px',
                  sm: '44px',
                  xs: '44px',
                }}
                mb={{
                  md: 0,
                  sm: '30px',
                  xs: '30px',
                }}
              />
            ))}
          </Flex>
        ) : (
          <Flex
            alignItems={'center'}
            rowGap='80px'
            columnGap={'16px'}
            flexWrap='wrap'
            pb={{
              md: 0,
              sm: '30px',
              xs: '30px',
            }}
            justify={{
              md: 'flex-start',
              sm: 'space-between',
              xs: 'space-between',
            }}
          >
            <Item label='Collection' value={data?.collectionCount} />
            <Item
              label='Historical Lent Out'
              value={Number(wei2Eth(data?.totalLoanPrincipal.toNumber() || ''))}
              isEth
            />
            <Item
              label='Total Value Locked'
              value={numeral(wei2Eth(data?.totalPoolAmount || '')).format(
                '0.00 a',
              )}
              isEth
            />
          </Flex>
        )} */}
      </Box>
      <Box
        w={{
          xs: '100%',
          sm: '326px',
          md: '440px',
        }}
        h={{
          xs: 'auto',
          sm: 'auto',
          md: '218px',
        }}
      >
        <Slider {...settings} className='custom-slider'>
          <Box
            w={{
              xs: '100%',
              sm: '326px',
              md: '440px',
            }}
            h={{
              xs: 'auto',
              sm: 'auto',
              md: '218px',
            }}
          >
            <ImageWithFallback
              src={img}
              preview={false}
              w={{
                xs: '100%',
                sm: '326px',
                md: '440px',
              }}
              h={{
                xs: 'auto',
                sm: 'auto',
                md: '218px',
              }}
            />
          </Box>
          {LENDING_SLIDER_IMAGES?.map((x) => {
            return (
              <Box
                key={x}
                w={{
                  xs: '100%',
                  sm: '326px',
                  md: '440px',
                }}
                h={{
                  xs: 'auto',
                  sm: 'auto',
                  md: '218px',
                }}
              >
                <ImageWithFallback
                  src={x}
                  preview={false}
                  w={{
                    xs: '100%',
                    sm: '326px',
                    md: '440px',
                  }}
                  h={{
                    xs: 'auto',
                    sm: 'auto',
                    md: '218px',
                  }}
                />
              </Box>
            )
          })}
        </Slider>
      </Box>
    </Flex>
  )
}

/**
 * 
 *  keys: [
              {
                label: 'Collections',
                value: '51',
              },
              {
                label: 'Historical Lent Out',
                value: (
                  <Flex alignItems={'center'}>
                    <SvgComponent svgId='icon-eth' height={8} />
                    <Heading fontSize={'3xl'}>1,859.8</Heading>
                  </Flex>
                ),
              },
              {
                label: 'Total Value Locked',
                value: '$1.35M',
              },
            ],
 */

export default AllPoolsDescription
