import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Highlight,
  chakra,
  Box,
} from '@chakra-ui/react'
import BigNumber from 'bignumber.js'
import { useMemo, type FunctionComponent, useEffect, useState } from 'react'
import { useContractWrite, useWaitForTransaction } from 'wagmi'

import allowanceGif from 'assets/allowance.gif'
import { CustomCheckBox, ImageWithFallback, SvgComponent } from 'components'
import {
  MODEL_HEADER_PROPS,
  WETH_CONTRACT_ABI,
  WETH_CONTRACT_ADDRESS,
  XBANK_CONTRACT_ADDRESS,
} from 'constants/index'
import { useWallet } from 'hooks'
import { formatWagmiErrorMsg } from 'utils/format'
import { wei2Eth } from 'utils/unit-conversion'

const AllowanceModal: FunctionComponent<{
  isOpen: boolean
  onClose: (a: number) => void
}> = ({ isOpen, onClose, ...rest }) => {
  const [isReject, setIsReject] = useState(false)
  const {
    myPoolsConfig: { runAsync, data: myPools, loading: poolLoading },
  } = useWallet()

  useEffect(() => {
    if (!isOpen) return
    runAsync?.()
  }, [runAsync, isOpen])

  const suggestCaps = useMemo(() => {
    if (myPools === undefined) return
    return myPools.reduce(
      (sum, i) => sum.plus(BigNumber(i.supply_cap).minus(i.supply_used || 0)),
      BigNumber(0),
    )
  }, [myPools])

  const suggestCapsStr = useMemo(() => {
    const ethCaps = wei2Eth(suggestCaps)
    return ethCaps ? ethCaps.toString() : ''
  }, [suggestCaps])

  const {
    writeAsync: runApproveAsync,
    data: approveData,
    isLoading: isWriteApproveLoading,
    isError: isApproveError,
    error: approveError,
  } = useContractWrite({
    address: WETH_CONTRACT_ADDRESS as `0x${string}` | undefined,
    abi: [WETH_CONTRACT_ABI.find((i) => i.name === 'approve')],
    functionName: 'approve',
  })
  const { isLoading: isWaitApproveLoading } = useWaitForTransaction({
    hash: approveData?.hash,
    async onSuccess() {
      onClose(isReject ? 1 * 24 * 60 * 60 : 0)
    },
  })
  const approveLoading = useMemo(() => {
    return isWaitApproveLoading || isWriteApproveLoading
  }, [isWaitApproveLoading, isWriteApproveLoading])

  if (!isOpen) return null
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(isReject ? 1 * 24 * 60 * 60 : 0)}
      isCentered
      scrollBehavior='inside'
      closeOnOverlayClick={false}
      closeOnEsc={false}
      {...rest}>
      <ModalOverlay bg='black.2' />
      <ModalContent
        maxW={{
          xl: '900px',
          lg: '900px',
          md: '576px',
          sm: '350px',
          xs: '326px',
        }}
        maxH={{
          md: '600px',
          sm: '700px',
          xs: '700px',
        }}
        borderRadius={16}
        boxShadow={'none'}>
        <ModalHeader
          {...MODEL_HEADER_PROPS}
          borderBottomRadius={0}
          px={{
            md: '40px',
            sm: '10px',
            xs: '10px',
          }}
          lineHeight={1}>
          Authorize Allowance
          {/* <SvgComponent
            svgId='icon-close'
            onClick={onClose}
            cursor={'pointer'}
          /> */}
        </ModalHeader>
        <ModalBody
          m={0}
          p={0}
          bg='white'
          borderBottomRadius={16}>
          <Box
            bg='white'
            px={{
              md: '40px',
              sm: '10px',
              xs: '10px',
            }}>
            <Text
              fontSize={{
                md: '16px',
                xs: '14px',
                sm: '14px',
              }}
              lineHeight={'1.2'}
              px={0}>
              <Highlight
                query={['CANNOT', 'decreases', `won't renew`, 'must update']}
                styles={{
                  fontWeight: '700',
                }}>
                Authorize an allowance to enable lending and you CANNOT lend
                without any allowance. Each loan decreases allowance. It
                won&apos;t renew automatically. You must update the allowance to
                lend more.&nbsp;
              </Highlight>
              <chakra.a
                color={'blue.1'}
                href={`${process.env.REACT_APP_DOCS_URL}/~/changes/xNBa1UTDe3cFb6VrsAMh/fundamentals/lending-q-and-a`}
                target='_blank'
                _hover={{
                  textDecoration: 'underline',
                }}
                fontWeight={'700'}>
                Read More
              </chakra.a>
            </Text>
            <Text
              color={'red.1'}
              mt='8px'>
              Please Authorize
              <chakra.span fontWeight={'700'}>&nbsp;≥</chakra.span>
              <SvgComponent
                svgId='icon-eth'
                fill={'red.1'}
                svgSize={'14px'}
                as='span'
                display={'inline-block'}
              />
              <chakra.span fontWeight={'700'}>
                {suggestCapsStr} for this pool
              </chakra.span>
            </Text>

            <Flex
              w='100%'
              h={{
                md: '300px',
                sm: '170px',
                xs: '170px',
              }}
              mt='14px'
              justify={'center'}
              bg='gray.5'>
              <ImageWithFallback
                src={allowanceGif}
                w={{
                  md: '533px',
                  sm: '300px',
                  xs: '300px',
                }}
                h={{
                  md: '300px',
                  sm: '170px',
                  xs: '170px',
                }}
              />
            </Flex>
          </Box>

          {/* button */}

          <Flex
            px={{
              md: '40px',
              sm: '20px',
              xs: '20px',
            }}
            position={'sticky'}
            bottom={'0px'}
            justify={'center'}
            direction={'column'}
            alignItems={'center'}
            gap={'4px'}
            mt={{
              md: '20px',
              sm: '10px',
              xs: '10px',
            }}>
            <Text
              color={'red.1'}
              h='24px'>
              {isApproveError
                ? formatWagmiErrorMsg((approveError?.cause as any).message)
                : ''}
            </Text>
            <Button
              w='264px'
              h='40px'
              variant={'outline'}
              px='30px'
              onClick={() => {
                try {
                  runApproveAsync({
                    args: [
                      XBANK_CONTRACT_ADDRESS as `0x${string}`,
                      suggestCaps?.integerValue(BigNumber.ROUND_UP)?.toFixed(),
                    ],
                  })
                } catch (error: any) {
                  console.log(
                    '🚀 ~ file: AllowanceModal.tsx:246 ~ error:',
                    error,
                  )
                }
              }}
              isDisabled={poolLoading}
              isLoading={approveLoading}>
              Set Allowance
            </Button>
          </Flex>

          <CustomCheckBox
            value={isReject}
            onToggle={(v) => {
              setIsReject(v)
            }}
            mb='15px'>
            Don&apos;t Remind Me Today
          </CustomCheckBox>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default AllowanceModal
