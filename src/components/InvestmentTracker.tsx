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
          {getPortfolioContextLabel(client.portfolioContext)}
        </div>
      </div>

      {/* Investment 1: Land */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-slate-900">Investment 1: Land</span>
          </div>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Purchase Price:</span>
            <span className="font-semibold">{formatCurrency(client.landValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Projected Value:</span>
            <span className="font-semibold text-green-600">{formatCurrency(client.landProjected)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-100">
            <span className="text-slate-700 font-medium">Appreciation:</span>
            <span className="font-bold text-green-600">
              {formatCurrency(landAppreciation)} 
              <span className="text-xs ml-1">
                (+{((landAppreciation / client.landValue) * 100).toFixed(1)}%)
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Investment 2: Building */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-amber-600" />
            <span className="font-semibold text-slate-900">Investment 2: Building</span>
          </div>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Construction Cost:</span>
            <span className="font-semibold">{formatCurrency(client.buildingCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Retained Value:</span>
            <span className="font-semibold text-amber-600">{formatCurrency(buildingRetained)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-100">
            <span className="text-slate-700 font-medium">Depreciation Prevented:</span>
            <span className="font-bold text-amber-600">
              {formatCurrency(client.buildingCost * 0.20 - buildingDepreciation)}
              <span className="text-xs ml-1">
                ({((1 - depreciationRate / 0.20) * 100).toFixed(0)}%)
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Total ROI */}
      <div className="px-6 py-4 bg-slate-50">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-700">Total Investment:</span>
            <span className="font-semibold">{formatCurrency(totalInvested)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-700">Projected Exit Value:</span>
            <span className="font-semibold text-green-600">{formatCurrency(totalExit)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t-2 border-slate-300">
            <span className="font-serif font-bold text-slate-900">Total ROI:</span>
            <div className="text-right">
              <div className="font-bold text-green-600">{formatCurrency(totalROI)}</div>
              <div className="text-xs text-green-600">+{roiPercentage.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Context */}
      <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
        <div className="text-xs text-center text-slate-600 mb-2">Portfolio Weighting</div>
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
  );
};
