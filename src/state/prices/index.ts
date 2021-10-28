/* eslint-disable */
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PriceApiResponse, PriceApiThunk, PriceState } from 'state/types'
import BigNumber from 'bignumber.js'
import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { useTokenPrice } from '../hooks'

const initialState: PriceState = {
  isLoading: false,
  lastUpdated: null,
  data: null,
}

const CoinGecko = require('coingecko-api')

//2. Initiate the CoinGecko API Client
const CoinGeckoClient = new CoinGecko()

let earnable_price
let soku_price
let yummy_price

//3. Make calls
const getEarnablePrice = async () => {
  const res = await CoinGeckoClient.coins.fetch('earnable')
  // console.log(res)
  const data = await res.data
  const unformatted_price = new BigNumber(data.market_data.current_price.usd).toString()
  // console.log(earn_price)
  const formatted_price = parseFloat(unformatted_price).toLocaleString(undefined, {
    minimumSignificantDigits: 3,
  })

  earnable_price = formatted_price
}

const getTasteYUMMYPrice = async () => {
  const res = await CoinGeckoClient.coins.fetch('yummy')
  // console.log(res)
  const data = await res.data
  const unformatted_price = new BigNumber(data.market_data.current_price.usd).toString()
  // console.log(earn_price)
  const formatted_price = parseFloat(unformatted_price).toLocaleString(undefined, {
    minimumSignificantDigits: 3,
  })

  yummy_price = formatted_price
}

const getSokuPrice = async () => {
  const res = await CoinGeckoClient.coins.fetch('sokuswap')
  // console.log(res)
  const data = await res.data
  const unformatted_price = new BigNumber(data.market_data.current_price.usd).toString()
  // console.log(earn_price)
  const formatted_price = parseFloat(unformatted_price).toLocaleString(undefined, {
    minimumSignificantDigits: 3,
  })

  soku_price = formatted_price
}

getEarnablePrice()
getTasteYUMMYPrice()
getSokuPrice()

export const bnbPrice = () => {
  const price = useTokenPrice('binance-coin')
  return price
}

export const sokuPrice = () => {
  const price = useTokenPrice('sokuswap')
  console.log('price', price)
  return price
}

// Thunks
export const fetchPrices = createAsyncThunk<PriceApiThunk>('prices/fetch', async () => {
  const response = await fetch('https://api.pancakeswap.info/api/v2/tokens')
  const coingecko = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&sparkline=false',
  )

  // console.log('coingecko', await coingecko.json())

  const data = (await response.json()) as PriceApiResponse

  // console.log(earnable_price)

  const earn = {
    '0x11ba78277d800502c84c5aed1374ff0a91f19f7e': {
      name: 'Earnable',
      symbol: 'EARN',
      price: earnable_price,
      price_BNB: earnable_price,
    },
  }

  const soku = {
    '0x0e4b5ea0259eb3d66e6fcb7cc8785817f8490a53': {
      name: 'Soku',
      symbol: 'SOKU',
      price: soku_price,
      price_BNB: soku_price,
    },
  }

  // const tastenft = {
  //   '0xdb238123939637d65a03e4b2b485650b4f9d91cb': {
  //     name: 'TasteNFT',
  //     symbol: 'TASTE',
  //     price: tastenft_price,
  //     price_BNB: tastenft_price,
  //   },
  // }

  const yummy = {
    '0xB003C68917BaB76812797d1b8056822f48E2e4fe': {
      name: 'YUMMY',
      symbol: 'YUMMY',
      price: yummy_price,
      price_BNB: yummy_price,
    },
  }

  // console.log('yummy', yummy_price)

  Object.assign(data.data, earn)
  Object.assign(data.data, soku)
  Object.assign(data.data, yummy)

  // console.log(data.data)

  // Return normalized token names
  return {
    updated_at: data.updated_at,
    data: Object.keys(data.data).reduce((accum, token) => {
      // console.log(token)
      return {
        ...accum,
        [token.toLowerCase()]: parseFloat(data.data[token].price),
      }
    }, {}),
  }
})

export const pricesSlice = createSlice({
  name: 'prices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchPrices.pending, (state) => {
      state.isLoading = true
    })
    builder.addCase(fetchPrices.fulfilled, (state, action: PayloadAction<PriceApiThunk>) => {
      state.isLoading = false
      state.lastUpdated = action.payload.updated_at
      state.data = action.payload.data
    })
  },
})

export default pricesSlice.reducer
