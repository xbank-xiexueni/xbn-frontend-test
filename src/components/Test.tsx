import { Box, Button } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

const Test = () => {
  const navigate = useNavigate()
  return (
    <Box>
      <w3m-button />
      <Button
        marginTop={'20px'}
        onClick={() => {
          navigate('/')
        }}
        variant={'solid'}
        bg={'red.100'}>
        Index
      </Button>
    </Box>
  )
}

export default Test
