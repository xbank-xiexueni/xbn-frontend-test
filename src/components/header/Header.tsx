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
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionIcon,
  AccordionButton,
  AccordionPanel,
  chakra,
  Center,
  DrawerFooter,
  Divider,
} from '@chakra-ui/react'
import { useCallback, useMemo, useRef, type FunctionComponent } from 'react'
// import Jazzicon from 'react-jazzicon'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import Icon from '@/assets/logo.png'
import ImgWallet from '@/assets/wallet.png'
import { RESPONSIVE_MAX_W } from '@/constants'
import { useWallet } from '@/hooks'
import { formatAddress } from '@/utils/format'

import { ConnectWalletModal, SvgComponent } from '..'
import { COMMUNITY_DATA } from '../footer/Footer'

import AccountModal from './AccountModal'
import ConnectedWallet from './ConnectedWallet'

const LENDING_ROUTES = [
  {
    name: 'Collections',
    route: '/lending/collections',
  },
  {
    name: 'My Pools',
    route: '/lending/my-pools',
  },
  {
    name: 'Loans',
    route: '/lending/loans',
  },
]

const BUY_NFTS_ROUTES = [
  {
    name: 'Market',
    route: '/market',
  },
  {
    name: 'Repay Loans',
    route: '/loans',
  },
  {
    name: 'Loan History',
    route: '/history',
  },
]

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

const CommunityPopover = () => {
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
                color={visible ? 'blue.1' : 'black.1'}
                fontWeight='700'
                alignItems={'center'}
                cursor='pointer'>
                Community
                <SvgComponent
                  svgId={'icon-arrow-down'}
                  fill={
                    visible
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
              w={'140px'}
              top='16px'
              borderRadius={8}>
              <PopoverBody
                px={0}
                p={'20px'}>
                <Flex
                  flexDir={'column'}
                  gap='20px'>
                  {COMMUNITY_DATA.map(({ icon, title, url }) => (
                    <chakra.a
                      key={title}
                      href={url}
                      target='_blank'>
                      <Flex
                        borderBottomColor='gray.5'
                        alignItems={'center'}
                        gap='8px'
                        className='custom-hover-style'>
                        <SvgComponent
                          svgId={icon}
                          fill='gray.6'
                        />
                        <Text
                          fontSize='16px'
                          _hover={{
                            color: `blue.1`,
                          }}
                          color='black.1'>
                          {title}
                        </Text>
                      </Flex>
                    </chakra.a>
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
const MobileDrawBtn = ({
  handleClickWallet,
}: {
  handleClickWallet: () => void
}) => {
  const {
    isOpen: drawVisible,
    onOpen: openDraw,
    onClose: closeDraw,
  } = useDisclosure()
  // const activePath = useActivePath()
  const btnRef = useRef<HTMLButtonElement>(null)
  const { isConnected, handleDisconnect, currentAccount } = useWallet()

  return (
    <>
      {!isConnected ? (
        <Button
          flex={1}
          borderRadius={4}
          leftIcon={
            <Image
              src={ImgWallet}
              boxSize={'24px'}
            />
          }
          bg='transparent'
          iconSpacing={'4px'}
          py={'4px'}
          px='10px'
          onClick={handleClickWallet}
        />
      ) : (
        <Button
          flex={1}
          borderRadius={4}
          iconSpacing={'4px'}
          py={'4px'}
          bg='transparent'
          px='10px'
          onClick={handleDisconnect}>
          Disconnect
        </Button>
      )}
      <IconButton
        icon={
          <SvgComponent
            svgId='icon-expand1'
            svgSize={'20px'}
          />
        }
        ref={btnRef}
        aria-label=''
        onClick={openDraw}
        bg='white'
        paddingTop={'6px'}
        isDisabled={window.location.pathname === '/demo'}
      />
      <Drawer
        isOpen={drawVisible}
        placement='right'
        onClose={closeDraw}
        finalFocusRef={btnRef}>
        <DrawerOverlay
          bg='transparent'
          top={'4px'}
        />
        <DrawerContent maxW='100%'>
          <Box
            bg='linear-gradient(270deg, #E404E6 0%, #5843F4 53.65%, #1EF6F0 100%)'
            h={'1px'}
          />
          <DrawerCloseButton
            pt='40px'
            size={'24px'}
            mr='24px'
          />
          <DrawerHeader
            textAlign={'center'}
            mt='24px'>
            {isConnected && (
              <Flex
                alignItems={'center'}
                justify={'center'}
                gap={'8px'}>
                <Jazzicon
                  diameter={24}
                  seed={jsNumberForAddress(currentAccount?.address || '')}
                />
                {formatAddress(currentAccount?.address)}
              </Flex>
            )}
          </DrawerHeader>

          <DrawerBody mt='20px'>
            <Accordion>
              <AccordionItem border={'none'}>
                <AccordionButton>
                  <Box
                    as='span'
                    flex='1'
                    textAlign='left'
                    fontSize={'24px'}
                    fontWeight='700'>
                    Buy NFTs
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel
                  px={8}
                  py={'28px'}>
                  <Flex
                    flexDir={'column'}
                    gap={8}
                    onClick={closeDraw}>
                    {BUY_NFTS_ROUTES.map(({ name, route }) => (
                      <Link
                        to={route}
                        key={name}>
                        <Flex
                          fontSize='16px'
                          color='gray.3'>
                          {name}
                        </Flex>
                      </Link>
                    ))}
                  </Flex>
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem border={'none'}>
                <AccordionButton>
                  <Box
                    as='span'
                    flex='1'
                    textAlign='left'
                    fontSize={'24px'}
                    fontWeight='700'>
                    Lend
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel
                  px={8}
                  py={'28px'}>
                  <Flex
                    flexDir={'column'}
                    gap={8}
                    onClick={closeDraw}>
                    {LENDING_ROUTES.map(({ name, route }) => (
                      <Link
                        to={route}
                        key={name}>
                        <Flex
                          fontSize='16px'
                          color='gray.3'>
                          {name}
                        </Flex>
                      </Link>
                    ))}
                  </Flex>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem border={'none'}>
                <AccordionButton>
                  <Box
                    as='span'
                    flex='1'
                    textAlign='left'
                    fontSize={'24px'}
                    fontWeight='700'>
                    Community
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel
                  px={8}
                  py={'28px'}>
                  <Flex
                    flexDir={'column'}
                    gap={8}
                    onClick={closeDraw}>
                    {COMMUNITY_DATA.map(({ title, icon, url }) => (
                      <chakra.a
                        href={url}
                        key={title}>
                        <Flex
                          fontSize='16px'
                          color='gray.3'
                          alignItems={'center'}
                          gap={'4px'}>
                          <SvgComponent svgId={icon} />
                          {title}
                        </Flex>
                      </chakra.a>
                    ))}
                  </Flex>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>

            <Link
              to={'/my-assets'}
              hidden={!isConnected}>
              <Flex
                py={2}
                px={4}
                fontSize={'24px'}
                color={'black.1'}
                fontWeight={'700'}
                lineHeight={'2'}>
                My Assets
              </Flex>
            </Link>
            <chakra.a
              py={2}
              px={4}
              fontSize={'24px'}
              color={'black.1'}
              fontWeight={'700'}
              lineHeight={'2'}
              href={process.env.REACT_APP_DOCS_URL}
              target='_blank'>
              Docs
            </chakra.a>
          </DrawerBody>
          {isConnected && (
            <DrawerFooter>
              <Button
                flex={1}
                borderRadius={4}
                bg='gray.5'
                iconSpacing={'4px'}
                py={'4px'}
                px='10px'
                onClick={handleDisconnect}>
                Disconnect
              </Button>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}
const Header = () => {
  const { pathname } = useLocation()
  const activePath = useActivePath()

  const { isOpen, onClose, interceptFn, isConnected } = useWallet()
  const navigate = useNavigate()
  const handleClickWallet = useCallback(async () => {
    interceptFn(() => {})
  }, [interceptFn])

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
          navigate('/marketing-campaign')
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
                navigate('/marketing-campaign')
              }}
              alignItems={'center'}>
              <Image
                src='/gift.gif'
                style={{
                  width: '64px',
                  height: '64px',
                  marginTop: '-36px',
                  marginRight: '-14px',
                }}
              />
              <Text
                bgGradient={
                  'linear-gradient(223deg, #FF61AD 0%, #3385FF 52.60%, #641CFE 100%)'
                }
                bgClip='text'
                fontSize={'16px'}
                fontWeight={'900'}
                fontFamily={'HarmonyOS Sans SC Bold'}>
                Boxdrop
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
                onClick={() => interceptFn()}>
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
            {isConnected && <AccountModal />}
            <MobileDrawBtn handleClickWallet={handleClickWallet} />
          </Flex>
        </Flex>
      </Container>

      <ConnectWalletModal
        visible={isOpen}
        handleClose={onClose}
      />
    </Box>
  )
}

export default Header
