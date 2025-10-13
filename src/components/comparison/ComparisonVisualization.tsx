import React, { Suspense } from 'react';
import { Card } from '@/components/common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '@/utils/format';
import type { DCFDataSet, DCFResults } from '@/types/dcf';

interface ComparisonVisualizationProps {
  scenarioA: DCFDataSet;
  scenarioB: DCFDataSet;
  resultsA: DCFResults;
  resultsB: DCFResults;
}

export const ComparisonVisualization = ({ scenarioA, scenarioB, resultsA, resultsB }: ComparisonVisualizationProps) => {
  // Prepare data for bar chart
  const barChartData = [
    {
      name: 'Enterprise Value',
      [scenarioA.label]: resultsA.enterpriseValue,
      [scenarioB.label]: resultsB.enterpriseValue,
    },
    {
      name: 'Terminal Value',
      [scenarioA.label]: resultsA.terminalValue,
      [scenarioB.label]: resultsB.terminalValue,
    },
    {
      name: 'Projections PV',
      [scenarioA.label]: resultsA.projectionsPV,
      [scenarioB.label]: resultsB.projectionsPV,
    }
  ];

  // Prepare data for pie charts
  const pieChartDataA = [
    { name: 'Projections PV', value: resultsA.projectionsPV, color: '#3B82F6' },
    { name: 'Terminal Value PV', value: resultsA.terminalValuePV, color: '#10B981' }
  ];

  const pieChartDataB = [
    { name: 'Projections PV', value: resultsB.projectionsPV, color: '#3B82F6' },
    { name: 'Terminal Value PV', value: resultsB.terminalValuePV, color: '#10B981' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-white p-3 shadow-lg border border-slate-200">
          <p className="font-medium text-slate-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Value Comparison Chart" subtitle="Side-by-side comparison of key DCF metrics">
        <div className="h-80">
          <Suspense fallback={<div className="flex items-center justify-center h-full">Loading chart...</div>}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="#64748B"
                />
                <YAxis 
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 12 }}
                  stroke="#64748B"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey={scenarioA.label} 
                  fill="#3B82F6" 
                  radius={[2, 2, 0, 0]}
                  name={scenarioA.label}
                />
                <Bar 
                  dataKey={scenarioB.label} 
                  fill="#10B981" 
                  radius={[2, 2, 0, 0]}
                  name={scenarioB.label}
                />
              </BarChart>
            </ResponsiveContainer>
          </Suspense>
        </div>
      </Card>

      <Card title="Value Composition" subtitle="Breakdown of enterprise value components">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3">{scenarioA.label}</h4>
            <div className="h-64">
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading chart...</div>}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartDataA}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieChartDataA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </Suspense>
            </div>
            <div className="flex justify-center space-x-4 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-xs text-slate-600">Projections PV</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-slate-600">Terminal Value PV</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-3">{scenarioB.label}</h4>
            <div className="h-64">
              <Suspense fallback={<div className="flex items-center justify-center h-full">Loading chart...</div>}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartDataB}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieChartDataB.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </Suspense>
            </div>
            <div className="flex justify-center space-x-4 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-xs text-slate-600">Projections PV</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-xs text-slate-600">Terminal Value PV</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};