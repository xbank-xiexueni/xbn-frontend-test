import { Flex, Text, Image, type FlexProps } from '@chakra-ui/react'
import { useMemo, type FunctionComponent, type ReactNode } from 'react'

import GifReward from 'assets/collection-tag.gif'
import ImgTagCrown from 'assets/tag-crown.png'
import ImgTagDiamond from 'assets/tag-diamond.png'
import ImgTagFire from 'assets/tag-fire.png'
import ImgTagLike from 'assets/tag-like.png'
import ImgTagStar from 'assets/tag-star.png'

/**
 *
 * 判断 tag 的文案：
 * 包含 'box rewards'  => 五角星
 * 包含 'trending' => 火
 * 包含 'interest' => 皇冠
 * 包含 'down payment' => 点赞
 * 包含 'new'  或者 包含 'long term' => 钻石
 * 包含 20 USD reward => GifReward
 * @returns
 */

const CollectionTag: FunctionComponent<
  FlexProps & {
    icon?: ReactNode
    title?: string
  }
> = ({ children, title, icon, ...rest }) => {
  const src = useMemo(() => {
    if (title?.toLowerCase()?.includes('box rewards')) return ImgTagStar
    if (title?.toLowerCase()?.includes('trending')) return ImgTagFire
    if (title?.toLowerCase()?.includes('interest')) return ImgTagCrown
    if (title?.toLowerCase()?.includes('down payment')) return ImgTagLike
    if (title?.toLowerCase()?.includes('20 usd reward')) return GifReward
    return ImgTagDiamond
  }, [title])

  const isSecondary = useMemo(
    () => title?.toLowerCase()?.includes('20 usd reward'),
    [title],
  )
  if (!children && !title) return null
  return (
    <Flex
      pr={{
        md: '4px',
        sm: 0,
        xs: 0,
      }}
      gap={{
        md: isSecondary ? '0' : '4px',
        sm: 0,
        xs: 0,
      }}
      height={'20px'}
      borderWidth={1}
      borderColor={isSecondary ? 'blue.1' : 'blue.4'}
      alignItems={'center'}
      borderRadius={4}
      bg={
        isSecondary
          ? 'white'
          : 'conic-gradient(from 189deg at 75.95% 6.03%, rgba(255, 255, 255, 0.20) 0deg, rgba(255, 255, 255, 0.00) 360deg), linear-gradient(90deg, #4A40FF 0%, #ADA6FF 100%)'
      }
      {...rest}>
      {!!src ? (
        <Image
          src={src}
          alt=''
          w={{
            md: isSecondary ? '22px' : '18px',
            sm: '14px',
            xs: '14px',
          }}
        />
      ) : !!icon ? (
        icon
      ) : null}
      {!!children ? (
        children
      ) : (
        <Text
          textShadow={isSecondary ? '' : '0px 0.6000000238418579px 0px #0F00ED'}
          fontSize={'12px'}
          fontFamily={'HarmonyOS Sans SC Bold'}
          color={isSecondary ? 'blue.1' : 'white'}
          lineHeight={'20px'}
          transform={{
            md: 'none',
            sm: 'scale(0.83333)',
            xs: 'scale(0.83333)',
          }}
          transformOrigin={'center'}
          noOfLines={1}
          fontWeight={isSecondary ? '700' : '400'}
          w='100%'>
          {title}
        </Text>
      )}
    </Flex>
  )
}

export default CollectionTag
