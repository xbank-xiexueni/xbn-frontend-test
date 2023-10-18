interface PoolsListItemType {
  activity: boolean
  nonce: number
  collateral_contract: string
  collateral_factor_multiplier: number
  created_at: string
  currency: string
  loan_count: number
  max_collateral_factor: number
  max_interest_rate: number
  max_tenor: number
  owner: string
  owner_weth_balance: string
  owner_weth_allowance: string
  single_cap: string
  supply_cap: string
  supply_used: string
  tenor_multiplier: number
  hash: string
}

enum COLLECTION_STATUS_ENUM {
  RELEASED = 'RELEASED',
  COUNTDOWN = 'COUNTDOWN',
  UPCOMING = 'UPCOMING',
}

interface CollectionListItemType {
  id: string
  name: string
  image_url: string
  contract_addr: string
  safelist_request_status?: 'not_requested' | 'verified'
  description?: string
  // 暂定
  priority: number
  tags: string[]
  release_status?: COLLECTION_STATUS_ENUM
  released_time?: string
}

interface AssetListItemType {
  id: number
  asset_contract_address: string
  token_id: string
  image_url: string
  image_preview_url: string
  image_thumbnail_url: string
  image_original_url: string
  animation_url: string
  animation_original_url: string
  background_color: string
  name: string
  description: string
  external_link: string
  likes: number
  order_chain: string
  order_coin: string
  order_price: string
  created_at: string
  updated_at: string
}

enum MARKET_TYPE_ENUM {
  OPENSEA = 'opensea',
  BLUR = 'blur',
}

interface AcceptOfferRequestDataType {
  borrower: string
  collateralContract: string
  collateralFactor: string
  currency: string
  downPayment: string
  eachPayment: string
  isCreditSale: boolean
  lender: string
  loanAmount: string
  nonce: string
  numberOfInstallments: number
  offerHash: string
  offerIR: number
  offerSide: number
  orderID: string
  protocolFeeRate: number
  tenor: number
  tokenID: string
}

enum LOAN_ORDER_STATUS {
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
interface LoanOrderItemType {
  allow_collateral_contract: string
  borrower: string
  client_sig: string
  collateral_contract: string
  collateral_price: string
  created_at: string
  currency: string
  down_payment: string
  each_payment: string
  floor_price: string
  id: number
  loan_amount: string
  marketplace: string
  nonce: number
  number_of_installments: number
  offer_hash: string
  offer_ir: number
  pool_interest_rate: number
  protocol_fee_rate: number
  status: LOAN_ORDER_STATUS
  tenor: number
  token_id: string
  updated_at: string
}

/**
 * 
struct Loan {
    uint256 loanID;
    uint256 tokenID;
    uint256 eachPayment;
    uint256 loanAmount;
    uint256 outstandingPrincipal;
    address collateralContract;
    uint32 tenor;
    uint32 startTime;
    uint32 offerIR;
    address currency;
    uint8 status;
    uint8 numberOfInstallments;
    uint8 repaidTimes;
    address lender;
    address borrower;
}
 */

enum LOAN_STATUS {
  RESERVE,
  OPEN,
  FULL_TENOR,
  PAYOFF,
  OVERDUE,
  COLLATERAL_SALE,
}
interface LoanListItemType {
  loan_id: string
  token_id: string
  each_payment: string
  loan_amount: string
  outstanding_principal: string
  collateral_contract: string
  tenor: number
  start_time: number
  loan_ir: number
  currency: string
  status: LOAN_STATUS
  number_of_installments: number
  repaid_times: number
  lender: string
  borrower: string
}

interface MyAssetListItemType {
  asset_contract_address: string
  token_id: string
  qty: string
  mortgaged: boolean
  listed_with_mortgage: boolean
  list_price: string
  list_platform: MARKET_TYPE_ENUM
}

enum LISTING_TYPE {
  LISTING = 1,
  CANCEL = 2,
}

enum LISTING_ORDER_STATUS {
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
  Refunded = 1024,
  //
  Failed = 2048,
  // final 挂单被卖出
  Completed = 4096,
}
interface ListingDataType {
  type: LISTING_TYPE
  platform: string
  contract_address: string
  token_id: string
  network: string
  currency: string
  qty: number
  price?: string
  expiration_time?: number
  royalty: number
  borrower_address: string
}

interface AssetPriceType {
  data: {
    marketplace: string
    blur_price?: {
      amount: number
      unit: string
    }
    opensea_price?: {
      amount: number
      unit: string
      hash: string
      chain: string
      protocol_address: string
    }
  }[]
}

interface ListingsItemType {
  act_gas_limit: number
  act_gas_price: string
  borrower_address: string
  contract_address: string
  created_at: string
  currency: string
  expiration_time: number
  gas_limit: number
  gas_price: string
  gas_used: number
  id: number
  network: string
  platform: string
  platform_ord_id: string
  price: string
  qty: number
  status: LISTING_ORDER_STATUS
  status_history: number
  sub_status: number
  token_id: string
  tx_id: string
  type: number
  updated_at: string
}

interface ConfigDataType {
  weight: {
    x: number
    y: number
    z: number
    w: number
    u: number
    v: number
  }
  loan_ratio: [
    {
      key:
        | '1000'
        | '2000'
        | '3000'
        | '4000'
        | '5000'
        | '6000'
        | '7000'
        | '8000'
        | '9000'
        | '10000'
      value: number
    },
  ]
  max_loan_amount: [
    {
      key: string
      value: number
    },
  ]
  loan_term: [
    {
      key: '1' | '3' | '7' | '14' | '30' | '60' | '90'
      value: number
    },
  ]
  max_loan_interest_rate: [
    {
      key: string
      value: number
    },
  ]
  loan_ratio_adjustment_factor: [
    {
      key: '10000' | '9900' | '9800' | '9500' | '9000'
      value: number
    },
  ]
  loan_term_adjustment_factor: [
    {
      key: '10000' | '9900' | '9800' | '9500' | '9000'
      value: number
    },
  ]
}

interface RankItemType {
  address: string
  rank?: number
  box_bronze_num?: number
  box_silver_num?: number
  box_gold_num?: number
  box_platinum_num?: number
}

interface RankDataType {
  info: RankItemType | null
  ranking_infos: RankItemType[]
  count: number
}

enum NotificationType {
  loan_in_generating = 'loan_in_generating',
  loan_repayment = 'loan_repayment',
}
interface NotificationsItemType {
  left_time?: number
  sum: number
  type: NotificationType
}

interface CollectionFeesType {
  fees: {
    BLUR: {
      minimumRoyaltyBips: number
      desiredRoyaltyBips: number
      missingRoyaltyRecipient: boolean
    }
    OPENSEA: {
      platformBips: number
      minimumRoyaltyBips: number
      desiredRoyaltyBips: number
    }
    X2Y2: {
      platformBips: number
      minimumRoyaltyBips: number
      desiredRoyaltyBips: number
    }
    LOOKSRARE: {
      platformBips: number
      minimumRoyaltyBips: number
    }
  }
}

interface RepaymentItemType {
  blk_id: string
  blk_num: number
  blk_time: string
  borrower: string
  contract_addr: string
  created_at: string
  id: number
  lender: string
  loan_id: number
  payment_number: number
  number_of_installments: number
  repaid_amt: string
  token_id: string
  tx_id: string
  type: string
  updated_at: string
}

interface PoolsActionData {
  owner: string
  collateral_contract: string
  currency: string
  supply_cap: string
  single_cap: string
  max_collateral_factor: number
  max_tenor: number
  max_interest_rate: number
  tenor_multiplier: number
  collateral_factor_multiplier: number
}

interface TypedDataType {
  domain: {
    chainId: `0x${number}`
    name: string
    salt: string
    verifyingContract: string
    version: string
  }
  message: Record<string, any>
  primaryType: string
  types: Record<
    string,
    {
      name: string
      type: string
    }[]
  >
}

interface BanbanMetaDataType {
  buyable: boolean
}
