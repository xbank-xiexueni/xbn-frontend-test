import { Box, Button, Text } from '@chakra-ui/react'
import { useAccount, useSignMessage } from 'wagmi'
import { apiPostAuthChallenge, apiPostAuthLogin } from 'api/user'
import { useState } from 'react'

const Test = () => {
  const [loginMessage, setLoginMessage] = useState('')
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  return (
    <div>
      <Box>
        <w3m-button />
      </Box>
      <Box>
        <Text>{address}</Text>
      </Box>
      <Box display={'flex'}>
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
      <Box>
        <Button
          onClick={() => {
            alert('sign')
          }}>
          Sign
        </Button>
      </Box>
    </div>
  )
}
export default Test
