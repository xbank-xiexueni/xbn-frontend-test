import { Box, Button, Text } from '@chakra-ui/react'
import {
  useAccount,
  useContractRead,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
} from 'wagmi'
import { apiPostAuthChallenge, apiPostAuthLogin } from 'api/user'
import { useState } from 'react'
import { parseEther } from 'viem'
import WETH_ABI from 'constants/wethAbi.json'
// All properties on a domain are optional
const domain = {
  name: 'Ether Mail',
  version: '1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
} as const

// The named list of all type definitions
const types = {
  Person: [
    { name: 'name', type: 'string' },
    { name: 'wallet', type: 'address' },
  ],
  Mail: [
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'contents', type: 'string' },
  ],
} as const

const message = {
  from: {
    name: 'Cow',
    wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
  },
  to: {
    name: 'Bob',
    wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
  },
  contents: 'Hello, Bob!',
} as const
const Test = () => {
  const [loginMessage, setLoginMessage] = useState('')
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [signedLoginMessage, setSignedLoginMessage] = useState('')
  const [expires, setExpires] = useState('')
  const [token, setToken] = useState('')
  const { data, isError, isLoading, isSuccess, signTypedData } =
    useSignTypedData({
      domain,
      message,
      primaryType: 'Mail',
      types,
    })
  const {
    data: sendTransactionData,
    isLoading: sendTransactionIsLoading,
    isSuccess: sendTransactionIsSuccess,
    sendTransaction,
  } = useSendTransaction({
    to: 'tttzy.eth',
    value: parseEther('0.01'),
  })
  const {
    data: contractReadData,
    error: contractReadDataError,
    isError: contractReadDataIsError,
    isLoading: contractReadDataIsLoading,
  } = useContractRead({
    address: process.env.REACT_APP_WETH_CONTRACT_ADDRESS as any,
    abi: WETH_ABI,
    functionName: 'balanceOf',
    account: address,
  })
  console.log(process.env.REACT_APP_WETH_CONTRACT_ADDRESS)
  console.log(WETH_ABI)

  return (
    <div>
      <Box
        display={'flex'}
        border={'1px solid red'}
        padding={'10px'}
        margin={'10px'}>
        <w3m-button />
      </Box>
      <Box
        display={'flex'}
        border={'1px solid red'}
        padding={'10px'}
        margin={'10px'}>
        <Text>{address}</Text>
      </Box>
      <Box
        border={'1px solid red'}
        padding={'10px'}
        margin={'10px'}>
        <Button
          marginRight={'10px'}
          onClick={() => {
            if (address) {
              apiPostAuthChallenge(address)
                .then((resp) => {
                  setLoginMessage(resp.login_message)
                })
                .catch((e) => {
                  console.log(e)
                })
            }
          }}>
          GetSignMessage
        </Button>
        <Text
          width={'300px'}
          noOfLines={1}>
          {loginMessage}
        </Text>
      </Box>
      <Box
        border={'1px solid red'}
        padding={'10px'}
        margin={'10px'}>
        <Button
          marginRight={'10px'}
          onClick={() => {
            if (loginMessage) {
              signMessageAsync({
                message: loginMessage,
              }).then((resp) => {
                setSignedLoginMessage(resp)
              })
            }
          }}>
          Sign Login Message
        </Button>
        <Text
          width={'300px'}
          noOfLines={1}>
          {signedLoginMessage}
        </Text>
      </Box>
      <Box
        border={'1px solid red'}
        padding={'10px'}
        margin={'10px'}>
        <Button
          onClick={() => {
            if (address) {
              apiPostAuthLogin({
                address: address,
                message: loginMessage,
                signature: signedLoginMessage,
              }).then((resp) => {
                console.log(resp)
                setExpires(resp.expires)
                setToken(resp.token)
              })
            }
          }}>
          Post Login
        </Button>
        <Text>expires: {expires}</Text>
        <Text>token: {token}</Text>
      </Box>
      <Box
        border={'1px solid red'}
        padding={'10px'}
        margin={'10px'}>
        <Button
          disabled={isLoading}
          onClick={() => signTypedData()}>
          Sign typed data
        </Button>
        {isSuccess && <div>Signature: {data}</div>}
        {isError && <div>Error signing message</div>}
      </Box>
      <Box
        border={'1px solid red'}
        padding={'10px'}
        margin={'10px'}>
        <Button
          disabled={isLoading}
          onClick={() => sendTransaction()}>
          send transaction
        </Button>
        {sendTransactionIsLoading && <div>check wallet</div>}
        {sendTransactionIsSuccess && (
          <div>transaction: {JSON.stringify(sendTransactionData)}</div>
        )}
      </Box>
      <Box
        border={'1px solid red'}
        padding={'10px'}
        margin={'10px'}>
        {contractReadDataIsError && (
          <div>ERROR:{JSON.stringify(contractReadDataError)}</div>
        )}
        {contractReadDataIsLoading && <div>check wallet</div>}
        {!!contractReadData && (
          <div>{JSON.stringify(contractReadDataError)}</div>
        )}
      </Box>
    </div>
  )
}
export default Test
