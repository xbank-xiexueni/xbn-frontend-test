import { Button } from '@chakra-ui/react'
import Test from 'components/Test'
import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from 'react-router-dom'
function Index() {
  const navigate = useNavigate()
  return (
    <div>
      <Button
        onClick={() => {
          navigate('/test')
        }}>
        test
      </Button>
    </div>
  )
}
const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/test',
    element: <Test />,
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
