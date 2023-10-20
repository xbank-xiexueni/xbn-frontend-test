import {
  Popover,
  PopoverTrigger,
  Flex,
  PopoverContent,
  PopoverBody,
  chakra,
  Text,
} from '@chakra-ui/react'
import { COMMUNITY_DATA } from 'components/footer/Footer'
import SvgComponent from 'components/svg-component/SvgComponent'

const CommunityPopover = () => {
  return (
    <Popover
      isLazy
      trigger='hover'
      placement='bottom-start'>
      {({ isOpen: visible }) => {
        return (
          <>
            <PopoverTrigger>
              <Flex
                fontSize='16px'
                px={0}
                gap={'4px'}
                _focus={{ bg: 'transparent' }}
                _hover={{
                  bg: 'transparent',
                  color: 'var(--chakra-colors-blue-1)',
                }}
                color={visible ? 'blue.1' : 'black.1'}
                fontWeight='700'
                alignItems={'center'}
                cursor='pointer'>
                Community
                <SvgComponent
                  svgId={'icon-arrow-down'}
                  fill={
                    visible
                      ? 'var(--chakra-colors-blue-1)'
                      : 'var(--chakra-colors-black-1)'
                  }
                  transition='all 0.2s'
                  transform={`rotate(${visible ? '180deg' : '0deg'})`}
                  mt='2px'
                />
              </Flex>
              {/* </Link> */}
            </PopoverTrigger>
            <PopoverContent
              w={'140px'}
              top='16px'
              borderRadius={8}>
              <PopoverBody
                px={0}
                p={'20px'}>
                <Flex
                  flexDir={'column'}
                  gap='20px'>
                  {COMMUNITY_DATA.map(({ icon, title, url }) => (
                    <chakra.a
                      key={title}
                      href={url}
                      target='_blank'>
                      <Flex
                        borderBottomColor='gray.5'
                        alignItems={'center'}
                        gap='8px'
                        className='custom-hover-style'>
                        <SvgComponent
                          svgId={icon}
                          fill='gray.6'
                        />
                        <Text
                          fontSize='16px'
                          _hover={{
                            color: `blue.1`,
                          }}
                          color='black.1'>
                          {title}
                        </Text>
                      </Flex>
                    </chakra.a>
                  ))}
                </Flex>
              </PopoverBody>
            </PopoverContent>
          </>
        )
      }}
    </Popover>
  )
}

export default CommunityPopover
