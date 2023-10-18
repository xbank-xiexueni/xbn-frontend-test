import { Box, Img } from '@chakra-ui/react'
import random from 'lodash/random'
import { useEffect, useState } from 'react'

import StarDark from 'assets/star-dark.svg'
import StarLight from 'assets/star-light.svg'
import Star from 'assets/star.svg'

import './StarSky.scss'

const StarSky = () => {
  const [starList, setStarList] = useState<any[]>([])
  const [starLightList, setStarLightList] = useState<any[]>([])
  const [starDarkList, setStarDarkList] = useState<any[]>([])
  useEffect(() => {
    const list1 = []
    const list2 = []
    const list3 = []
    const width = document.body.clientWidth
    const height = document.body.clientHeight
    for (let i = 0; i < 30; i++) {
      const starStyle = {
        position: 'absolute',
        top: `${random(0, height, true)}px`,
        left: `${random(0, width, true)}px`,
        animationDelay: `${random(0, 5, true)}s`,
        key: i,
      }
      list1.push(starStyle)
      setStarList(list1)
    }
    for (let i = 0; i < 1000; i++) {
      const starStyle = {
        position: 'absolute',
        top: `${random(0, height, true)}px`,
        left: `${random(0, width, true)}px`,
        animationDelay: `${random(0, 5, true)}s`,
        key: i,
      }
      list2.push(starStyle)
      setStarLightList(list2)
    }
    for (let i = 0; i < 100; i++) {
      const starStyle = {
        position: 'absolute',
        top: `${random(0, height, true)}px`,
        left: `${random(0, width, true)}px`,
        animationDelay: `${random(0, 5, true)}s`,
        key: i,
      }
      list3.push(starStyle)
      setStarDarkList(list3)
    }
  }, [])
  return (
    <Box className='star-sky'>
      {starList.map((x) => {
        return (
          <Img
            width={'8px'}
            src={Star}
            style={x}
            className={'star-flash'}
            key={x.key}
          />
        )
      })}
      {starLightList.map((x) => {
        return (
          <Img
            width={'3px'}
            src={StarLight}
            key={x.key}
            style={x}
            className={random(0, 10) <= 5 ? 'star-flash' : ''}
          />
        )
      })}
      {starDarkList.map((x) => {
        return (
          <Img
            width={'6px'}
            src={StarDark}
            style={x}
            key={x.key}
            className={random(0, 10) <= 5 ? 'star-flash' : ''}
          />
        )
      })}
    </Box>
  )
}
export default StarSky
