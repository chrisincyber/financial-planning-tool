import { useState, useEffect, useMemo } from 'react';
import { useClients } from '../context/ClientContext';
import { db, getOrCreatePension } from '../db';
import { Save, PiggyBank, Shield, Sunset } from 'lucide-react';
import type { Pension as PensionType } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const COLORS = ['#0d9488', '#6366f1', '#f59e0b'];

export default function Pension() {
  const { currentClient } = useClients();
  const [data, setData] = useState<PensionType | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentClient?.id) {
      getOrCreatePension(currentClient.id).then(setData);
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
      await db.pension.update(data.id, data);
    } finally {
      setSaving(false);
    }
  };

  const update = (updates: Partial<PensionType>) => {
    setData({ ...data, ...updates });
  };

  // Calculate pension gap
  const pensionAnalysis = useMemo(() => {
    const targetRetirementMan = data.targetRetirementAgeMan || 65;
    const targetRetirementWoman = data.targetRetirementAgeWoman || 64;

    const birthYearMan = currentClient.birthDate
      ? new Date(currentClient.birthDate).getFullYear()
      : 1980;
    const birthYearWoman = currentClient.partnerBirthDate
      ? new Date(currentClient.partnerBirthDate).getFullYear()
      : 1980;

    const currentYear = new Date().getFullYear();
    const ageMan = currentYear - birthYearMan;
    const ageWoman = currentYear - birthYearWoman;

    const yearsToRetirementMan = Math.max(0, targetRetirementMan - ageMan);
    const yearsToRetirementWoman = Math.max(0, targetRetirementWoman - ageWoman);

    // Simplified pension estimation
    const ahvMax = 29400; // Max AHV per year (2024)
    const estimatedAHVMan = (data.pillar1AverageIncomeMan || 0) > 88200 ? ahvMax : ahvMax * 0.7;
    const estimatedAHVWoman =
      (data.pillar1AverageIncomeWoman || 0) > 88200 ? ahvMax : ahvMax * 0.7;

    const pillar2Man = data.pillar2AmountMan || 0;
    const pillar2Woman = data.pillar2AmountWoman || 0;

    // Assume 5% conversion rate for pillar 2
    const pillar2RentMan = pillar2Man * 0.05;
    const pillar2RentWoman = pillar2Woman * 0.05;

    const totalPensionMan = estimatedAHVMan + pillar2RentMan;
    const totalPensionWoman = estimatedAHVWoman + pillar2RentWoman;

    const needMan = data.retirementNeedMan || 0;
    const needWoman = data.retirementNeedWoman || 0;

    const gapMan = needMan - totalPensionMan;
    const gapWoman = needWoman - totalPensionWoman;

    return {
      ageMan,
      ageWoman,
      yearsToRetirementMan,
      yearsToRetirementWoman,
      estimatedAHVMan,
      estimatedAHVWoman,
      pillar2RentMan,
      pillar2RentWoman,
      totalPensionMan,
      totalPensionWoman,
      gapMan,
      gapWoman,
    };
  }, [data, currentClient]);

  const pillarData = [
    {
      name: 'm',
      'Säule 1 (AHV)': pensionAnalysis.estimatedAHVMan,
      'Säule 2 (PK)': pensionAnalysis.pillar2RentMan,
      Bedarf: data.retirementNeedMan || 0,
    },
    {
      name: 'w',
      'Säule 1 (AHV)': pensionAnalysis.estimatedAHVWoman,
      'Säule 2 (PK)': pensionAnalysis.pillar2RentWoman,
      Bedarf: data.retirementNeedWoman || 0,
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <PiggyBank className="w-5 h-5 text-pink-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Vorsorge</h2>
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

      {/* Age Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Alter m</p>
          <p className="text-2xl font-bold text-gray-900">{pensionAnalysis.ageMan} Jahre</p>
          <p className="text-xs text-gray-400">
            Noch {pensionAnalysis.yearsToRetirementMan} Jahre bis Pension
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Alter w</p>
          <p className="text-2xl font-bold text-gray-900">{pensionAnalysis.ageWoman} Jahre</p>
          <p className="text-xs text-gray-400">
            Noch {pensionAnalysis.yearsToRetirementWoman} Jahre bis Pension
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Vorsorgelücke m</p>
          <p
            className={`text-2xl font-bold ${
              pensionAnalysis.gapMan > 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {pensionAnalysis.gapMan > 0 ? '+' : ''}
            {pensionAnalysis.gapMan.toLocaleString('de-CH', { maximumFractionDigits: 0 })} CHF
          </p>
          <p className="text-xs text-gray-400">pro Jahr</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Vorsorgelücke w</p>
          <p
            className={`text-2xl font-bold ${
              pensionAnalysis.gapWoman > 0 ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {pensionAnalysis.gapWoman > 0 ? '+' : ''}
            {pensionAnalysis.gapWoman.toLocaleString('de-CH', { maximumFractionDigits: 0 })} CHF
          </p>
          <p className="text-xs text-gray-400">pro Jahr</p>
        </div>
      </div>

      {/* Disability/Death Insurance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Absicherung IV / Tod</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-700"></th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">m (CHF)</th>
                <th className="text-right py-2 px-3 font-medium text-gray-700">w (CHF)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-700">1. Säule: Ø Einkommen</td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    value={data.pillar1AverageIncomeMan || ''}
                    onChange={(e) =>
                      update({ pillar1AverageIncomeMan: parseFloat(e.target.value) || undefined })
                    }
                    className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                  />
                </td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    value={data.pillar1AverageIncomeWoman || ''}
                    onChange={(e) =>
                      update({
                        pillar1AverageIncomeWoman: parseFloat(e.target.value) || undefined,
                      })
                    }
                    className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                  />
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-700">2. Säule: Guthaben</td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    value={data.pillar2AmountMan || ''}
                    onChange={(e) =>
                      update({ pillar2AmountMan: parseFloat(e.target.value) || undefined })
                    }
                    className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                  />
                </td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    value={data.pillar2AmountWoman || ''}
                    onChange={(e) =>
                      update({ pillar2AmountWoman: parseFloat(e.target.value) || undefined })
                    }
                    className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                  />
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 text-gray-700">Bedarf IV (Invalidität)</td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    value={data.disabilityNeedMan || ''}
                    onChange={(e) =>
                      update({ disabilityNeedMan: parseFloat(e.target.value) || undefined })
                    }
                    className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                  />
                </td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    value={data.disabilityNeedWoman || ''}
                    onChange={(e) =>
                      update({ disabilityNeedWoman: parseFloat(e.target.value) || undefined })
                    }
                    className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-3 text-gray-700">Bedarf Tod</td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    value={data.deathNeedMan || ''}
                    onChange={(e) =>
                      update({ deathNeedMan: parseFloat(e.target.value) || undefined })
                    }
                    className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                  />
                </td>
                <td className="py-3 px-3">
                  <input
                    type="number"
                    value={data.deathNeedWoman || ''}
                    onChange={(e) =>
                      update({ deathNeedWoman: parseFloat(e.target.value) || undefined })
                    }
                    className="w-full px-2 py-1 text-right border border-gray-300 rounded focus:ring-2 focus:ring-primary-500"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Retirement Planning */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Sunset className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Altersvorsorge</h3>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ziel Pensionierung m
                </label>
                <input
                  type="number"
                  value={data.targetRetirementAgeMan || ''}
                  onChange={(e) =>
                    update({ targetRetirementAgeMan: parseInt(e.target.value) || undefined })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="65"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ziel Pensionierung w
                </label>
                <input
                  type="number"
                  value={data.targetRetirementAgeWoman || ''}
                  onChange={(e) =>
                    update({ targetRetirementAgeWoman: parseInt(e.target.value) || undefined })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="64"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedarf m (CHF/Jahr)
                </label>
                <input
                  type="number"
                  value={data.retirementNeedMan || ''}
                  onChange={(e) =>
                    update({ retirementNeedMan: parseFloat(e.target.value) || undefined })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bedarf w (CHF/Jahr)
                </label>
                <input
                  type="number"
                  value={data.retirementNeedWoman || ''}
                  onChange={(e) =>
                    update({ retirementNeedWoman: parseFloat(e.target.value) || undefined })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Pension Chart */}
          <div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pillarData}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) =>
                    `${Number(value).toLocaleString('de-CH', { maximumFractionDigits: 0 })} CHF`
                  }
                />
                <Legend />
                <Bar dataKey="Säule 1 (AHV)" stackId="a" fill={COLORS[0]} />
                <Bar dataKey="Säule 2 (PK)" stackId="a" fill={COLORS[1]} />
                <Bar dataKey="Bedarf" fill={COLORS[2]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 text-center mt-2">
              Vergleich Vorsorge vs. Bedarf (CHF/Jahr)
            </p>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Überprüfung</h3>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.orderIKStatement}
              onChange={(e) => update({ orderIKStatement: e.target.checked })}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded"
            />
            <span className="text-gray-700">IK bestellen</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.reviewPensionFund}
              onChange={(e) => update({ reviewPensionFund: e.target.checked })}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded"
            />
            <span className="text-gray-700">PK überprüfen</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.review3a}
              onChange={(e) => update({ review3a: e.target.checked })}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded"
            />
            <span className="text-gray-700">3a überprüfen</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={data.review3b}
              onChange={(e) => update({ review3b: e.target.checked })}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded"
            />
            <span className="text-gray-700">3b überprüfen</span>
          </label>
        </div>
      </div>
    </div>
  );
}
