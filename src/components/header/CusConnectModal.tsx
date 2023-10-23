import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalProps,
} from '@chakra-ui/react'

const CusConnectModal = (props: ModalProps) => {
  return (
    <Modal
      {...props}
      isCentered>
      <ModalHeader></ModalHeader>
      <ModalBody>{props.children}</ModalBody>
      <ModalFooter></ModalFooter>
    </Modal>
  )
}
export default CusConnectModal
