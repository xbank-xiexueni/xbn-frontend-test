import {
  Button,
  type ButtonProps,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Link,
  Flex,
  PopoverArrow,
} from '@chakra-ui/react'
import { readContract, readContracts } from '@wagmi/core'
import useRequest from 'ahooks/lib/useRequest'
import { range } from 'lodash'
import { useCallback, type FunctionComponent } from 'react'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import { useNavigate } from 'react-router-dom'

import { XBANK_CONTRACT_ABI, XBANK_CONTRACT_ADDRESS } from 'constants/index'
import { useWallet } from 'hooks'
import { formatAddress } from 'utils/format'

const ConnectedWallet: FunctionComponent<ButtonProps & { dark?: boolean }> = (
  p,
) => {
  const navigate = useNavigate()
  const { currentAccount, handleDisconnect, isConnected } = useWallet()

  const handleTest = useCallback(async () => {
    const loanCount = await readContract({
      address: XBANK_CONTRACT_ADDRESS,
      abi: [XBANK_CONTRACT_ABI.find((i) => i.name === 'totalNumLoans')],
    })

    const res = await readContracts({
      contracts: range(Number(loanCount)).map((arg) => ({
        address: XBANK_CONTRACT_ADDRESS,
        args: [arg],
        abi: [XBANK_CONTRACT_ABI.find((i) => i.name === 'getLoan')],
      })),
    })
    console.log('total loans', res)
  }, [])

  const { runAsync, loading } = useRequest(handleTest, {
    manual: true,
  })
  if (!isConnected) return null
  return (
    <Popover
      offset={[0, 2]}
      arrowSize={10}>
      {({ isOpen }) => (
        <>
          <PopoverTrigger>
            <Button
              paddingY={p.dark ? '20px' : '0px'}
              leftIcon={
                <Jazzicon
                  diameter={24}
                  seed={jsNumberForAddress(currentAccount?.address || '')}
                />
              }
              as={Button}
              fontSize={'12px'}
              h='32px'
              borderRadius={p.dark ? 100 : 4}
              borderLeftRadius={0}
              bg={p.dark ? 'rgba(255, 255, 255, 0.08)' : 'gray.5'}
              _hover={{
                bg: p.dark ? 'rgba(255, 255, 255, 0.08)' : 'gray.5',
                color: p.dark ? '#FFFFFF' : 'blue.1',
              }}
              _active={{
                bg: p.dark ? 'rgba(255, 255, 255, 0.08)' : 'gray.5',
              }}
              fontWeight={'700'}
              color={p.dark ? '#FFFFFF' : isOpen ? 'blue.1' : 'black.1'}
              {...p}>
              {formatAddress(currentAccount?.address)}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            w='140px'
            boxShadow={'var(--chakra-shadows-default)'}
            border={'none'}
            bg={p.dark ? 'rgba(255, 255, 255, 0.08)' : ''}>
            <PopoverArrow
              boxShadow={'none'}
              bg={p.dark ? 'rgba(255, 255, 255, 0.08)' : ''}
            />
            <PopoverBody>
              {[
                {
                  label: 'My Assets',
                  onClick: () => {
                    navigate('/my-assets')
                  },
                },
                {
                  label: 'Disconnect',
                  onClick: () => {
                    handleDisconnect()
                    navigate('/')
                  },
                },
              ].map(({ label, onClick, ...rest }) => (
                <Flex key={label}>
                  <Link
                    py={'8px'}
                    px='12px'
                    onClick={onClick}
                    color={p.dark ? '#FFFFFF' : 'black.1'}
                    _hover={{
                      color: p.dark ? '#FFFFFF' : 'blue.1',
                      bg: p.dark ? 'rgba(255, 255, 255, 0.08)' : 'white',
                    }}
                    {...rest}>
                    {label}
                  </Link>
                </Flex>
              ))}
              {(process.env.DEV ||
                window.location.hostname.startsWith('feat-')) && (
                <Button
                  isLoading={loading}
                  onClick={runAsync}
                  variant='primary'>
                  TEST
                </Button>
              )}
            </PopoverBody>
          </PopoverContent>
        </>
      )}
    </Popover>
  )
}

export default ConnectedWallet
