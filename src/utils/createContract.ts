// const setAssetApprovalForAll = async (contractAddress, gasPrice, gasLimit) => {
//   // console.log(`contract_address: ${contractAddress}, token_id: ${tokenId}, gas_price: ${gasLimit} ${gasPrice}`)
//   const contract = new Web3.eth.Contract(ERC1155ABI, contractAddress)
//   const contractData = contract.methods
//     .setApprovalForAll(OPENSEA_CONDUIT_ADDRESS, true)
//     .encodeABI()
//   const accountNonce = await Web3.eth.getTransactionCount(signer.address)
//   const signedTx = await Web3.eth.accounts.signTransaction(
//     {
//       nonce: web3.utils.toHex(accountNonce),
//       gasPrice: web3.utils.toHex(gasPrice),
//       gasLimit: web3.utils.toHex(gasLimit),
//       to: contractAddress,
//       value: '0x00',
//       data: contractData,
//       chainId: chainId,
//     },
//     '0x' + conf.buyer.privKey,
//   )
//   const hash = signedTx.transactionHash
//   // console.log(`hash: ${hash}`)
//   await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
//   return hash
// }

export {}
