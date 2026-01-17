import { useState, useEffect, useMemo } from 'react';
import { useClients } from '../context/ClientContext';
import { useAuth } from '../context/AuthContext';
import { budgetService, investmentService } from '../services/data.service';
import { Save, Wallet, TrendingDown, TrendingUp } from 'lucide-react';
import type { Budget as BudgetType, Investment } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#8b5cf6', '#ec4899', '#6366f1'];

const expenseCategories = [
  { key: 'taxes', label: 'Steuern', icon: '📋' },
  { key: 'food', label: 'Essen', icon: '🍽️' },
  { key: 'mobility', label: 'Mobilität', icon: '🚗' },
  { key: 'communication', label: 'Kommunikation', icon: '📱' },
  { key: 'clothing', label: 'Kleider', icon: '👕' },
  { key: 'travel', label: 'Reisen', icon: '✈️' },
  { key: 'leisure', label: 'Freizeit', icon: '🎮' },
  { key: 'credit', label: 'Kredit', icon: '💳' },
];

export default function Budget() {
  const { currentClient } = useClients();
  const { isAdvisor } = useAuth();
  const isReadOnly = !isAdvisor;
  const [data, setData] = useState<BudgetType | null>(null);
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentClient?.id) {
      Promise.all([
        budgetService.getByClientId(currentClient.id),
        investmentService.getByClientId(currentClient.id),
      ]).then(([b, i]) => {
        setData(b);
        setInvestment(i);
      });
    }
  }, [currentClient]);

  if (!currentClient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bitte wählen Sie zuerst einen Klienten aus.</p>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12">Laden...</div>;
  }

  const handleSave = async () => {
    if (!currentClient?.id) return;
    setSaving(true);
    try {
      await budgetService.upsert(currentClient.id, data);
    } finally {
      setSaving(false);
    }
  };

  const update = (updates: Partial<BudgetType>) => {
    setData({ ...data, ...updates });
  };

  // Calculate totals
  const calculations = useMemo(() => {
    const monthlyIncome =
      ((investment?.incomeMan || 0) + (investment?.incomeWoman || 0)) / 12;

    const totalExpenses = expenseCategories.reduce((sum, cat) => {
      const manKey = `${cat.key}Man` as keyof BudgetType;
      const womanKey = `${cat.key}Woman` as keyof BudgetType;
      return sum + ((data[manKey] as number) || 0) + ((data[womanKey] as number) || 0);
    }, 0);

    const savingsRate = (data.savingsRateMan || 0) + (data.savingsRateWoman || 0);
    const totalOutflow = totalExpenses + savingsRate;
    const balance = monthlyIncome - totalOutflow;

    const savingsRatePercentage = monthlyIncome > 0 ? (savingsRate / monthlyIncome) * 100 : 0;

    return {
      monthlyIncome,
      totalExpenses,
      savingsRate,
      totalOutflow,
      balance,
      savingsRatePercentage,
    };
  }, [data, investment]);

  // Expense breakdown for chart
  const expenseData = expenseCategories
    .map((cat) => {
      const manKey = `${cat.key}Man` as keyof BudgetType;
      const womanKey = `${cat.key}Woman` as keyof BudgetType;
      const value = ((data[manKey] as number) || 0) + ((data[womanKey] as number) || 0);
      return { name: cat.label, value };
    })
    .filter((d) => d.value > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <Wallet className="w-5 h-5 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Budget</h2>
        </div>
        {!isReadOnly && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Speichern...' : 'Speichern'}
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <p className="text-sm text-gray-500">Einkommen/Mt.</p>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {calculations.monthlyIncome.toLocaleString('de-CH', { maximumFractionDigits: 0 })} CHF
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <p className="text-sm text-gray-500">Ausgaben/Mt.</p>
          </div>
          <p className="text-2xl font-bold text-red-600">
            {calculations.totalExpenses.toLocaleString('de-CH', { maximumFractionDigits: 0 })} CHF
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Sparquote</p>
          <p className="text-2xl font-bold text-primary-600">
            {calculations.savingsRate.toLocaleString('de-CH', { maximumFractionDigits: 0 })} CHF
          </p>
          <p className="text-xs text-gray-400">
            {calculations.savingsRatePercentage.toFixed(1)}% vom Einkommen
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Saldo</p>
          <p
            className={`text-2xl font-bold ${
              calculations.balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {calculations.balance.toLocaleString('de-CH', { maximumFractionDigits: 0 })} CHF
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expense Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Monatliche Ausgaben</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-700">Kategorie</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-700 w-28">m (CHF)</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-700 w-28">w (CHF)</th>
                </tr>
              </thead>
              <tbody>
                {expenseCategories.map((cat) => {
                  const manKey = `${cat.key}Man` as keyof BudgetType;
                  const womanKey = `${cat.key}Woman` as keyof BudgetType;
                  return (
                    <tr key={cat.key} className="border-b border-gray-100">
                      <td className="py-3">
                        <span className="mr-2">{cat.icon}</span>
                        {cat.label}
                        {cat.key === 'taxes' && (
                          <label className="ml-3 inline-flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={data.taxesDA || false}
                              onChange={(e) => update({ taxesDA: e.target.checked })}
                              disabled={isReadOnly}
                              className="w-3 h-3 text-primary-600 border-gray-300 rounded"
                            />
                            <span className="text-xs text-gray-500">DA</span>
                          </label>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          value={(data[manKey] as number) || ''}
                          onChange={(e) =>
                            update({ [manKey]: parseFloat(e.target.value) || undefined })
                          }
                          disabled={isReadOnly}
                          className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="number"
                          value={(data[womanKey] as number) || ''}
                          onChange={(e) =>
                            update({ [womanKey]: parseFloat(e.target.value) || undefined })
                          }
                          disabled={isReadOnly}
                          className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                        />
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 font-semibold">
                  <td className="py-3">Total Ausgaben</td>
                  <td className="py-3 px-2 text-right" colSpan={2}>
                    {calculations.totalExpenses.toLocaleString('de-CH', {
                      maximumFractionDigits: 0,
                    })}{' '}
                    CHF
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Expense Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ausgabenverteilung</h3>
          {expenseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {expenseData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) =>
                    `${Number(value).toLocaleString('de-CH', { maximumFractionDigits: 0 })} CHF`
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-500">
              Keine Ausgaben erfasst
            </div>
          )}
        </div>
      </div>

      {/* Savings Rate */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Sparquote</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sparquote m (CHF/Mt.)</label>
            <input
              type="number"
              value={data.savingsRateMan || ''}
              onChange={(e) => update({ savingsRateMan: parseFloat(e.target.value) || undefined })}
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sparquote w (CHF/Mt.)</label>
            <input
              type="number"
              value={data.savingsRateWoman || ''}
              onChange={(e) => update({ savingsRateWoman: parseFloat(e.target.value) || undefined })}
              disabled={isReadOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="sm:col-span-2">
            <div className="bg-primary-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-primary-700">Sparquote gesamt</span>
                <span className="font-bold text-primary-700">
                  {calculations.savingsRate.toLocaleString('de-CH', { maximumFractionDigits: 0 })} CHF/Mt.
                </span>
              </div>
              <div className="w-full bg-primary-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(calculations.savingsRatePercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-primary-600 mt-1">
                {calculations.savingsRatePercentage.toFixed(1)}% des Einkommens
                {calculations.savingsRatePercentage >= 20 && ' (Empfohlen: mind. 20%)'}
                {calculations.savingsRatePercentage < 20 && (
                  <span className="text-amber-600"> (Empfohlen: mind. 20%)</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
