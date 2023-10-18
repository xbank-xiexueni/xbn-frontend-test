import { Input, type InputProps } from '@chakra-ui/react'
import { useMemo, type FunctionComponent } from 'react'

const CustomNumberInput: FunctionComponent<
  InputProps & {
    onSetValue: (v: string) => void
    minValue?: number
    maxValue?: number
    // 自定义小数位数的还没写
    precious?: number
  }
> = ({
  isInvalid,
  onSetValue,
  minValue = 0,
  maxValue = 100000000,
  precious = 8,
  _hover,
  _focus,
  _focusVisible,
  ...rest
}) => {
  const reg = useMemo(() => {
    return eval(`/^(-)*(\\d+).(\\d{0,${precious}}).*$/`)
  }, [precious])
  return (
    <Input
      w='100%'
      errorBorderColor='red.1'
      isInvalid={isInvalid}
      borderColor='gray.3'
      _hover={{
        borderColor: 'gray.3',
        ..._hover,
      }}
      type='number'
      title=''
      // @ts-ignore
      onWheel={(e) => e.target.blur()}
      onInput={(e: any) => {
        const v = e.target.value as string
        if (Number(v) < minValue) {
          onSetValue('')
          return
        }

        if (Number(v) > maxValue) {
          onSetValue(`${maxValue}`)
          return
        }
        onSetValue(
          v.includes('.')
            ? v.replace(reg, '$1$2.$3')
            : // ? v.replace(/^(-)*(\d+)\.(\d\d\d\d\d\d\d\d\d\d).*$/, '$1$2.$3')
              v,
        )
      }}
      h={{
        md: '60px',
        sm: '42px',
        xs: '42px',
      }}
      _focus={{
        borderColor: isInvalid ? 'red.1' : 'blue.1',
        ..._focus,
      }}
      _focusVisible={{
        boxShadow: `0 0 0 1px var(--chakra-colors-${
          isInvalid ? 'red-1' : 'blue-1'
        })`,
        ..._focusVisible,
      }}
      placeholder='Amount...'
      borderRadius={8}
      {...rest}
    />
  )
}

export default CustomNumberInput
