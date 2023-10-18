import { CopyIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  Container,
  Icon,
  Img,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Text,
  Tooltip,
  useClipboard,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { useRequest, useSetState } from 'ahooks'
import get from 'lodash/get'
import { useEffect, useState } from 'react'

import {
  apiBanbanStats,
  apiClaimBanBanPassCard,
  apiGetBanBanMissionStatus,
} from 'api/new-comer'
import ImgClaimedCard from 'assets/claimed-card.png'
import Earth from 'assets/earth.png'
import IconTelegram from 'assets/icon-telegram.png'
import IconTwitter from 'assets/icon-twitter.png'
import IconCopy from 'assets/marketing/icon-copy.png'
import NewComerDesc from 'assets/new-comer-desc.png'
import NewComerBanner from 'assets/newcomer-banner.png'
import NewComerTitle from 'assets/newcomer-title.png'
import ProgressImg from 'assets/progress.png'
import NewVersionHeader from 'components/NewVersionHeader'
import StarSky from 'components/StarSky'
// import requestToken from 'utils/requestToken'
import ConnectWalletModal from 'components/connect-wallet-modal/ConnectWalletModal'
import { useWallet } from 'hooks'

import IconBanBan from './IconBanBan'
import IconDot from './IconDot'
import MissionBlackboard from './MissionBlackboard'
import MissionBox from './MissionBox'
import MissionButton from './MissionButton'
import MissionOneTitle from './MissionOneTitle'
import MissionTwoTitle from './MissionTwoTitle'

import type { ButtonProps, TextProps } from '@chakra-ui/react'
const SHARE_TELEGRAM_TEXT = `Buy NFT pay later with 0% down payment, win Boxdrop`
const SHARE_TWITTER_TEXT = `xBank is An NFT Open Money Market Powering Web3 Adopters with Onboarding Leverage with NFT BNPL and Improving Money Efficiency for Holders\nJoin @xBank_Official, buy top NFTs pay later, with 0% downpayment, and earn Boxdrop`
export default function NewComer() {
  const toast = useToast()
  const {
    isOpen: claimNoticeDialogVisible,
    onOpen: openClaimedNotice,
    onClose: closeClaimedNotice,
  } = useDisclosure()
  const [remaining, setRemaining] = useSetState({
    daily_supply_nft: '-',
    // total_pass_cards: '-',
  })
  const { run: getStat } = useRequest(apiBanbanStats, {
    manual: true,
    onSuccess(data) {
      // console.log('hello data,', data)
      setRemaining({
        daily_supply_nft: `${data?.remaining?.daily_supply_nft}`,
        // total_pass_cards: `${data?.remaining?.total_pass_cards}`,
      })
    },
  })
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('newly-dialog-disabled', 'true') // 从活动页面到其他页面，标记不需要弹出活动弹窗
    }
    getStat()
  }, [getStat])
  const { loading: claimLoading, run: claim } = useRequest(
    apiClaimBanBanPassCard,
    {
      manual: true,
      onSuccess(data) {
        if (data.status === 'ok') {
          openClaimedNotice()
        } else {
          toast({
            title: 'fail',
            status: 'error',
          })
        }
      },
      onError(e) {
        console.log('claim error is:', e)
      },
    },
  )
  const { isOpen, onClose, interceptFn, isConnected, onOpen } = useWallet()
  const [state, setState] = useSetState({
    buy_banban: 0,
    sell_banban: 0,
    create_pool_for_banban: 0,
    banban_loan_issued: 0,
    pass_card_remaining_amount: 0,
  })
  const { run: queryMissionInfo } = useRequest(apiGetBanBanMissionStatus, {
    manual: true,
    onSuccess(resp) {
      const banban_loan_issued = get(resp.data, 'banban_loan_issued', 0)
      const buy_banban = get(resp.data, 'buy_banban', 0)
      const create_pool_for_banban = get(resp.data, 'create_pool_for_banban', 0)
      const sell_banban = get(resp.data, 'sell_banban', 0)
      const pass_card_remaining_amount = get(
        resp.data,
        'pass_card_remaining_amount',
        0,
      )
      setState({
        banban_loan_issued,
        buy_banban,
        create_pool_for_banban,
        sell_banban,
        pass_card_remaining_amount,
      })
    },
    onError(e: any) {
      if (e.code === 'unauthenticated') {
        console.log('需要连接钱包')
        interceptFn(() => {})
      }
    },
  })
  useEffect(() => {
    queryMissionInfo()
  }, [queryMissionInfo])
  const [gotItClicked, setGotItClicked] = useState(false)
  const handleCloseNotice = () => {
    closeClaimedNotice()
    setGotItClicked(true)
  }
  const {
    onCopy,
    hasCopied,
    value: invitationLink,
    setValue: setInvitationLink,
  } = useClipboard(window?.location.href)
  const {
    isOpen: shareDialogVisible,
    onClose: closeShareDialog,
    onOpen: openShareDialog,
  } = useDisclosure()
  return (
    <div className='sky-body'>
      <ConnectWalletModal
        visible={isOpen}
        handleClose={onClose}
      />
      <StarSky />
      <div className='home-page'>
        <NewVersionHeader
          isConnected={isConnected}
          interceptFn={interceptFn}
        />
        <Box>
          <Img
            marginTop={'-72px'}
            maxWidth={'100%'}
            w={'100%'}
            src={NewComerBanner}
          />
          <Img
            src={NewComerTitle}
            w={'931px'}
            position={'absolute'}
            top={'100px'}
            left={'50%'}
            transform={'translateX(-50%)'}
          />
          <Img
            src={NewComerDesc}
            w={'945px'}
            position={'absolute'}
            top={'210px'}
            left={'50%'}
            transform={'translateX(-50%)'}
          />
        </Box>
        <Box
          display={'flex'}
          alignItems={'center'}
          flexDir={'column'}>
          <Img
            w={'1440px'}
            mb={'20px'}
            position={'relative'}
            src={ProgressImg}
          />
        </Box>
        <Container
          minH={'100vh'}
          padding={0}
          centerContent
          maxW={{
            sm: 666,
            md: 900,
            lg: 1200,
          }}>
          <Img
            w={'1430px'}
            src={Earth}
            position={'absolute'}
            bottom={0}
            right={0}
            opacity={0.3}
          />
          <Box>
            <Box
              className='tip-bg'
              w={'1200px'}
              h={'118px'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'space-between'}
              // bg='#1D1C20'
              // border={'1px solid rgba(255, 255, 255, 0.10)'}
              borderRadius={'24px'}
              px={'64px'}
              mb={'70px'}>
              <Box marginLeft={'20px'}>
                <CounterDesc
                  desc='Available for Down Payment Today'
                  num={remaining.daily_supply_nft}
                />
              </Box>
              <CounterDesc
                desc='Eligibilities Left for Minting Pass Card'
                num={state.pass_card_remaining_amount + ''}
              />
              <Button
                variant={'unstyled'}
                onClick={() => {
                  openShareDialog()
                }}>
                <MissionButton
                  status='active'
                  title='Share'
                  width='160px'
                />
              </Button>
            </Box>
            <MissionOneTitle />
            <MissionBlackboard
              boxProps={{
                marginBottom: '70px',
              }}>
              <MissionBox
                title='Buy BanBan'
                boxProps={{
                  marginBottom: '40px',
                }}>
                <Box
                  display={'flex'}
                  alignItems={'center'}>
                  <IconBanBan marginRight={'8px'} />
                  <MissionDescText>
                    Buy BanBan Now with a 10% Down Payment, Pay Later.
                  </MissionDescText>
                </Box>
                <Box>
                  <MissionButton
                    status={state.buy_banban === 0 ? 'active' : 'complete'}
                    title={state.buy_banban === 0 ? 'Buy BanBan' : 'Completed'}
                    width='368px'
                    disabled={state.buy_banban !== 0}
                    onClick={() => {
                      if (!isConnected) {
                        onOpen()
                      } else {
                        if (typeof window !== 'undefined') {
                          window.location.href = `/market/${process.env.REACT_APP_BANBAN_COLLECTION_ADDRESS}`
                        }
                      }
                    }}
                  />
                </Box>
              </MissionBox>
              <MissionBox
                title='Sell BanBan'
                boxProps={{
                  marginBottom: '40px',
                }}>
                <Box
                  display={'flex'}
                  alignItems={'center'}>
                  <IconBanBan marginRight={'8px'} />
                  <MissionDescText>
                    List your BanBan without the necessity of repayment.
                  </MissionDescText>
                </Box>
                <Box>
                  <MissionButton
                    status={
                      state.sell_banban === 1
                        ? 'complete'
                        : state.buy_banban === 0
                        ? 'pending'
                        : 'active'
                    }
                    title={
                      state.buy_banban === 0
                        ? 'Pending'
                        : state.sell_banban === 0
                        ? 'List NFT'
                        : 'Completed'
                    }
                    width='368px'
                    disabled={state.buy_banban === 0 || state.sell_banban === 1}
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.location.href = `/my-assets`
                      }
                    }}
                  />
                </Box>
              </MissionBox>
              <MissionBox title='Check Order'>
                <Box
                  display={'flex'}
                  alignItems={'center'}>
                  <IconBanBan marginRight={'8px'} />
                  <MissionDescText>
                    Check &apos;Sale&apos; page for listing status, and earn $20
                    once NFT is sold.
                  </MissionDescText>
                </Box>
                <Box>
                  <BlueButton
                    buttonProps={{
                      onClick: () => {
                        if (typeof window !== 'undefined') {
                          window.location.href = '/history/sale'
                        }
                      },
                    }}>
                    View
                  </BlueButton>
                </Box>
              </MissionBox>
            </MissionBlackboard>
            <MissionTwoTitle />
            <MissionBlackboard
              boxProps={{
                marginBottom: '40px',
              }}>
              <MissionBox
                title='Create Offer For BanBan'
                longTitle={true}
                boxProps={{
                  marginBottom: '40px',
                }}>
                <Box
                  display={'flex'}
                  alignItems={'center'}>
                  <IconDot marginRight={'8px'} />
                  <MissionDescText>
                    Earn interest by approving wETH quota without freezing
                    funds.
                  </MissionDescText>
                </Box>
                <Box>
                  <MissionButton
                    title={
                      state.create_pool_for_banban === 1
                        ? 'Completed'
                        : 'Create Offer'
                    }
                    width='368px'
                    status={
                      state.create_pool_for_banban === 1 ? 'complete' : 'active'
                    }
                    disabled={state.create_pool_for_banban === 1}
                    onClick={() => {
                      if (!isConnected) {
                        onOpen()
                      } else {
                        if (typeof window !== 'undefined') {
                          window.location.href = `/lending/create/${process.env.REACT_APP_BANBAN_COLLECTION_ADDRESS}?from=campaign`
                        }
                      }
                    }}
                  />
                </Box>
              </MissionBox>
              <MissionBox
                title='Lending offer Accepted'
                longTitle={true}>
                <Box
                  display={'flex'}
                  alignItems={'center'}>
                  <IconDot marginRight={'8px'} />
                  <MissionDescText>
                    Once your offer is accepted, you join the whitelist of xPass
                    card.
                  </MissionDescText>
                </Box>
                <Box>
                  <MissionButton
                    title={
                      state.banban_loan_issued === 0
                        ? 'Pending'
                        : state.create_pool_for_banban === 1
                        ? state.banban_loan_issued === 2 || gotItClicked
                          ? 'Completed'
                          : 'Complete'
                        : 'Pending'
                    }
                    status={
                      state.banban_loan_issued === 0
                        ? 'pending'
                        : state.create_pool_for_banban === 1
                        ? state.banban_loan_issued === 2 || gotItClicked
                          ? 'complete'
                          : 'active'
                        : 'pending'
                    }
                    width='368px'
                    disabled={state.banban_loan_issued !== 1 || gotItClicked}
                    onClick={() => {
                      claim()
                    }}
                  />
                </Box>
              </MissionBox>
            </MissionBlackboard>
            {/* <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              mb={'40px'}
            >
              <Box className='create-offer-for-banban-card'>
                <Box
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'flex-start'}
                  mt={'30px'}
                >
                  <Box className='dot' mr={'10px'} />
                  <Text
                    color={'#FFFFFF'}
                    fontSize={'18px'}
                    fontWeight={700}
                    fontFamily={'HarmonyOS Sans SC'}
                    w={'532px'}
                  >
                    Approve a certain amount wETH quota, your offer will start
                    to earn interest when your wETH is being borrowed by buyers.
                  </Text>
                </Box>
                <Box mt={'20px'}>
                  <MissionButton
                    title='Create Offer'
                    width='368px'
                    disabled={state.create_pool_for_banban === 1}
                    onClick={() => {
                      if (!isConnected) {
                        onOpen()
                      } else {
                        if (typeof window !== 'undefined') {
                          window.location.href = `/lending/create/${
                            process.env.REACT_APP_BANBAN_COLLECTION_ADDRESS
                          }?from=campaign`
                        }
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              mb={'80px'}
            >
              <Box
                className='lending-offer-for-banban-card'
                position={'relative'}
              >
                <Img
                  position={'absolute'}
                  src={TextCircle}
                  top={'103px'}
                  left={'138px'}
                />
                <Box
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'flex-start'}
                  mt={'30px'}
                >
                  <Box className='dot' mr={'10px'} />
                  <Text
                    color={'#FFFFFF'}
                    fontSize={'18px'}
                    fontWeight={700}
                    fontFamily={'HarmonyOS Sans SC'}
                    w={'508px'}
                  >
                    Complete the tasks below to be eligible for the whitelist,
                    allowing you to Freemint the xPass Card and Boxes.
                  </Text>
                </Box>
                <Box mt={'20px'}>
                  <MissionButton
                    title={
                      claimLoading
                        ? 'Loading...'
                        : state.banban_loan_issued === 2 || gotItClicked
                        ? 'Completed'
                        : 'Claim'
                    }
                    width='368px'
                    disabled={!!state.banban_loan_issued}
                    // onClick={() => {
                    //   claim()
                    // }}
                  />
                </Box>
              </Box>
            </Box> */}
          </Box>
          <Modal
            isOpen={claimNoticeDialogVisible}
            onClose={handleCloseNotice}
            size={'xl'}>
            <ModalOverlay />
            <ModalContent>
              <ModalCloseButton />
              <ModalBody padding={'40px'}>
                <Box
                  display={'flex'}
                  flexDir={'column'}
                  alignItems={'center'}>
                  <Img src={ImgClaimedCard} />
                  <Text
                    fontSize={'28px'}
                    fontWeight={700}
                    fontFamily={'HarmonyOS Sans SC'}>
                    Newcomer Milestone Achieved!
                  </Text>
                  <Text
                    textAlign={'center'}
                    color={'#566E8C'}
                    fontSize={'16px'}
                    fontWeight={400}
                    fontFamily={'HarmonyOS Sans SC'}>
                    {`Congratulations on completing xBank's Newcomer event &
                    becoming the newly rich of NFTFi! Stay tuned to our Twitter`}
                    <a
                      href='https://twitter.com/xBank_Official'
                      target={'_blank'}
                      rel='noreferrer'
                      style={{
                        color: '#316BFF',
                      }}>
                      @xBank_Official
                    </a>
                    {` for the Freemint time to follow.`}
                  </Text>
                  <Button
                    padding={'16px 32px'}
                    width={'352px'}
                    marginTop={'32px'}
                    bg='#00F'
                    color='#FFFFFF'
                    onClick={handleCloseNotice}
                    _hover={{
                      bg: '#00F',
                      color: '#FFFFFF',
                    }}>
                    Got It!
                  </Button>
                </Box>
              </ModalBody>
            </ModalContent>
          </Modal>
          <Modal
            onClose={() => {
              closeShareDialog()
            }}
            isOpen={shareDialogVisible}
            isCentered
            size={'lg'}>
            <ModalOverlay />
            <ModalContent>
              <ModalCloseButton
                border={'none'}
                _focus={{
                  outline: 'none',
                  border: 'none',
                }}
              />
              <ModalBody paddingBottom={'40px'}>
                <Box>
                  <Text
                    fontFamily={'HarmonyOS Sans SC'}
                    fontSize={'28px'}
                    fontWeight={700}
                    textAlign={'center'}>
                    Share
                  </Text>
                </Box>
                <Box marginBottom={'32px'}>
                  <Text
                    fontFamily={'HarmonyOS Sans SC'}
                    fontSize={'18px'}
                    fontWeight={500}
                    marginBottom={'10px'}>
                    Share To:
                  </Text>
                  <Box display={'flex'}>
                    <Link
                      target={'_blank'}
                      href={encodeURI(
                        `https://t.me/share/url?url=${
                          window.location.host + '/market'
                        }&text=${SHARE_TELEGRAM_TEXT}`,
                      )}
                      marginRight={'10px'}>
                      <Box
                        padding={'8px 12px'}
                        borderRadius={'100px'}
                        display={'flex'}
                        alignItems={'center'}
                        bgColor={'#F3F6F9'}>
                        <Img
                          src={IconTelegram}
                          w={{
                            md: '32px',
                            sm: '20px',
                            xs: '20px',
                          }}
                          fontSize={'16px'}
                          marginRight={'5px'}
                        />
                        <Text
                          fontSize={{
                            md: '16px',
                            sm: '12px',
                            xs: '12px',
                          }}
                          fontFamily={'HarmonyOS Sans SC'}
                          fontWeight={500}>
                          Share To Telegram
                        </Text>
                      </Box>
                    </Link>
                    <Link
                      target={'_blank'}
                      href={encodeURI(
                        `https://twitter.com/intent/tweet?text=${SHARE_TWITTER_TEXT}&url=${
                          window.location.host + '/market'
                        }`,
                      )}
                      _hover={{
                        textDecoration: 'none',
                      }}>
                      <Box
                        display={'flex'}
                        alignItems={'center'}
                        padding={'8px 12px'}
                        borderRadius={'100px'}
                        bgColor={'#F3F6F9'}>
                        <Img
                          src={IconTwitter}
                          w={{
                            md: '32px',
                            sm: '20px',
                            xs: '20px',
                          }}
                          fontSize={'16px'}
                          marginRight={'10px'}
                        />
                        <Text
                          fontSize={{
                            md: '16px',
                            sm: '12px',
                            xs: '12px',
                          }}
                          fontFamily={'HarmonyOS Sans SC'}
                          fontWeight={500}>
                          Share To Twitter
                        </Text>
                      </Box>
                    </Link>
                  </Box>
                </Box>
                <Box>
                  <Text
                    fontFamily={'HarmonyOS Sans SC'}
                    fontSize={'18px'}
                    fontWeight={500}
                    marginBottom={'10px'}>
                    Invitation Link:
                  </Text>
                  <Box position={'relative'}>
                    <Box
                      padding={'12px 12px'}
                      borderRadius={'100px'}
                      display={'flex'}
                      alignItems={'center'}
                      bgColor={'#F3F6F9'}>
                      <Text
                        width={'218px'}
                        noOfLines={1}
                        lineHeight={'18px'}
                        color={'#97ADC7'}>
                        {invitationLink}
                      </Text>
                      <CopyIcon color={'#97ADC7'} />
                    </Box>
                    <Tooltip
                      hasArrow
                      label='Copied'
                      placement='bottom'
                      isOpen={hasCopied}>
                      <Box
                        as='button'
                        position={'absolute'}
                        top={0}
                        right={0}
                        padding={'8px 12px'}
                        bg={'#00F'}
                        color={'#FFF'}
                        borderRadius={'100px'}
                        onClick={() => {
                          // setInvitationLink(invitationLink)
                          onCopy()
                        }}>
                        <Text
                          fontWeight={500}
                          fontSize={'18px'}>
                          Copy the Link
                        </Text>
                      </Box>
                    </Tooltip>
                  </Box>
                </Box>
              </ModalBody>
            </ModalContent>
          </Modal>
        </Container>
      </div>
    </div>
  )
}
function CounterDesc(props: { desc: string; num: string }) {
  const list = props.num.split('').map((num, index) => ({
    id: index,
    num,
  }))
  return (
    <Box
      display={'flex'}
      alignItems={'center'}>
      <Text
        color='#FFFFFF'
        fontFamily={'HarmonyOS Sans SC'}
        fontSize={'18px'}
        mr={'6px'}
        fontWeight={900}>
        {props.desc}
      </Text>
      {list.map(({ num, id }) => {
        return (
          <Box
            key={id}
            w={'36px'}
            h={'36px'}
            position={'relative'}
            padding={'1px'}
            borderRadius={'8px'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            mr={'6px'}
            className='xbank-gradient'>
            <Box
              w={'34px'}
              h={'34px'}
              borderRadius={'8px'}
              display={'flex'}
              justifyContent={'center'}
              alignItems={'center'}
              bg='#1D1C20'>
              <Text
                fontFamily={'Orbitron'}
                fontSize={'20px'}
                fontWeight={900}
                color='#FFFFFF'>
                {num}
              </Text>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}

function MissionDescText(
  props: React.PropsWithChildren & { textProps?: TextProps },
) {
  return (
    <Text
      color={'#FFFFFF'}
      fontSize={'18px'}
      fontFamily={'HarmonyOS Sans SC'}
      fontWeight={500}
      {...props.textProps}>
      {props.children}
    </Text>
  )
}

function BlueButton(
  props: React.PropsWithChildren & { buttonProps?: ButtonProps },
) {
  return (
    <Button
      border={'1px solid #0E51FF'}
      background={
        'radial-gradient(163.33% 163.33% at 50% 100%, rgba(255, 255, 255, 0.45) 0%, rgba(0, 0, 0, 0.00) 100%, rgba(255, 255, 255, 0.00) 100%), #316BFF'
      }
      backgroundBlendMode={'overlay, normal'}
      display={'flex'}
      width={'368px'}
      padding={'13px 28px'}
      justifyContent={'center'}
      alignItems={'center'}
      borderRadius={'88px'}
      boxShadow={'0px 10px 19px 0px rgba(49, 107, 255, 0.28)'}
      _hover={{
        background:
          'radial-gradient(163.33% 163.33% at 50% 100%, rgba(255, 255, 255, 0.45) 0%, rgba(0, 0, 0, 0.00) 100%, rgba(255, 255, 255, 0.00) 100%), #316BFF',
        backgroundBlendMode: 'overlay, normal',
        opacity: 0.9,
      }}
      {...props.buttonProps}>
      <Text
        color={'#FFF'}
        fontFamily={'Orbitron'}
        fontSize={'20px'}
        fontWeight={900}
        fontStyle={'normal'}
        lineHeight={'normal'}>
        {props.children}
      </Text>
    </Button>
  )
}
