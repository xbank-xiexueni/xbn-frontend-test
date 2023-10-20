import {
  Box,
  Image,
  Flex,
  Text,
  Button,
  Container,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  chakra,
  Center,
  Divider,
  Img,
  GenericAvatarIcon,
  Spinner,
} from '@chakra-ui/react'
import { useLocalStorageState, useRequest } from 'ahooks'
import get from 'lodash/get'
import {
  useCallback,
  useMemo,
  type FunctionComponent,
  useEffect,
  useState,
  useRef,
} from 'react'
// import Jazzicon from 'react-jazzicon'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { apiGetBoxes } from 'api/marketing-campaign'
import Icon from 'assets/logo.png'
import ImgWallet from 'assets/wallet.png'
import { RESPONSIVE_MAX_W } from 'constants/index'
import { useWallet } from 'hooks'

import { ConnectWalletModal, SvgComponent } from '..'

import AccountModal from './AccountModal'
import ConnectedWallet from './ConnectedWallet'
import { BUY_NFTS_ROUTES, LENDING_ROUTES } from './constants'
import MobileDrawBtn from './MobileDrawBtn'
import CommunityPopover from './CommunityPopover'
import UserPng from 'assets/user.png'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect, useSignMessage } from 'wagmi'
import { CloseIcon } from '@chakra-ui/icons'
import { apiPostAuthChallenge, apiPostAuthLogin } from 'api/user'
import moment from 'moment'

const useActivePath = () => {
  const { pathname } = useLocation()

  return useMemo((): 'lending' | 'buy-nfts' | 'sell-nfts' | '' => {
    if (pathname.startsWith('/lending')) {
      return 'lending'
    }
    if (
      pathname.startsWith('/market') ||
      pathname.startsWith('/loans') ||
      pathname.startsWith('/history')
    ) {
      return 'buy-nfts'
    }
    if (pathname.startsWith('/sell-nfts')) {
      return 'sell-nfts'
    }
    return ''
  }, [pathname])
}

const PopoverWrapper: FunctionComponent<{
  routes: { name: string; route: string }[]
  pageName: string
  isActive: boolean
}> = ({ routes, pageName, isActive }) => {
  return (
    <Popover
      isLazy
      trigger='hover'
      placement='bottom-start'>
      {({ isOpen: visible }) => {
        return (
          <>
            <PopoverTrigger>
              <Flex
                fontSize='16px'
                px={0}
                gap={'4px'}
                _focus={{ bg: 'transparent' }}
                _hover={{
                  bg: 'transparent',
                  color: 'var(--chakra-colors-blue-1)',
                }}
                color={isActive || visible ? 'blue.1' : 'black.1'}
                fontWeight='700'
                alignItems={'center'}
                cursor='pointer'>
                {pageName}
                <SvgComponent
                  svgId={'icon-arrow-down'}
                  fill={
                    isActive || visible
                      ? 'var(--chakra-colors-blue-1)'
                      : 'var(--chakra-colors-black-1)'
                  }
                  transition='all 0.2s'
                  transform={`rotate(${visible ? '180deg' : '0deg'})`}
                  mt='2px'
                />
              </Flex>
              {/* </Link> */}
            </PopoverTrigger>
            <PopoverContent
              w={48}
              top='16px'
              borderRadius={8}>
              <PopoverBody
                px={0}
                p={'20px'}>
                <Flex
                  flexDir={'column'}
                  gap='20px'>
                  {routes.map((item) => (
                    <Link
                      to={item.route}
                      key={item.name}>
                      <Flex
                        borderBottomColor='gray.5'
                        flexDir='column'>
                        <Text
                          fontSize='16px'
                          _hover={{
                            color: `blue.1`,
                          }}
                          color='black.1'>
                          {item.name}
                        </Text>
                      </Flex>
                    </Link>
                  ))}
                </Flex>
              </PopoverBody>
            </PopoverContent>
          </>
        )
      }}
    </Popover>
  )
}

const CHAKRA_A_PROPS = {
  fontSize: '16px',
  px: 0,
  _focus: { bg: 'transparent' },
  _hover: {
    bg: 'transparent',
    color: 'var(--chakra-colors-blue-1)',
  },
  color: 'black.1',
  fontWeight: '700',
  alignItems: 'center',
  cursor: 'pointer',
}

const Header = () => {
  const { pathname } = useLocation()
  const activePath = useActivePath()

  const { isOpen, onClose, interceptFn, isConnected, currentAccount } =
    useWallet()
  const navigate = useNavigate()
  const handleClickWallet = useCallback(async () => {
    interceptFn(() => {})
  }, [interceptFn])
  const [needNotice, setNeedNotice] = useState<boolean>(false)
  const { run: queryBox } = useRequest(apiGetBoxes, {
    manual: true,
    onSuccess(data) {
      // console.log('currentAccount is', currentAccount?.address)
      if (typeof window !== 'undefined') {
        const totalBoxCount =
          get(data, 'box_bronze', 0) +
          get(data, 'box_diamond', 0) +
          get(data, 'box_gold', 0) +
          get(data, 'box_platinum', 0) +
          get(data, 'box_silver', 0)
        const localBoxCount = +(
          localStorage.getItem(`box-counter-${currentAccount?.address}`) || 0
        )
        if (totalBoxCount !== localBoxCount) {
          console.log('需要提示')
          setNeedNotice(true)
          localStorage.setItem(
            `box-counter-${currentAccount?.address}`,
            `${totalBoxCount}`,
          )
        } else {
          console.log('不需要提示')
          setNeedNotice(false)
          localStorage.setItem(
            `box-counter-${currentAccount?.address}`,
            `${totalBoxCount}`,
          )
        }
      }
    },
    onError(err) {
      console.log(err)
    },
  })
  useEffect(() => {
    queryBox()
  }, [currentAccount, queryBox])
  const { open: openWeb3Modal } = useWeb3Modal()
  return (
    <Box
      position={'sticky'}
      top={0}
      zIndex={22}
      borderBottomColor='rgba(0, 0, 0, 0.05)'
      borderBottomWidth={1}
      bg='white'>
      <Box
        bgGradient={
          'linear-gradient(90.6deg, #1CEFFF 0.34%, #5FCCFF 50.24%, #FFC1CB 98.09%)'
        }
        cursor={'pointer'}
        paddingY={'14px'}
        onClick={() => {
          // navigate('/marketing-campaign')
          // navigate('/newcomer')
          if (typeof window !== 'undefined') {
            window.open('/newcomer', '_blank')
          }
        }}>
        <Center>
          <Text
            color='#FFFFFF'
            fontFamily={'HarmonyOS Sans SC Bold'}>
            Boxdrop Earning is Now LIVE!
          </Text>
        </Center>
      </Box>
      <Box
        bg='linear-gradient(270deg, #E404E6 0%, #5843F4 53.65%, #1EF6F0
      100%)'
        h={{ md: 1, sm: '1px', xs: '1px' }}
      />
      <Container
        bg='white'
        maxW={{ ...RESPONSIVE_MAX_W }}
        px={0}>
        <Flex
          justify={'space-between'}
          h={{
            md: 74,
            sm: '56px',
            xs: '56px',
          }}
          alignItems='center'>
          <Flex
            alignItems={'center'}
            onClick={() => {
              if (pathname === '/demo') return
              window.open(process.env.REACT_APP_WEBSITE)
            }}
            cursor='pointer'>
            <Flex
              gap={'8px'}
              alignItems='center'>
              <Image
                src={Icon}
                h={{
                  md: 25,
                  xs: '20px',
                  sm: '20px',
                }}
                alt='icon'
                loading='lazy'
              />
            </Flex>
          </Flex>

          <Flex
            display={{
              xs: 'none',
              sm: 'none',
              md: 'none',
              lg: 'flex',
            }}
            gap='40px'
            hidden={pathname === '/demo'}>
            <PopoverWrapper
              isActive={activePath === 'buy-nfts'}
              routes={BUY_NFTS_ROUTES}
              pageName='Buy NFTs'
            />
            <PopoverWrapper
              isActive={activePath === 'lending'}
              routes={LENDING_ROUTES}
              pageName='Lend'
            />
            <chakra.a
              {...CHAKRA_A_PROPS}
              href={process.env.REACT_APP_DOCS_URL}
              target='_blank'>
              Docs
            </chakra.a>
            <CommunityPopover />
          </Flex>

          <Flex
            gap='24px'
            alignItems='center'
            display={{
              xs: 'none',
              sm: 'none',
              md: 'none',
              lg: 'flex',
            }}
            cursor='pointer'>
            <Flex
              onClick={() => {
                // navigate('/marketing-campaign')
                if (typeof window !== 'undefined') {
                  window.open('/newcomer', '_blank')
                }
              }}
              alignItems={'center'}>
              {needNotice ? (
                <Image
                  src='/gift.gif'
                  style={{
                    width: '64px',
                    height: '64px',
                    marginTop: '-36px',
                    marginRight: '-14px',
                  }}
                />
              ) : (
                <Image
                  src='/gift.png'
                  style={{
                    width: '32px',
                    height: '32px',
                    marginTop: '-5px',
                    marginRight: '10px',
                  }}
                />
              )}
              <Text
                bgGradient={
                  'linear-gradient(223deg, #FF61AD 0%, #3385FF 52.60%, #641CFE 100%)'
                }
                bgClip='text'
                fontSize={'16px'}
                fontWeight={'900'}
                fontFamily={'HarmonyOS Sans SC Bold'}>
                Rewards
              </Text>
            </Flex>
            {isConnected ? (
              <Flex
                alignItems={'center'}
                bg='gray.5'
                borderRadius={4}>
                <AccountModal />
                <Divider
                  orientation='vertical'
                  borderColor={'black.1'}
                  h='24px'
                  opacity={1}
                />
                <ConnectedWallet />
              </Flex>
            ) : (
              <Button
                borderRadius={4}
                leftIcon={
                  <Image
                    src={ImgWallet}
                    boxSize={'24px'}
                  />
                }
                bg='gray.5'
                iconSpacing={'4px'}
                py={'4px'}
                px='10px'
                // onClick={() => interceptFn()}
                onClick={() => {
                  openWeb3Modal()
                }}>
                Connect Wallet
              </Button>
            )}
          </Flex>

          {/*  移动端 */}
          <Flex
            gap={{
              md: '20px',
              sm: '4px',
              xs: '4px',
            }}
            display={{
              xs: 'flex',
              sm: 'flex',
              md: 'flex',
              lg: 'none',
            }}>
            <CusBtnUser />
            {/* <CusMobileGiftIcon /> */}
            {/* {isConnected && <AccountModal />} */}
            <MobileDrawBtn handleClickWallet={handleClickWallet} />
          </Flex>
        </Flex>
      </Container>

      {/* <ConnectWalletModal
        visible={isOpen}
        handleClose={onClose}
      /> */}
    </Box>
  )
}

export default Header

function CusBtnUser() {
  const { setCurrentAccount } = useWallet()
  const { open: openWeb3Modal } = useWeb3Modal()
  const refLoginMsg = useRef('')
  const { run: login } = useRequest(apiPostAuthLogin, {
    manual: true,
    onSuccess(data) {
      console.log('登录成功: ', JSON.stringify(data, null, 2))
      // alert('登录成功 token: ' + data.token)
      if (typeof window !== 'undefined') {
        alert('登录成功 token: ' + data.token)
        setCurrentAccount({ ...data, address: address })
      }
    },
  })
  const { signMessage } = useSignMessage({
    onSuccess(data) {
      console.log('sign message success data is:', data)
      alert('签名信息: ' + data)
      console.log(
        '登录参数:',
        JSON.stringify(
          {
            address: address as string,
            message: refLoginMsg.current,
            signature: data,
          },
          null,
          2,
        ),
      )
      login({
        address: address as string,
        message: refLoginMsg.current,
        signature: data,
      })
    },
    onError(error) {
      alert('签名错误: ' + error.message)
    },
  })
  // apiPostAuthLogin({
  //   address: address,
  //   message: loginMessage,
  //   signature: signedLoginMessage,
  // }).then((resp) => {
  //   console.log(resp)
  //   setExpires(resp.expires)
  //   setToken(resp.token)
  // })
  const { run: getLoginMessage, loading: getLoginMessageLoading } = useRequest(
    apiPostAuthChallenge,
    {
      manual: true,
      onSuccess(data) {
        console.log('apiPostAuthChallenge data is:', data)
        if (data.login_message) {
          signMessage({
            message: data.login_message,
          })
          refLoginMsg.current = data.login_message
        }
      },
    },
  )
  const { isConnected, isConnecting, address } = useAccount({
    onConnect({ address, connector, isReconnected }) {
      if (typeof window !== 'undefined') {
        const connectAccountLocalStorageStr =
          window.localStorage.getItem('connect-account')
        if (
          typeof connectAccountLocalStorageStr === 'string' &&
          connectAccountLocalStorageStr !== ''
        ) {
          const info = JSON.parse(connectAccountLocalStorageStr)
          const expires = moment(info.expires)
          if (expires.isBefore(moment.now())) {
            window.localStorage.removeItem('connect-account')
            console.log('connect to address:', address)
            console.log('connector is:', connector)
            console.log('is reconnected:', isReconnected)
            getLoginMessage(address as string)
          }
        } else {
          window.localStorage.removeItem('connect-account')
          console.log('connect to address:', address)
          console.log('connector is:', connector)
          console.log('is reconnected:', isReconnected)
          getLoginMessage(address as string)
        }
      }
    },
    onDisconnect() {
      alert('disconnected')
    },
  })
  const { disconnect, isLoading: disconnectIsLoading } = useDisconnect({
    onSuccess(context) {
      console.log('disconnect success context is:', context)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('connect-account')
      }
    },
    onError(e) {
      alert('on error message is: ' + e.message)
    },
    onSettled(error, context) {
      console.log('on settled error:', error)
      console.log('on settled context:', context)
      // alert('on settled error message is: ' + error?.message)
    },
  })
  if (isConnected) {
    return (
      <Box
        display={'flex'}
        alignItems={'center'}>
        <Text
          // wordBreak={'keep-all'}
          whiteSpace={'nowrap'}
          width={'100px'}
          fontSize={'12px'}
          noOfLines={1}>
          {address}
        </Text>
        <Button
          variant={'plain'}
          onClick={() => {
            disconnect()
          }}>
          <CloseIcon />
        </Button>
      </Box>
    )
  }
  return (
    <Button
      variant={'plain'}
      onClick={() => {
        openWeb3Modal()
      }}>
      {/* <Img src={UserPng} /> */}
      <Image
        src={ImgWallet}
        boxSize={'24px'}
      />
    </Button>
  )
}

function CusMobileGiftIcon() {
  const navigate = useNavigate()
  return (
    <Flex
      cursor='pointer'
      onClick={() => {
        navigate('/marketing-campaign')
      }}
      alignItems={'center'}
      marginRight={'-16px'}>
      <Image
        src='/gift.gif'
        style={{
          width: '64px',
          height: '64px',
          marginTop: '-30px',
        }}
      />
    </Flex>
  )
}
