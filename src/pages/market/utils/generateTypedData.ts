// new Map([
//   ['0x0f9aedb5', 'ErrorInsufficientBalance'],
//   ['0x341fd7c5', 'ErrorCollateralNotExist'],
//   ['0xed6d9522', 'ErrorInsufficientERC20Balance'],
//   ['0x7b874174', 'ErrorIsUsedOrder'],
//   ['0xf5239621', 'ErrorLoanInvalid'],
//   ['0x53b0f674', 'ErrorLoanOverdued'],
//   ['0x459f56c6', 'ErrorMsgValue'],
//   ['0x9c6f9ade', 'ErrorParameters'],
//   ['0x255ae6ed', 'ErrorPermissionDenied'],
//   ['0x459f56c6', 'ErrorMsgValue'],
//   ['0x2cbd73e2', 'ErrorVerifySignature'],
// ])

const generateTypedData = (
  message: AcceptOfferRequestDataType,
  domain: {
    name: string
    version: string
    chainId: number
    verifyingContract: string
  },
) => {
  return {
    types: {
      EIP712Domain: [
        {
          name: 'name',
          type: 'string',
        },
        {
          name: 'version',
          type: 'string',
        },
        {
          name: 'chainId',
          type: 'uint256',
        },
        {
          name: 'verifyingContract',
          type: 'address',
        },
      ],
      AcceptOfferRequest: [
        {
          name: 'orderID',
          type: 'uint256',
        },
        {
          name: 'loanAmount',
          type: 'uint256',
        },
        {
          name: 'nonce',
          type: 'uint256',
        },
        {
          name: 'downPayment',
          type: 'uint256',
        },
        {
          name: 'collateralFactor',
          type: 'uint256',
        },
        {
          name: 'tokenID',
          type: 'uint256',
        },
        {
          name: 'eachPayment',
          type: 'uint256',
        },
        {
          name: 'currency',
          type: 'address',
        },

        {
          name: 'borrower',
          type: 'address',
        },
        {
          name: 'lender',
          type: 'address',
        },
        {
          name: 'collateralContract',
          type: 'address',
        },
        {
          name: 'offerIR',
          type: 'uint32',
        },
        {
          name: 'tenor',
          type: 'uint32',
        },
        {
          name: 'offerHash',
          type: 'bytes32',
        },
        { name: 'protocolFeeRate', type: 'uint16' },
        { name: 'numberOfInstallments', type: 'uint8' },
        { name: 'offerSide', type: 'uint8' },
        { name: 'isCreditSale', type: 'bool' },
      ],
    },
    primaryType: 'AcceptOfferRequest',
    domain,
    message,
  }
}

export default generateTypedData
