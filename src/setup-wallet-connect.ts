import { EthereumClient } from '@web3modal/ethereum'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { mainnet, goerli } from 'wagmi/chains'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'
// 1. Get projectId
export const projectId = '9d97dd16d0f0be1131e835d5dd571e23'

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, goerli],
  // [publicProvider()],
  [
    // alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_API_KEY }),
    // jsonRpcProvider({
    //   rpc: (chain) => ({
    //     http: `https://xbank.global/api/v1/jsonrpc?network=eth-goerli`,
    //   }),
    // }),
    publicProvider(), // rpc.ankr  300/min
  ],
)
// const chains = [mainnet, goerli]
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({
      chains,
      options: {
        shimDisconnect: false,
        UNSTABLE_shimOnConnectSelectAccount: true,
      },
    }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: projectId,
        showQrModal: true,
        qrModalOptions: {
          themeVariables: {
            '--wcm-z-index': '9999',
          },
          privacyPolicyUrl: 'https://xbank.plus/privacy-policy/en',
          termsOfServiceUrl: 'https://xbank.plus/terms-of-service/en',
        },
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
})
export const ethereumClient = new EthereumClient(wagmiConfig, chains)
// 3. Create modal
// createWeb3Modal({ wagmiConfig, projectId, chains })

export default wagmiConfig

