import {
  Accordion,
  AccordionButton,
  Image,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  chakra,
  useDisclosure,
} from '@chakra-ui/react'
import { Link, LinkProps } from 'react-router-dom'
import { COMMUNITY_DATA } from 'components/footer/Footer'
import SvgComponent from 'components/svg-component/SvgComponent'
import { useWallet } from 'hooks'
import { PropsWithChildren, useRef } from 'react'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import { formatAddress } from 'utils/format'
import { BUY_NFTS_ROUTES, LENDING_ROUTES } from './constants'
import ImgWallet from 'assets/wallet.png'
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
      <IconButton
        icon={
          <SvgComponent
            svgId='icon-expand1'
            svgSize={'24px'}
          />
        }
        ref={btnRef}
        aria-label=''
        onClick={openDraw}
        bg='white'
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
              <CusAccordionItem
                name='Buy NFTs'
                closeDraw={closeDraw}>
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
              </CusAccordionItem>
              <CusAccordionItem
                name='Lend'
                closeDraw={closeDraw}>
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
              </CusAccordionItem>
              <CusAccordionItem
                name='Community'
                closeDraw={closeDraw}>
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
              </CusAccordionItem>
            </Accordion>
            <MyAssetsLink
              to={'/my-assets'}
              hidden={!isConnected}
            />
            <DocLink />
          </DrawerBody>
          <DrawerFooter>
            {/* <CusConnectWalletBtn
              isConnected={isConnected}
              handleClickWallet={handleClickWallet}
              handleDisconnect={handleDisconnect}
            /> */}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}
export default MobileDrawBtn

function CusConnectWalletBtn(props: {
  isConnected: boolean
  handleClickWallet: () => void
  handleDisconnect: () => void
}) {
  return (
    <>
      {/* <w3m-button /> */}
      {!props.isConnected ? (
        <Button
          flex={1}
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
          onClick={props.handleClickWallet}>
          Connect Wallet
        </Button>
      ) : (
        <Button
          flex={1}
          borderRadius={4}
          bg='gray.5'
          iconSpacing={'4px'}
          py={'4px'}
          px='10px'
          onClick={props.handleDisconnect}>
          Disconnect
        </Button>
      )}
    </>
  )
}

/**
 * 自定义样式手风琴按钮
 * */

function CusAccordionItem(
  props: {
    closeDraw: () => void
    name: string
  } & PropsWithChildren,
) {
  return (
    <AccordionItem border={'none'}>
      <AccordionButton>
        <Box
          as='span'
          flex='1'
          textAlign='left'
          fontSize={'24px'}
          fontWeight='700'>
          {props.name}
        </Box>
        <AccordionIcon />
      </AccordionButton>
      <AccordionPanel
        px={8}
        py={'28px'}>
        <Flex
          flexDir={'column'}
          gap={8}
          onClick={props.closeDraw}>
          {props.children}
        </Flex>
      </AccordionPanel>
    </AccordionItem>
  )
}

/**
 * 文档链接组件
 */
function DocLink() {
  return (
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
  )
}

/**
 * MyAssets入口链接组件
 */
function MyAssetsLink(props: LinkProps) {
  return (
    <Link {...props}>
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
  )
}
