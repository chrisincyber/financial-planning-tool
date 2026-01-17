import { useState, useEffect, useMemo } from 'react';
import { useClients } from '../context/ClientContext';
import { useAuth } from '../context/AuthContext';
import { taxOptimizationService } from '../services/data.service';
import { Save, Receipt, Calculator } from 'lucide-react';
import type { TaxOptimization as TaxOptimizationType } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Swiss tax brackets (simplified - Zürich example)
const calculateTax = (income: number): number => {
  if (income <= 0) return 0;
  // Simplified progressive tax calculation
  let tax = 0;
  if (income > 250000) tax += (income - 250000) * 0.13;
  if (income > 150000) tax += Math.min(income - 150000, 100000) * 0.11;
  if (income > 80000) tax += Math.min(income - 80000, 70000) * 0.09;
  if (income > 40000) tax += Math.min(income - 40000, 40000) * 0.07;
  if (income > 20000) tax += Math.min(income - 20000, 20000) * 0.05;
  tax += Math.min(income, 20000) * 0.02;
  return tax;
};

export default function TaxOptimization() {
  const { currentClient } = useClients();
  const { isAdvisor } = useAuth();
  const isReadOnly = !isAdvisor;
  const [data, setData] = useState<TaxOptimizationType | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentClient?.id) {
      setLoading(true);
      setError(null);
      taxOptimizationService.getByClientId(currentClient.id)
        .then(setData)
        .catch((err) => {
          console.error('Error loading tax optimization:', err);
          setError(err.message || 'Fehler beim Laden der Daten');
        })
        .finally(() => setLoading(false));
    }
  }, [currentClient]);

  if (!currentClient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bitte wählen Sie zuerst einen Klienten aus.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12">Laden...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Fehler: {error}</p>
        <p className="text-sm text-gray-500 mt-2">Bitte überprüfen Sie die Supabase-Konfiguration.</p>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12">Keine Daten gefunden.</div>;
  }

  const handleSave = async () => {
    if (!currentClient?.id) return;
    setSaving(true);
    try {
      await taxOptimizationService.upsert(currentClient.id, data);
    } finally {
      setSaving(false);
    }
  };

  const update = (updates: Partial<TaxOptimizationType>) => {
    setData({ ...data, ...updates });
  };

  // Tax calculation
  const taxCalc = useMemo(() => {
    const grossIncome = (data.taxableIncomeMan || 0) + (data.taxableIncomeWoman || 0);
    const deductions =
      (data.pillar3aContributionMan || 0) +
      (data.pillar3aContributionWoman || 0) +
      (data.pensionFundPurchase || 0) +
      (data.otherDeductions || 0);

    const taxableIncomeWithoutDeductions = grossIncome;
    const taxableIncomeWithDeductions = Math.max(0, grossIncome - deductions);

    const taxWithoutDeductions = calculateTax(taxableIncomeWithoutDeductions);
    const taxWithDeductions = calculateTax(taxableIncomeWithDeductions);
    const taxSavings = taxWithoutDeductions - taxWithDeductions;

    return {
      grossIncome,
      deductions,
      taxableIncomeWithoutDeductions,
      taxableIncomeWithDeductions,
      taxWithoutDeductions,
      taxWithDeductions,
      taxSavings,
    };
  }, [data]);

  const comparisonData = [
    { name: 'Ohne Abzüge', value: taxCalc.taxWithoutDeductions },
    { name: 'Mit Abzügen', value: taxCalc.taxWithDeductions },
  ];

  // Max 3a contributions (2024)
  const max3aEmployed = 7056;
  const max3aSelfEmployed = 35280;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Receipt className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Steueroptimierung</h2>
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

      {/* Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.receivedTaxStatement}
              onChange={(e) => update({ receivedTaxStatement: e.target.checked })}
              disabled={isReadOnly}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded"
            />
            <span className="font-medium text-gray-700">STEK erhalten</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.wantsServicePackage}
              onChange={(e) => update({ wantsServicePackage: e.target.checked })}
              disabled={isReadOnly}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded"
            />
            <span className="font-medium text-gray-700">Servicepaket erwünscht</span>
          </label>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Income */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Steuerbares Einkommen</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Einkommen m (CHF/Jahr)
              </label>
              <input
                type="number"
                value={data.taxableIncomeMan || ''}
                onChange={(e) =>
                  update({ taxableIncomeMan: parseFloat(e.target.value) || undefined })
                }
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Einkommen w (CHF/Jahr)
              </label>
              <input
                type="number"
                value={data.taxableIncomeWoman || ''}
                onChange={(e) =>
                  update({ taxableIncomeWoman: parseFloat(e.target.value) || undefined })
                }
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aktuelle Steuerbelastung (CHF)
              </label>
              <input
                type="number"
                value={data.currentTaxBurden || ''}
                onChange={(e) =>
                  update({ currentTaxBurden: parseFloat(e.target.value) || undefined })
                }
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Abzüge</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Säule 3a m (CHF/Jahr)
                <span className="text-gray-400 ml-2">Max: {max3aEmployed.toLocaleString('de-CH')}</span>
              </label>
              <input
                type="number"
                value={data.pillar3aContributionMan || ''}
                onChange={(e) =>
                  update({ pillar3aContributionMan: parseFloat(e.target.value) || undefined })
                }
                disabled={isReadOnly}
                max={max3aSelfEmployed}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Säule 3a w (CHF/Jahr)
                <span className="text-gray-400 ml-2">Max: {max3aEmployed.toLocaleString('de-CH')}</span>
              </label>
              <input
                type="number"
                value={data.pillar3aContributionWoman || ''}
                onChange={(e) =>
                  update({ pillar3aContributionWoman: parseFloat(e.target.value) || undefined })
                }
                disabled={isReadOnly}
                max={max3aSelfEmployed}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PK Einkauf (CHF)
              </label>
              <input
                type="number"
                value={data.pensionFundPurchase || ''}
                onChange={(e) =>
                  update({ pensionFundPurchase: parseFloat(e.target.value) || undefined })
                }
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weitere Abzüge (CHF)
              </label>
              <input
                type="number"
                value={data.otherDeductions || ''}
                onChange={(e) =>
                  update({ otherDeductions: parseFloat(e.target.value) || undefined })
                }
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tax Calculator */}
      {taxCalc.grossIncome > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Steuerrechner (Schätzung)</h3>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Bruttoeinkommen</span>
                <span className="font-medium">
                  {taxCalc.grossIncome.toLocaleString('de-CH')} CHF
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Abzüge total</span>
                <span className="font-medium text-green-600">
                  -{taxCalc.deductions.toLocaleString('de-CH')} CHF
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Steuerbares Einkommen</span>
                <span className="font-medium">
                  {taxCalc.taxableIncomeWithDeductions.toLocaleString('de-CH')} CHF
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Steuern ohne Abzüge</span>
                <span className="font-medium">
                  {taxCalc.taxWithoutDeductions.toLocaleString('de-CH', {
                    maximumFractionDigits: 0,
                  })}{' '}
                  CHF
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-600">Steuern mit Abzügen</span>
                <span className="font-medium">
                  {taxCalc.taxWithDeductions.toLocaleString('de-CH', {
                    maximumFractionDigits: 0,
                  })}{' '}
                  CHF
                </span>
              </div>
              <div className="flex justify-between py-2 bg-green-50 rounded-lg px-3">
                <span className="font-semibold text-green-700">Steuerersparnis</span>
                <span className="font-bold text-green-700">
                  {taxCalc.taxSavings.toLocaleString('de-CH', { maximumFractionDigits: 0 })} CHF
                </span>
              </div>
            </div>

            <div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={comparisonData} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip
                    formatter={(value) =>
                      `${Number(value).toLocaleString('de-CH', { maximumFractionDigits: 0 })} CHF`
                    }
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    <Cell fill="#ef4444" />
                    <Cell fill="#22c55e" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-500 text-center mt-2">
                * Vereinfachte Berechnung (Kanton ZH). Für genaue Werte konsultieren Sie einen
                Steuerberater.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Goals */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ziele Steueroptimierung</h3>
        <textarea
          value={data.taxGoals || ''}
          onChange={(e) => update({ taxGoals: e.target.value })}
          disabled={isReadOnly}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Ziele und Massnahmen zur Steueroptimierung..."
        />
      </div>
    </div>
  );
}
