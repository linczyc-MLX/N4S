import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Client } from '../types';
import { getKYCWeight, getKYMWeight, getPortfolioContextLabel } from '../utils/storage';

interface InvestmentTrackerProps {
  client: Client;
}

export const InvestmentTracker: React.FC<InvestmentTrackerProps> = ({ client }) => {
  // Calculate depreciation prevention based on portfolio context
  const getDepreciationRate = () => {
    // Traditional depreciation is ~20% over time
    // N4S reduces this significantly based on portfolio alignment
    const baseDepreciation = 0.20;
    const kycWeight = getKYCWeight(client.portfolioContext);
    const kymWeight = getKYMWeight(client.portfolioContext);
    
    // Higher KYM weight = better market alignment = less depreciation
    const depreciationReduction = kymWeight * 0.75; // Up to 75% reduction
    return baseDepreciation * (1 - depreciationReduction);
  };

  const depreciationRate = getDepreciationRate();
  const landAppreciation = client.landProjected - client.landValue;
  const buildingDepreciation = client.buildingCost * depreciationRate;
  const buildingRetained = client.buildingCost - buildingDepreciation;
  const totalInvested = client.landValue + client.buildingCost;
  const totalExit = client.landProjected + buildingRetained;
  const totalROI = totalExit - totalInvested;
  const roiPercentage = (totalROI / totalInvested) * 100;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white border-2 border-slate-200 rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-white text-lg">Investment Projection</h3>
          <DollarSign className="w-5 h-5 text-amber-400" />
        </div>
        <div className="text-xs text-slate-300 mt-1">
          {getPortfolioContextLabel(client.portfolioContext)} Strategy
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Land Investment */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Land Value</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-600">Purchase</span>
              <span className="text-sm font-mono text-slate-700">{formatCurrency(client.landValue)}</span>
            </div>
            <div className="flex justify-between items-baseline mt-1">
              <span className="text-xs text-slate-600">Projected</span>
              <span className="text-lg font-mono font-bold text-green-700">{formatCurrency(client.landProjected)}</span>
            </div>
            <div className="text-xs text-green-600 mt-2 font-semibold">
              +{formatCurrency(landAppreciation)} ({((landAppreciation / client.landValue) * 100).toFixed(1)}%)
            </div>
          </div>
        </div>

        {/* Building Investment */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Building Value</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <div className="flex justify-between items-baseline">
              <span className="text-xs text-slate-600">Construction Cost</span>
              <span className="text-sm font-mono text-slate-700">{formatCurrency(client.buildingCost)}</span>
            </div>
            <div className="flex justify-between items-baseline mt-1">
              <span className="text-xs text-slate-600">Retained Value</span>
              <span className="text-lg font-mono font-bold text-amber-700">{formatCurrency(buildingRetained)}</span>
            </div>
            <div className="text-xs text-amber-600 mt-2 font-semibold">
              -{formatCurrency(buildingDepreciation)} ({(depreciationRate * 100).toFixed(1)}% depreciation)
            </div>
            <div className="text-xs text-slate-500 mt-1">
              N4S prevents {((1 - depreciationRate/0.20) * 100).toFixed(0)}% of typical depreciation
            </div>
          </div>
        </div>

        {/* Total ROI */}
        <div className="border-t-2 border-slate-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Total ROI</span>
            {totalROI >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className={`rounded-lg p-4 border-2 ${
            totalROI >= 0 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xs text-slate-600">Total Invested</span>
              <span className="text-sm font-mono text-slate-700">{formatCurrency(totalInvested)}</span>
            </div>
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-xs text-slate-600">Projected Exit</span>
              <span className="text-2xl font-mono font-bold text-slate-900">{formatCurrency(totalExit)}</span>
            </div>
            <div className={`text-center py-2 rounded font-bold ${
              totalROI >= 0 ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {totalROI >= 0 ? '+' : ''}{formatCurrency(totalROI)} ({roiPercentage >= 0 ? '+' : ''}{roiPercentage.toFixed(1)}%)
            </div>
          </div>
        </div>

        {/* Portfolio Context */}
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-600 mb-2">Scoring Weights</div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-700">
              KYC (Client): <span className="font-bold">{(getKYCWeight(client.portfolioContext) * 100).toFixed(0)}%</span>
            </span>
            <span className="text-slate-700">
              KYM (Market): <span className="font-bold">{(getKYMWeight(client.portfolioContext) * 100).toFixed(0)}%</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
