import { Image, type ImageProps } from '@chakra-ui/react'
import { PhotoView } from 'react-photo-view'

import defaultImg from 'assets/default.png'

import type { FunctionComponent } from 'react'

const ImageWithFallback: FunctionComponent<
  ImageProps & {
    preview?: boolean
  }
> = ({
  fallbackSrc = defaultImg,
  fit = 'cover',
  preview = true,
  alt = 'image',
  src,
  ...rest
}) => {
  if (preview) {
    return (
      <PhotoView
        src={src}
        key={src}>
        <Image
          cursor={'zoom-in'}
          alt={alt}
          src={src}
          fit={fit}
          {...rest}
          fallback={
            <Image
              src={fallbackSrc || defaultImg}
              alt={alt || 'fallback'}
              {...rest}
            />
          }
        />
      </PhotoView>
    )
  }
  return (
    <Image
      src={src}
      alt={alt}
      fit={fit}
      {...rest}
      fallback={
        <Image
          src={fallbackSrc || defaultImg}
          alt={alt || 'fallback'}
          {...rest}
        />
      }
    />
  )
}

export default ImageWithFallback
