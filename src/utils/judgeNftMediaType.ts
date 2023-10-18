enum NFT_MEDIA_TYPE {
  HTML_MEDIA = 'HTML',
  VIDEO_MEDIA = 'VIDEO',
  IMAGE_MEDIA = 'IMAGE',
}

const judgeNftMediaType = (animation_url: string) => {
  try {
    if (
      animation_url &&
      !/\.(gif|jpg|jpeg|png|bmp|dib|rle|webp)$/.test(
        animation_url
          .toLowerCase()
          .replace(new URL(animation_url)?.search || '', ''),
      )
    ) {
      if (animation_url.includes('.html')) {
        return NFT_MEDIA_TYPE.HTML_MEDIA
      } else {
        return NFT_MEDIA_TYPE.VIDEO_MEDIA
      }
    }
    return NFT_MEDIA_TYPE.IMAGE_MEDIA
  } catch {
    return NFT_MEDIA_TYPE.IMAGE_MEDIA
  }
}

export { judgeNftMediaType, NFT_MEDIA_TYPE }
