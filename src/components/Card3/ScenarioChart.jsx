import React, { useState, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { CloudArrowDownIcon } from '@heroicons/react/24/outline'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function ScenarioChart({ 
  stocks, 
  investedAmount, 
  timeRange,
  interval = 'monthly' // 'monthly' or 'yearly'
}) {
  const chartRef = useRef(null)
  const [visibleScenarios, setVisibleScenarios] = useState({
    bear: true,
    base: true,
    bull: true
  })

  if (!stocks.length) {
    return (
      <div className="h-[400px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No Stocks Selected</p>
          <p className="text-sm">Select up to three stocks to view scenarios</p>
        </div>
      </div>
    )
  }

  const calculateRiskFactor = (stock) => {
    const spread = Math.abs(stock.predictions.bull - stock.predictions.bear)
    const volatility = spread / 3 // Simple volatility measure
    return Math.min(Math.max(volatility / 20, 0.3), 0.7) // Normalize between 0.3 and 0.7
  }

  const getTimeLabels = () => {
    const totalPoints = interval === 'monthly' ? timeRange * 12 : timeRange
    return Array.from({ length: totalPoints + 1 }, (_, i) => {
      if (interval === 'monthly') {
        const month = i % 12
        const year = Math.floor(i / 12)
        return `${year}Y${month + 1}M`
      }
      return `Year ${i}`
    })
  }

  const calculateScenarioValue = (initialAmount, returnRate, period) => {
    const periodsPerYear = interval === 'monthly' ? 12 : 1
    const adjustedReturn = returnRate / 100 / periodsPerYear
    return initialAmount * Math.pow(1 + adjustedReturn, period)
  }

  const datasets = stocks.flatMap(stock => {
    const riskFactor = calculateRiskFactor(stock)
    const labels = getTimeLabels()

    return [
      {
        label: `${stock.ticker} Bear`,
        data: visibleScenarios.bear ? labels.map((_, i) => 
          calculateScenarioValue(investedAmount, stock.predictions.bear, i)
        ) : [],
        borderColor: `rgba(239, 68, 68, ${1 - riskFactor})`,
        backgroundColor: `rgba(239, 68, 68, ${0.1 + riskFactor * 0.2})`,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        hidden: !visibleScenarios.bear
      },
      {
        label: `${stock.ticker} Base`,
        data: visibleScenarios.base ? labels.map((_, i) => 
          calculateScenarioValue(investedAmount, stock.predictions.base, i)
        ) : [],
        borderColor: `rgba(59, 130, 246, ${1 - riskFactor})`,
        backgroundColor: `rgba(59, 130, 246, ${0.1 + riskFactor * 0.2})`,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        hidden: !visibleScenarios.base
      },
      {
        label: `${stock.ticker} Bull`,
        data: visibleScenarios.bull ? labels.map((_, i) => 
          calculateScenarioValue(investedAmount, stock.predictions.bull, i)
        ) : [],
        borderColor: `rgba(34, 197, 94, ${1 - riskFactor})`,
        backgroundColor: `rgba(34, 197, 94, ${0.1 + riskFactor * 0.2})`,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        hidden: !visibleScenarios.bull
      }
    ]
  })

  const handleExport = async (format) => {
    if (!chartRef.current) return

    const canvas = chartRef.current.canvas
    if (format === 'png') {
      const link = document.createElement('a')
      link.download = 'scenario-analysis.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } else if (format === 'pdf') {
      // In a real implementation, you'd want to use a proper PDF library
      // This is just a placeholder for the concept
      console.log('PDF export would go here')
    }
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          filter: (legendItem) => {
            const scenarioType = legendItem.text.toLowerCase()
            return scenarioType.includes('bear') ? visibleScenarios.bear :
                   scenarioType.includes('base') ? visibleScenarios.base :
                   scenarioType.includes('bull') ? visibleScenarios.bull : true
          }
        },
        onClick: (e, legendItem) => {
          const scenarioType = legendItem.text.toLowerCase()
          const newVisibleScenarios = { ...visibleScenarios }
          
          if (scenarioType.includes('bear')) newVisibleScenarios.bear = !newVisibleScenarios.bear
          else if (scenarioType.includes('base')) newVisibleScenarios.base = !newVisibleScenarios.base
          else if (scenarioType.includes('bull')) newVisibleScenarios.bull = !newVisibleScenarios.bull
          
          setVisibleScenarios(newVisibleScenarios)
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: (context) => {
            const value = context.raw.toLocaleString(undefined, { 
              style: 'currency', 
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            })
            const riskFactor = calculateRiskFactor(stocks[Math.floor(context.datasetIndex / 3)])
            const riskLevel = riskFactor < 0.4 ? 'Low' : riskFactor < 0.6 ? 'Medium' : 'High'
            return `${context.dataset.label}: ${value} (Risk: ${riskLevel})`
          }
        },
        titleFont: {
          family: "'Inter', sans-serif"
        },
        bodyFont: {
          family: "'Roboto', sans-serif"
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1
          }).format(value),
          font: {
            family: "'Roboto', sans-serif"
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Roboto', sans-serif"
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {Object.entries(visibleScenarios).map(([scenario, isVisible]) => (
              <button
                key={scenario}
                onClick={() => setVisibleScenarios(prev => ({
                  ...prev,
                  [scenario]: !prev[scenario]
                }))}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  isVisible 
                    ? scenario === 'bear' ? 'bg-red-100 text-red-800' :
                      scenario === 'base' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
              </button>
            ))}
          </div>
          <select
            className="input py-1 px-3"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport('png')}
            className="btn btn-secondary py-1 px-3"
          >
            <CloudArrowDownIcon className="w-4 h-4 mr-1" />
            Export PNG
          </button>
        </div>
      </div>
      <div className="h-[400px]">
        <Line ref={chartRef} options={options} data={{ labels: getTimeLabels(), datasets }} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        {stocks.map(stock => {
          const riskFactor = calculateRiskFactor(stock)
          const riskLevel = riskFactor < 0.4 ? 'Low' : riskFactor < 0.6 ? 'Medium' : 'High'
          return (
            <div key={stock.ticker} className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
              <span className="font-medium">{stock.ticker}</span>
              <span className={`px-2 py-0.5 rounded-full ${
                riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {riskLevel} Risk
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
