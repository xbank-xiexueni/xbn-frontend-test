import { Container, type ContainerProps } from '@chakra-ui/react'

import { Footer, Header, LendingRemind } from 'components'
import { RESPONSIVE_MAX_W } from 'constants/index'

const RootLayout: React.FC<ContainerProps> = ({ children, ...rest }) => {
  return (
    <>
      <LendingRemind />
      <Header />
      <Container
        maxW={RESPONSIVE_MAX_W}
        minH={'calc(100vh - 440px)'}
        px={0}
        {...rest}>
        {children}
      </Container>
      <Footer />
    </>
  )
}

export default RootLayout
