import { extendTheme } from '@chakra-ui/react'

import breakpoints from './breakpoints'
import colors from './colors'
import components from './components'
import shadows from './shadows'
import styles from './styles'

const theme = extendTheme({
  breakpoints,
  styles,
  components,
  shadows,
  colors,
  zIndices: {
    // modal: 88,
    tooltip: 5501,
  },
})

export default theme
