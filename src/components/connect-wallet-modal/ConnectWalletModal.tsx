import {
  Modal,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Flex,
  Text,
  Image,
  Box,
  Spinner,
  Button,
} from '@chakra-ui/react'
import useRequest from 'ahooks/lib/useRequest'
import {
  useState,
  type FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
} from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

import { SvgComponent } from '@/components'
import { WALLET_ICON } from '@/constants'
import { useSign, useWallet } from '@/hooks'
import { formatWagmiErrorMsg } from '@/utils/format'

import type { Connector, ConnectorData } from 'wagmi'

type IndexProps = {
  visible: boolean
  handleClose: () => void
  closeable?: boolean
}
const Index: FunctionComponent<IndexProps> = ({
  visible,
  handleClose,
  closeable = true,
}) => {
  // const { isConnected } = useAccount()
  const [step, setStep] = useState<'connect' | 'sign'>('connect')
  const { connectors, connectAsync } = useConnect()
  const [currentConnector, setCurrentConnector] = useState<string>()
  const { address, connector: activeConnector } = useAccount()
  useEffect(() => {
    setStep('connect')
  }, [])
  const { disconnectAsync } = useDisconnect()
  const {
    isConnected,
    setCurrentAccount,
    connectChanging: changing,
    currentAccount,
    runChainCheckAsync,
  } = useWallet()

  const {
    runAsync: handleSign,
    loading: signLoading,
    error: signError,
  } = useSign()
  const connectWallet = useCallback(
    async (args: { connector: Connector; chainId?: number }) => {
      // metamask 的 bug： 如果当前 network !== args.chainId, 会导致页面没反应
      // 其他 dapp 做法，先 connect，再判断 network 做提示
      let currentAddress = address
      // let currentChainId = chain?.id
      setStep('connect')
      if (
        !activeConnector ||
        activeConnector?.id !== args?.connector?.id ||
        !address ||
        args?.connector?.id === 'walletConnect'
      ) {
        await disconnectAsync()
        const { account } = await connectAsync({
          ...args,
        })

        currentAddress = account
        // currentChainId = currentChain.id
      }

      if (
        !!currentAddress
        // && currentChainId === Number(process.env.REACT_APP_TARGET_CHAIN_ID)
      ) {
        setStep('sign')
        const res = await handleSign(currentAddress)
        setCurrentAccount({
          ...res,
          address: currentAddress,
        } as AccountType)
      } else {
        setCurrentAccount(undefined)
      }
    },
    [
      setCurrentAccount,
      handleSign,
      activeConnector,
      address,
      disconnectAsync,
      connectAsync,
      // chain,
    ],
  )

  const {
    runAsync: handleConnectWallet,
    loading: connectLoading,
    error,
  } = useRequest(connectWallet, {
    manual: true,
  })
  const [changedAccount, setChangedAccount] = useState<string>()

  useEffect(() => {
    // 短连 => 查看是否还有 account 连接，顺延到已连接 account
    const handleConnectorUpdate = async ({
      account,
      chain: currentChain,
    }: ConnectorData) => {
      if (account) {
        if (currentAccount) {
          if (currentAccount?.address !== account) {
            setCurrentAccount(undefined)
            setStep('sign')
            setChangedAccount(account)
          } else {
            console.log('走到这')
          }
        }
      } else if (currentChain) {
        setTimeout(() => {
          runChainCheckAsync?.(currentChain.id)
        }, 1000)
      }
    }

    if (activeConnector) {
      activeConnector?.on('change', handleConnectorUpdate)
    } else {
      setStep('connect')
    }

    return () => {
      activeConnector?.off('change', handleConnectorUpdate)
    }
  }, [
    activeConnector,
    handleSign,
    runChainCheckAsync,
    currentAccount,
    setCurrentAccount,
  ])
  const errorMsg = useMemo(() => {
    const _error =
      signError?.cause || signError || error?.cause || (error as any)
    return _error?.message
  }, [signError, error])

  if (!!isConnected) {
    return null
  }

  return (
    <Modal
      onClose={() => {
        if (!closeable) return
        setStep('connect')
        handleClose()
      }}
      isOpen={visible}
      isCentered
      trapFocus={false}
      blockScrollOnMount={false}
      closeOnEsc={closeable}
      closeOnOverlayClick={closeable}>
      <ModalOverlay bg='black.2' />
      <ModalContent
        maxW={{
          xl: 'md',
          lg: 'md',
          md: 'md',
          sm: '326px',
          xs: '326px',
        }}
        p={'40px'}
        zIndex={22}>
        <ModalHeader p={0}>
          {step === 'connect' && 'Connect Wallet'}
          {step === 'sign' && 'Sign in your wallet'}
        </ModalHeader>
        {closeable && <ModalCloseButton />}
        <ModalBody
          m={0}
          p={0}
          pt={'52px'}>
          {!!errorMsg && !connectLoading && !signLoading && (
            <Text color={'red.1'}>{formatWagmiErrorMsg(errorMsg)}</Text>
          )}
          {step === 'connect' && (
            <Flex
              direction={'column'}
              gap='32px'
              pt='20px'>
              {connectors.map((connector) => (
                <Flex
                  justify={'space-between'}
                  alignItems='center'
                  //  disabled={!connector.ready}
                  key={connector.id}
                  onClick={() => {
                    if (connectLoading || changing) return
                    setCurrentConnector(connector.id)
                    handleConnectWallet({
                      connector,
                      // chainId: Number(process.env.REACT_APP_TARGET_CHAIN_ID),
                    })
                  }}
                  cursor='pointer'>
                  <Flex
                    alignItems={'center'}
                    gap='16px'
                    justify={'space-between'}>
                    {WALLET_ICON[connector.id] ? (
                      <>
                        <Box position={'relative'}>
                          {(connectLoading || changing) &&
                            connector.id === currentConnector && (
                              <Spinner
                                thickness='3px'
                                speed='1s'
                                emptyColor={`gray.5`}
                                color={`blue.1`}
                                boxSize={'40px'}
                                position={'absolute'}
                                top='-4px'
                                left={'-4px'}
                              />
                            )}

                          <Image
                            src={WALLET_ICON[connector.id]}
                            alt={connector.name}
                            boxSize={'32px'}
                          />
                        </Box>
                      </>
                    ) : null}
                    {/* <Image src={} alt={connector.name} boxSize={'32px'} /> */}
                    <Text fontWeight={'700'}>
                      {connector.name}
                      {/* {pendingConnector?.id} */}
                      {/* {connector.name}
                    {!connector.ready && ' (unsupported)'}*/}
                      {/* {connector.id === pendingConnector?.id && ' (connecting)'} */}
                    </Text>
                  </Flex>
                  <SvgComponent
                    svgId='icon-arrow-down'
                    transform={'rotate(270deg)'}
                    fill={connectLoading || changing ? 'gray.1' : 'black.1'}
                  />
                </Flex>
              ))}
            </Flex>
          )}

          {step === 'sign' && (
            <Flex direction={'column'}>
              <Text
                fontSize={'14px'}
                my='20px'>
                You will be prompted to sign a message to authenticate, please
                check your wallet
              </Text>
              <Button
                variant={'secondary'}
                onClick={async () => {
                  setCurrentAccount(undefined)
                  const res = await handleSign(changedAccount || '')
                  setCurrentAccount({
                    ...res,
                    address: changedAccount,
                  } as AccountType)
                }}
                isLoading={connectLoading || signLoading}>
                Sign
              </Button>
            </Flex>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default Index
