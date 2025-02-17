/*
Copyright 2021-present Boba Network.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import React, { useState } from 'react'

import { poolsTableHeads } from './pools.tableHeads'

import * as G from 'containers/Global.styles'
import PoolListItem from './poolListItem'
import { Pager } from 'components'
import { PER_PAGE } from 'util/constant'
import { useSelector } from 'react-redux'
import { selectPools, selectLoading } from 'selectors'
import { Typography } from '@mui/material'


function PoolList({ onPoolVoteChange, token, onDistribute }) {

  const [ page, setPage ] = useState(1)

  const loading = useSelector(selectLoading([ 'VOTE/POOLS' ]))
  const pools = useSelector(selectPools)

  // pagination logic
  const startingIndex = page === 1 ? 0 : ((page - 1) * PER_PAGE)
  const endingIndex = page * PER_PAGE
  const paginatedPools = pools.slice(startingIndex, endingIndex)
  let totalNumberOfPages = Math.ceil(pools.length / PER_PAGE)
  if (totalNumberOfPages === 0) totalNumberOfPages = 1

  return <G.Content>
    <G.TableHeading>
      {
        poolsTableHeads.map((item) => {
          return (
            <G.TableHeadingItem
              sx={{
                width: item.size,
                flex: item.flex,
                ...item.sx
              }}
              key={item.label}
              variant="body2"
              component="div">{item.label}
            </G.TableHeadingItem>
          )
        })
      }
    </G.TableHeading>
    {loading && <Typography>Loading...</Typography>}
    {paginatedPools.map((pool) => {
      return <React.Fragment key={pool.poolId}>
        <PoolListItem
          token={token}
          pool={pool}
          onPoolVoteChange={onPoolVoteChange}
          onDistribute={onDistribute}
        />
      </React.Fragment>
    })}
    <Pager
      currentPage={page}
      isLastPage={paginatedPools.length < PER_PAGE}
      totalPages={totalNumberOfPages}
      onClickNext={() => setPage(page + 1)}
      onClickBack={() => setPage(page - 1)}
    />
  </G.Content>
}

export default PoolList;
