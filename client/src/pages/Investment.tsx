import { useState, useEffect, useMemo } from 'react';
import { useClients } from '../context/ClientContext';
import { db, getOrCreateInvestment } from '../db';
import { Save, TrendingUp } from 'lucide-react';
import type { Investment as InvestmentType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0d9488', '#0891b2', '#6366f1', '#8b5cf6', '#ec4899'];

export default function Investment() {
  const { currentClient } = useClients();
  const [data, setData] = useState<InvestmentType | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentClient?.id) {
      getOrCreateInvestment(currentClient.id).then(setData);
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
    if (!data.id) return;
    setSaving(true);
    try {
      await db.investment.update(data.id, data);
    } finally {
      setSaving(false);
    }
  };

  const update = (updates: Partial<InvestmentType>) => {
    setData({ ...data, ...updates });
  };

  // Calculate totals
  const totals = useMemo(() => {
    const income = (data.incomeMan || 0) + (data.incomeWoman || 0);
    const liquidity = (data.liquidAssetsMan || 0) + (data.liquidAssetsWoman || 0);
    const investments = (data.investmentAssetsMan || 0) + (data.investmentAssetsWoman || 0);
    const totalAssets = liquidity + investments;

    return { income, liquidity, investments, totalAssets };
  }, [data]);

  const assetAllocation = [
    { name: 'Liquidität', value: totals.liquidity },
    { name: 'Anlagen', value: totals.investments },
  ].filter((d) => d.value > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-cyan-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Investment</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Einkommen/Jahr</p>
          <p className="text-2xl font-bold text-gray-900">
            {totals.income.toLocaleString('de-CH')} CHF
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Liquidität</p>
          <p className="text-2xl font-bold text-cyan-600">
            {totals.liquidity.toLocaleString('de-CH')} CHF
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Anlagevermögen</p>
          <p className="text-2xl font-bold text-primary-600">
            {totals.investments.toLocaleString('de-CH')} CHF
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Financial Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Finanzübersicht</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-700"></th>
                  <th className="text-right py-2 px-2 font-medium text-gray-700">m (CHF)</th>
                  <th className="text-right py-2 px-2 font-medium text-gray-700">w (CHF)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 font-medium text-gray-900">Einnahmen</td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={data.incomeMan || ''}
                      onChange={(e) =>
                        update({ incomeMan: parseFloat(e.target.value) || undefined })
                      }
                      className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={data.incomeWoman || ''}
                      onChange={(e) =>
                        update({ incomeWoman: parseFloat(e.target.value) || undefined })
                      }
                      className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    />
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 font-medium text-gray-900">Liquidität</td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={data.liquidAssetsMan || ''}
                      onChange={(e) =>
                        update({ liquidAssetsMan: parseFloat(e.target.value) || undefined })
                      }
                      className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={data.liquidAssetsWoman || ''}
                      onChange={(e) =>
                        update({ liquidAssetsWoman: parseFloat(e.target.value) || undefined })
                      }
                      className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    />
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 font-medium text-gray-900">Anlagevermögen</td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={data.investmentAssetsMan || ''}
                      onChange={(e) =>
                        update({ investmentAssetsMan: parseFloat(e.target.value) || undefined })
                      }
                      className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input
                      type="number"
                      value={data.investmentAssetsWoman || ''}
                      onChange={(e) =>
                        update({ investmentAssetsWoman: parseFloat(e.target.value) || undefined })
                      }
                      className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                    />
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-3 font-semibold text-gray-900">Total Vermögen</td>
                  <td className="py-3 px-2 text-right font-semibold text-primary-600">
                    {((data.liquidAssetsMan || 0) + (data.investmentAssetsMan || 0)).toLocaleString(
                      'de-CH'
                    )}
                  </td>
                  <td className="py-3 px-2 text-right font-semibold text-primary-600">
                    {(
                      (data.liquidAssetsWoman || 0) + (data.investmentAssetsWoman || 0)
                    ).toLocaleString('de-CH')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Asset Allocation Chart */}
        {assetAllocation.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vermögensaufteilung</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {assetAllocation.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${Number(value).toLocaleString('de-CH')} CHF`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">Gesamtvermögen</span>
                <span className="font-bold text-primary-600">
                  {totals.totalAssets.toLocaleString('de-CH')} CHF
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Optionen</h3>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.receivedTaxStatement}
              onChange={(e) => update({ receivedTaxStatement: e.target.checked })}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded"
            />
            <span className="text-gray-700">STEK erhalten</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.createInvestmentProfile}
              onChange={(e) => update({ createInvestmentProfile: e.target.checked })}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded"
            />
            <span className="text-gray-700">Anlageprofil erstellen</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.wantsAssetWithdrawal}
              onChange={(e) => update({ wantsAssetWithdrawal: e.target.checked })}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded"
            />
            <span className="text-gray-700">Vermögensauszug gewünscht</span>
          </label>
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ziele Investment</h3>
        <textarea
          value={data.investmentGoals || ''}
          onChange={(e) => update({ investmentGoals: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Anlageziele, Risikobereitschaft, Anlagehorizont..."
        />
      </div>
    </div>
  );
}
