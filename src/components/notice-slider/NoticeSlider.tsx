import {
  Button,
  Flex,
  Highlight,
  Text,
  type ButtonProps,
  type TextProps,
} from '@chakra-ui/react'
import { isEmpty } from 'lodash'
import { useNavigate } from 'react-router-dom'
import Slider from 'react-slick'

import SvgComponent from '../svg-component/SvgComponent'

import type { FunctionComponent } from 'react'

export type NoticeItemType = {
  title: string
  titleProps?: TextProps
  highlightTitle?: string
  button?: string
  buttonProps?: ButtonProps
  link?: string
  type: NotificationType
}

type NoticeSliderProps = {
  data?: NoticeItemType[]
}

const ItemWrapper: FunctionComponent<NoticeItemType> = ({
  title,
  buttonProps,
  titleProps,
  highlightTitle,
  link,
  button,
}) => {
  const navigate = useNavigate()
  return (
    <Flex
      alignItems={'center'}
      justify={'space-between'}
      h={{
        md: '36px',
        sm: '36px',
        xs: '36px',
      }}
      w='100%'>
      <Flex
        alignItems={'center'}
        gap={'4px'}
        flex={1}>
        <Text
          color='blue.1'
          fontSize={{
            md: '20px',
            sm: '12px',
            xs: '12px',
          }}
          fontWeight={'700'}
          lineHeight={{
            md: '38px',
            sm: '14px',
            xs: '14px',
          }}
          {...titleProps}>
          {highlightTitle ? (
            <Highlight
              query={highlightTitle}
              styles={{
                color: 'red.1',
              }}>
              {title}
            </Highlight>
          ) : (
            title
          )}
        </Text>
      </Flex>
      {button && link && (
        <Button
          px={{
            md: '20px',
            sm: '10px',
            xs: '10px',
          }}
          h={{
            md: '36px',
            sm: '24px',
            xs: '24px',
          }}
          variant={'primary'}
          fontSize={{
            md: '18px',
            sm: '12px',
            xs: '12px',
          }}
          borderRadius={{
            md: '8px',
            sm: '4px',
            xs: '4px',
          }}
          onClick={() => {
            navigate(link)
          }}
          {...buttonProps}>
          {button}
        </Button>
      )}
    </Flex>
  )
}

const NoticeSlider: FunctionComponent<NoticeSliderProps> = ({ data }) => {
  if (!data || isEmpty(data)) return null
  return (
    <Flex
      borderRadius={'8px'}
      borderWidth={1}
      borderColor={'blue.1'}
      px={{
        md: '24px',
        sm: '8px',
        xs: '8px',
      }}
      py={{
        md: '12px',
        sm: '4px',
        xs: '4px',
      }}
      bg='rgba(179, 179, 255, 0.20)'
      alignItems={'center'}>
      <SvgComponent
        svgId='icon-notice'
        fill={'red.1'}
        fontSize={{
          md: '24px',
          sm: '18px',
          xs: '18px',
        }}
        marginRight={'4px'}
      />
      {data.length === 1 ? (
        <ItemWrapper {...data[0]} />
      ) : (
        <Slider
          dots={false}
          arrows={false}
          infinite
          speed={500}
          lazyLoad='progressive'
          autoplay
          autoplaySpeed={5000}
          slidesToShow={1}
          slidesToScroll={1}
          pauseOnHover={true}
          // fade
          vertical>
          {data.map((i) => (
            <ItemWrapper
              {...i}
              key={i.title}
            />
          ))}
        </Slider>
      )}
    </Flex>
  )
}

export default NoticeSlider
