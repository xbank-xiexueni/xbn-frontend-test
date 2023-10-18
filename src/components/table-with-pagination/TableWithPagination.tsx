import { Flex } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

import { MyTable, Pagination } from 'components'
import type { MyTableProps } from 'components/my-table'

import type { PaginationProps } from 'rc-pagination'
import type { FunctionComponent } from 'react'

const TableWithPagination: FunctionComponent<{
  table: MyTableProps
  pagination?: PaginationProps
}> = ({ table: { data, key, ...rest }, pagination }) => {
  const [cPage, setCPage] = useState(1)
  const currentData = useMemo(() => {
    return data.slice((cPage - 1) * 10, cPage * 10)
  }, [data, cPage])
  return (
    <>
      <MyTable
        data={currentData}
        {...rest}
        key={key}
      />
      <Flex
        justify={'end'}
        mt='24px'>
        <Pagination
          total={data?.length}
          pageSize={10}
          onChange={(page) => {
            if (cPage === page) return
            setCPage(page)
          }}
          current={cPage}
          style={{
            display: data && data?.length > 10 ? 'flex' : 'none',
          }}
          isScrollTop={false}
          {...pagination}
        />
      </Flex>
    </>
  )
}

export default TableWithPagination
