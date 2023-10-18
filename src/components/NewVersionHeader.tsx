import { Box, Flex, Spacer, Image, Divider, Button } from '@chakra-ui/react'

import ImgWallet from 'assets/wallet.png'

import Logo from 'assets/logo.svg'

import AccountModal from './header/AccountModal'
import ConnectedWallet from './header/ConnectedWallet'

const NewVersionHeader = (props: {
  isConnected: boolean
  interceptFn: any
}) => {
  // const { isConnected, interceptFn } = useWallet()
  return (
    <Flex
      className='new-version-header'
      h={'72px'}
      alignItems={'center'}
      padding={'12px 124px 12px 108px'}>
      <a
        href='https://www.xbank.plus/'
        target='_blank'
        rel='noreferrer'>
        <Image
          h={'25px'}
          w={'127px'}
          src={Logo}
        />
      </a>

      <Spacer />
      <Box
        // w='400px'
        paddingX={'20px'}
        h='48px'
        borderRadius={'32px'}
        border={'1px solid rgba(255, 255, 255, 0.08)'}
        // bg={'rgba(255, 255, 255, 0.2)'}
        bg={'rgba(45, 45, 45, 0.8)'}
        justifyContent={'space-around'}
        alignItems={'center'}
        display='flex'>
        <Box
          as={'button'}
          className={`${
            window?.location.pathname === '/newcomer' ? 'active' : 'inactive'
          } nav-button`}
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.pathname = '/newcomer'
            }
          }}>
          Newly Rich Rewards
          <Box className='nav-button-active-line' />
        </Box>
        <Box
          as={'button'}
          className={`${
            window?.location.pathname === '/marketing-campaign'
              ? 'active'
              : 'inactive'
          } nav-button`}
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.pathname = '/marketing-campaign'
            }
          }}>
          Boxdrop
          <Box className='nav-button-active-line' />
        </Box>
      </Box>
      <Spacer />
      <Box>
        {props.isConnected ? (
          <Flex
            alignItems={'center'}
            bg='rgba(255, 255, 255, 0.08)'
            borderRadius={100}
            border={'1px solid rgba(255, 255, 255, 0.2)'}>
            <AccountModal
              dark
              disableToggle
            />
            <Divider
              orientation='vertical'
              borderColor={'black.1'}
              h='24px'
              opacity={1}
            />
            <ConnectedWallet dark />
          </Flex>
        ) : (
          <Button
            borderRadius={'8px'}
            border={'1px solid rgba(255, 255, 255, 0.08)'}
            leftIcon={
              <Image
                src={ImgWallet}
                boxSize={'24px'}
              />
            }
            bg='rgba(255, 255, 255, 0.08)'
            color={'#FFFFFF'}
            iconSpacing={'4px'}
            py={'4px'}
            px='10px'
            onClick={() => props.interceptFn()}
            _hover={{ background: 'rgba(255, 255, 255, 0.2)' }}>
            Connect Wallet
          </Button>
        )}
      </Box>
      {/* <Image h={'25px'} w={'127px'} src={Logo} opacity={0} /> */}
    </Flex>
  )
}

export default NewVersionHeader
