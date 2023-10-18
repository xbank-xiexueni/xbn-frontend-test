import type { ModalHeaderProps, UseToastOptions } from '@chakra-ui/react'

export { XBANK_CONTRACT_ABI, WETH_CONTRACT_ABI } from './contractABI'

export const XBANK_CONTRACT_ADDRESS = process.env.REACT_APP_XBANK_CONTRACT_ADDRESS
export const WETH_CONTRACT_ADDRESS = process.env.REACT_APP_WETH_CONTRACT_ADDRESS

/**
 *   xs: '290px',
  sm: '375px',
  md: '768px',
  lg: '968px',
  xl: '1400px',
  '2xl': '1800px',
 */
export const RESPONSIVE_MAX_W = {
  xl: 1376,
  lg: 1200,
  md: 768,
  sm: 358,
  xs: '100%',
}

export const UNIT = 'ETH'
export const FORMAT_NUMBER = 8

export const LP_BASE_RATE: Record<string, number> = {
  '7-1000': 1100,
  '7-2000': 1200,
  '7-3000': 1800,
  '7-4000': 2000,
  '7-5000': 3000,
  '7-6000': 4000,
  '7-7000': 5000,
  '7-8000': 6000,
  '7-9000': 7000,
  '14-1000': 1200,
  '14-2000': 1400,
  '14-3000': 2100,
  '14-4000': 2500,
  '14-5000': 3500,
  '14-6000': 4500,
  '14-7000': 5500,
  '14-8000': 6500,
  '14-9000': 7500,
  '30-1000': 1300,
  '30-2000': 1600,
  '30-3000': 2400,
  '30-4000': 3000,
  '30-5000': 4000,
  '30-6000': 5000,
  '30-7000': 6000,
  '30-8000': 7000,
  '30-9000': 8000,
  '60-1000': 1400,
  '60-2000': 1800,
  '60-3000': 2700,
  '60-4000': 3500,
  '60-5000': 4500,
  '60-6000': 5500,
  '60-7000': 6500,
  '60-8000': 7500,
  '60-9000': 8500,
  '90-1000': 1500,
  '90-2000': 2000,
  '90-3000': 3000,
  '90-4000': 4000,
  '90-5000': 5000,
  '90-6000': 6000,
  '90-7000': 7000,
  '90-8000': 8000,
  '90-9000': 9000,
}

export const OPENSEA_LIST_DURATION = [
  {
    label: '1 Day',
    value: 86400,
  },
  {
    label: '3 Days',
    value: 86400 * 3,
  },
  {
    label: '7 Days',
    value: 86400 * 7,
  },
  {
    label: '14 Days',
    value: 86400 * 14,
  },
  {
    label: '30 Days',
    value: 86400 * 30,
  },
  {
    label: '60 Days',
    value: 86400 * 60,
  },
  {
    label: '90 Days',
    value: 86400 * 90,
  },
]
export const BLUR_LIST_DURATION = [
  {
    label: '1 Hour',
    value: 3600,
  },
  {
    label: '3 Hours',
    value: 3600 * 3,
  },
  {
    label: '1 Day',
    value: 86400,
  },
  {
    label: '3 Days',
    value: 86400 * 3,
  },
  {
    label: '7 Days',
    value: 86400 * 7,
  },
  {
    label: '30 Days',
    value: 86400 * 30,
  },
  {
    label: '6 Months',
    value: 86400 * 30 * 6,
  },
]

export const STEPS_DESCRIPTIONS = [
  {
    title: 'Select Collection',
    text: 'Choose the NFT collection you wish to use as collateral for a loan.',
  },
  {
    title: 'Risk Control',
    text: 'These two conditions can limit the amount of a loan, Your collection pool will use the smaller amount of these two conditions for lending.',
  },
  {
    title: 'Supply Caps',
    text: `Supply caps refer to the maximum limit or threshold set for lending within a particular collection. It acts as a constraint, ensuring that the total mount of lending does not exceed a predefined level at any moment.`,
  },
  {
    title: 'Set Max Loan Tenor',
    text: 'It will determine the max duration of a single loan. As long as borrowers repay their loan at the end of the tenor, lenders cannot liquidate the loan positions.',
  },
  {
    title: 'Set Max Interest Rate',
    text: 'Please choose an interest rate you want under the conditions of the max loan duration and max loan amount, and we will automatically generate a Lending Offer Table for you. If you are not satisfied with the parameters in the table, you can fine-tune them.\nLower interest rate lending offers will lend out faster.',
  },
]

export const TOAST_OPTION_CONFIG: UseToastOptions = {
  position: 'top',
  id: `toast-${Math.random()}`,
  duration: 5000,
  containerStyle: {
    mt: '130px',
  },
}

export const TWITTER_URL = 'https://twitter.com/xBank_Official'

export const LINKEDIN_URL = 'https://www.linkedin.com/company/xbank-global'

export const DISCORD_URL = 'https://discord.gg/PGBVwcaeQE'

export const MEDIUM_URL = 'https://medium.com/@xBankCrypto'
export const CHAIN_BASE_URL: Record<string, string> = {
  '0x1': 'https://etherscan.io/address/',
  '0x5': 'https://goerli.etherscan.io/address/',
}

export enum LISTING_TYPE {
  LISTING = 1,
  CANCEL = 2,
}

export enum LISTING_ORDER_STATUS {
  // 新建
  New = 1,
  // 开始处理时首先置的状态，防止重复处理
  PendingProgress = 2,
  // 需要进行 approve 时
  PendingApproval = 3,
  // 该资产已经进行过 approve/cancel交易已广播
  Approved = 8,
  // 已挂单
  Listed = 16,
  //
  CoinTransferred = 32,
  // final
  Rejected = 64,
  // final
  InstRejected = 128,
  // final 已取消
  Cancelled = 256,
  // final
  Expired = 512,
  // final
  Liquidated = 1024,
  //
  Failed = 2048,
  // final 挂单被卖出
  Completed = 4096,
}

export enum LOAN_ORDER_STATUS {
  // 新建
  New = 1,
  // 收到首付
  DownPaymentConfirmed = 2,
  // 开始购买NFT时首先置的状态，防止重复处理
  PendingPurchase = 4,
  // 购买nft交易已广播
  PurchaseSubmitted = 8,
  // 购买交易已被打包，购买nft完成。购买NFT的最后一个状态
  PurchaseConfirmed = 16,
  // 开始调用合约beginLoan时首先置的状态，防止重复处理
  PendingLoan = 32,
  // 生成loan的交易已广播
  LoanSubmitted = 64,
  // final    未通过我们的校验，拒绝掉
  Rejected = 128,
  // final    marketplace拒绝了，比如no matching order
  MarketRejected = 256,
  // final
  Cancelled = 512,
  // final    给用户和LP退款
  Refunded = 1024,
  // 后端自用，用于不确定失败原因，找到原因后进行重试
  Failed = 2048,
  // final    loan 生成成功
  Completed = 4096,
}

export enum NotificationType {
  loan_in_generating = 'loan_in_generating',
  loan_repayment = 'loan_repayment',
}

export enum MARKET_TYPE_ENUM {
  OPENSEA = 'opensea',
  BLUR = 'blur',
}

export enum LOAN_STATUS {
  RESERVE,
  OPEN,
  FULL_TENOR,
  PAYOFF,
  OVERDUE,
  COLLATERAL_SALE,
}

export enum FRONTEND_LOAN_STATUS {
  OPEN,
  PAID_OFF,
  OVERDUE,
}

export const MODEL_HEADER_PROPS: ModalHeaderProps = {
  pt: {
    md: '40px',
    sm: '20px',
    xs: '20px',
  },
  fontSize: {
    md: '28px',
    sm: '22px',
    xs: '22px',
  },
  fontWeight: '700',
  position: 'sticky',
  top: 0,
  bg: 'white',
  zIndex: 2,
  display: 'flex',
  justifyContent: 'space-between',
  px: {
    md: '40px',
    sm: '20px',
    xs: '20px',
  },
  borderRadius: 16,
}

export enum ACCOUNT_MODAL_TAB_KEY {
  AVAILABLE_FUNDS_TAB = 'Available Funds',
  SWAP_TAB = 'Swap',
}

export enum COLLECTION_STATUS_ENUM {
  RELEASED = 'RELEASED',
  COUNTDOWN = 'COUNTDOWN',
  UPCOMING = 'UPCOMING',
}

export const MIN_LOAN_COUNT = 3

export const WALLET_ICON: Record<string, string> = {
  metaMask: 'https://etherscan.io/images/svg/brands/metamask.svg',
  walletConnect: 'https://etherscan.io/images/svg/brands/walletconnect.svg',
}

// 创建 banban 写死的 数据
export const LENDING_SLIDER_IMAGES: string[] = []

export const COLLECTIONS_WITH_BOXDROP_CONFIG: {
  address: string
  url: string
  desc: string
}[] = [
    // {
    //   address: '0xdaa3812b8fd34d01711105a6dfb669c50ab8fee3',
    //   url: 'https://placehold.co/600x400',
    //   desc: 'Hello World',
    // },
  ]
