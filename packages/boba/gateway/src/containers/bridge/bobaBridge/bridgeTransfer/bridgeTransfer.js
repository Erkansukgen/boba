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

import { ArrowDropDown } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'
import { resetToken } from 'actions/bridgeAction'
import { openModal } from 'actions/uiAction'

import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  selectBridgeTokens, 
  selectMultiBridgeMode,
  selectAccountEnabled,
  selectLayer,
  selectTokens
} from 'selectors'


import * as S from './bridgeTransfer.styles'

import DoExitStep from 'containers/modals/exit/steps/DoExitStep'
import InputStep from 'containers/modals/deposit/steps/InputStep'
import InputStepBatch from 'containers/modals/deposit/steps/InputStepBatch'
import { fetchLookUpPrice } from 'actions/networkAction'
import { LAYER } from 'util/constant'

function BridgeTransfer() {

  const accountEnabled = useSelector(selectAccountEnabled())

  const layer = useSelector(selectLayer())
  //const bridgeType = useSelector(selectBridgeType())
  const multibridgeMode = useSelector(selectMultiBridgeMode())
  const tokenList = useSelector(selectTokens)
  const tokens = useSelector(selectBridgeTokens())

  const dispatch = useDispatch()

  const onReset = () => {
    dispatch(resetToken())
  }

  const openTokenPicker = (index = 0) => {
    dispatch(openModal('tokenPicker', null, null, index))
  }

  const getLookupPrice = useCallback(() => {
    if (!accountEnabled) return
    // only run once all the tokens have been added to the tokenList
    if (Object.keys(tokenList).length < 27) return
    const symbolList = Object.values(tokenList).map((i) => {
      if (i.symbolL1 === 'ETH') {
        return 'ethereum'
      } else if (i.symbolL1 === 'OMG') {
        return 'omg'
      } else if(i.symbolL1 === 'BOBA') {
        return 'boba-network'
      } else if(i.symbolL1 === 'OLO') {
        return 'oolongswap'
      } else {
        return i.symbolL1.toLowerCase()
      }
    })
    dispatch(fetchLookUpPrice(symbolList))
  }, [ tokenList, dispatch, accountEnabled ])

  useEffect(() => {
    if (!accountEnabled) return
    getLookupPrice()
  }, [ getLookupPrice, accountEnabled ])

  return (
    <S.BridgeTransferContainer my={1}>

      {!tokens.length && !multibridgeMode &&
        <S.TokenPicker
          sx={{
            background: '#BAE21A',
            color: '#031313',
          }}
          onClick={() => { openTokenPicker(0) }}
        >
          <Typography whiteSpace="nowrap" variant="body2">Select Token </Typography>
          <ArrowDropDown fontSize="medium" />
        </S.TokenPicker>
      }

      {tokens.length > 0 && !multibridgeMode &&
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2">
            {'Boba Classic Bridge'}
          </Typography>
        </Box>
      }

      {tokens.length > 0 && !multibridgeMode && <>
        {layer === LAYER.L1 &&
          <InputStep handleClose={onReset} openTokenPicker={openTokenPicker} isBridge={true} token={tokens[ 0 ]} />
        }
        {layer === LAYER.L2 &&
          <DoExitStep handleClose={onReset} openTokenPicker={openTokenPicker} isBridge={true} token={tokens[ 0 ]}/>
        }
        </>
      }

      {multibridgeMode ? <InputStepBatch handleClose={onReset} isBridge={true}  /> : null}

    </S.BridgeTransferContainer>
  )
}

export default React.memo(BridgeTransfer)
