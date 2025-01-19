import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BiSort, BiFilter } from 'react-icons/bi'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { stocks, metricLabels } from '../../data/stocks'
import { Tooltip } from '../shared/Tooltip'

export default function Card2() {
  const navigate = useNavigate()
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [filters, setFilters] = useState({})
  const [searchTerm, setSearchTerm] = useState('')

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleFilter = (key, value) => {
    setFilters(current => ({
      ...current,
      [key]: current[key] === value ? null : value
    }))
  }

  const filteredAndSortedStocks = useMemo(() => {
    let result = [...stocks]

    // Apply search filter
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase()
      result = result.filter(stock => 
        stock.name.toLowerCase().includes(lowercaseSearch) ||
        stock.ticker.toLowerCase().includes(lowercaseSearch)
      )
    }

    // Apply metric filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(stock => {
          if (key.startsWith('predictions.')) {
            const predType = key.split('.')[1]
            return stock.predictions[predType] >= value
          }
          return stock.metrics[key] >= value
        })
      }
    })

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue, bValue

        if (sortConfig.key === 'name') {
          aValue = a.name
          bValue = b.name
        } else if (sortConfig.key.startsWith('predictions.')) {
          const predType = sortConfig.key.split('.')[1]
          aValue = a.predictions[predType]
          bValue = b.predictions[predType]
        } else {
          aValue = a.metrics[sortConfig.key]
          bValue = b.metrics[sortConfig.key]
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [stocks, sortConfig, filters, searchTerm])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-inter font-semibold text-gray-900">
            Stock Comparison
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Compare metrics across multiple stocks
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 py-2"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </header>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </span>
                    <button
                      onClick={() => handleSort('name')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <BiSort size={16} />
                    </button>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticker
                  </span>
                </th>
                {Object.entries(metricLabels).map(([key, label]) => (
                  <th
                    key={key}
                    scope="col"
                    className="px-6 py-3 text-left"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {label}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleSort(key)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <BiSort size={16} />
                        </button>
                        <Tooltip content={`Filter by ${label}`}>
                          <button
                            onClick={() => handleFilter(key, 9)}
                            className={`${
                              filters[key] === 9 ? 'text-primary-600' : 'text-gray-400'
                            } hover:text-primary-700`}
                          >
                            <BiFilter size={16} />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  </th>
                ))}
                <th scope="col" className="px-6 py-3 text-left">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Predictions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedStocks.map((stock) => (
                <motion.tr
                  key={stock.ticker}
                  onClick={() => navigate('/', { state: { stock } })}
                  className="hover:bg-primary-50 cursor-pointer transition-colors"
                  whileHover={{ scale: 1.005 }}
                  transition={{ type: "tween", duration: 0.2 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-primary-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary-700">
                          {stock.ticker.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {stock.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {stock.industry}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {stock.ticker}
                    </span>
                  </td>
                  {Object.keys(metricLabels).map(key => (
                    <td key={key} className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">
                          {stock.metrics[key]}
                        </span>
                        <div className="flex-grow h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-600 rounded-full transition-all duration-300"
                            style={{ width: `${(stock.metrics[key] / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-red-600">
                        {stock.predictions.bear}%
                      </span>
                      <span className="text-sm text-gray-600">
                        {stock.predictions.base}%
                      </span>
                      <span className="text-sm text-green-600">
                        +{stock.predictions.bull}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
