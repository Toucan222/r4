import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { stocks } from '../../data/stocks'
import StockSelector from './StockSelector'
import ScenarioChart from './ScenarioChart'
import { CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function Card3() {
  const [investedAmount, setInvestedAmount] = useState("10000")
  const [timeRange, setTimeRange] = useState("1")
  const [selectedStocks, setSelectedStocks] = useState([])
  const [interval, setInterval] = useState('monthly')

  const handleStockSelect = (stock) => {
    if (selectedStocks.length < 3 && !selectedStocks.find(s => s.ticker === stock?.ticker)) {
      setSelectedStocks([...selectedStocks, stock])
    }
  }

  const handleRemoveStock = (ticker) => {
    setSelectedStocks(selectedStocks.filter(s => s.ticker !== ticker))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-inter font-semibold text-gray-900">
          Investment Scenarios
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Model potential returns across different scenarios
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="card p-6">
            <h3 className="font-inter font-medium text-gray-900 mb-4">
              Investment Parameters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invested Amount
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={investedAmount}
                    onChange={(e) => setInvestedAmount(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Range (Years): {timeRange}
                </label>
                <div className="relative">
                  <ClockIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="w-full mt-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Stocks (max 3)
                </label>
                <StockSelector
                  stocks={stocks}
                  selected={null}
                  onChange={handleStockSelect}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedStocks.map(stock => (
                  <motion.span
                    key={stock.ticker}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {stock.ticker}
                    <button
                      type="button"
                      onClick={() => handleRemoveStock(stock.ticker)}
                      className="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-primary-400 hover:text-primary-600"
                    >
                      ×
                    </button>
                  </motion.span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="card p-6">
            <ScenarioChart 
              stocks={selectedStocks}
              investedAmount={parseFloat(investedAmount) || 0}
              timeRange={parseFloat(timeRange) || 1}
              interval={interval}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
