import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { WagmiConfig } from 'wagmi'
import wagmiConfig from 'setup-wallet-connect'
import { ChakraProvider, Heading, Spinner } from '@chakra-ui/react'
import { client } from './setup-apollo'
import ApolloProvider from './setup-apollo'
import { PhotoProvider } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'
import 'slick-carousel/slick/slick-theme.css'
import 'slick-carousel/slick/slick.css'
import 'video-react/dist/video-react.css'
import theme from 'themes'
import { TOAST_OPTION_CONFIG } from './constants/index'
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <ChakraProvider
        theme={theme}
        toastOptions={{
          defaultOptions: { ...TOAST_OPTION_CONFIG },
        }}>
        <WagmiConfig config={wagmiConfig}>
          <PhotoProvider
            maskOpacity={0.4}
            bannerVisible={false}
            maskClosable
            photoClosable
            loadingElement={
              <Spinner
                colorScheme={'blue'}
                color='blue.1'
              />
            }
            brokenElement={
              <Heading color={'gray.1'}>something went wrong...</Heading>
            }>
            <App />
          </PhotoProvider>
        </WagmiConfig>
      </ChakraProvider>
    </ApolloProvider>
  </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
