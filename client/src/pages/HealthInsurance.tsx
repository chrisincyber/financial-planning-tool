import { useState, useEffect } from 'react';
import { useClients } from '../context/ClientContext';
import { db, getOrCreateHealthInsurance } from '../db';
import { Save, Heart } from 'lucide-react';
import type { HealthInsurance as HealthInsuranceType } from '../types';

export default function HealthInsurance() {
  const { currentClient } = useClients();
  const [data, setData] = useState<HealthInsuranceType | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentClient?.id) {
      getOrCreateHealthInsurance(currentClient.id).then(setData);
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
      await db.healthInsurance.update(data.id, data);
    } finally {
      setSaving(false);
    }
  };

  const update = (updates: Partial<HealthInsuranceType>) => {
    setData({ ...data, ...updates });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Gesundheitsvorsorge</h2>
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

      {/* Insurance Providers */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Versicherungen</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-700">Typ</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">m</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">w</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-4 px-2">
                  <div>
                    <span className="font-medium text-gray-900">KVG</span>
                    <p className="text-sm text-gray-500">Grundversicherung</p>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <input
                    type="text"
                    value={data.kvgProviderMan || ''}
                    onChange={(e) => update({ kvgProviderMan: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Versicherung"
                  />
                </td>
                <td className="py-4 px-2">
                  <input
                    type="text"
                    value={data.kvgProviderWoman || ''}
                    onChange={(e) => update({ kvgProviderWoman: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Versicherung"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-4 px-2">
                  <div>
                    <span className="font-medium text-gray-900">VVG</span>
                    <p className="text-sm text-gray-500">Zusatzversicherung</p>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <input
                    type="text"
                    value={data.vvgProviderMan || ''}
                    onChange={(e) => update({ vvgProviderMan: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Versicherung"
                  />
                </td>
                <td className="py-4 px-2">
                  <input
                    type="text"
                    value={data.vvgProviderWoman || ''}
                    onChange={(e) => update({ vvgProviderWoman: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Versicherung"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Franchise & Costs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Franchise & Kosten</h3>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Franchise m (CHF)</label>
            <input
              type="number"
              value={data.franchiseMan || ''}
              onChange={(e) => update({ franchiseMan: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Franchise w (CHF)</label>
            <input
              type="number"
              value={data.franchiseWoman || ''}
              onChange={(e) => update({ franchiseWoman: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kosten/Jahr m (CHF)
            </label>
            <input
              type="number"
              value={data.yearlyPremiumMan || ''}
              onChange={(e) => update({ yearlyPremiumMan: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kosten/Jahr w (CHF)
            </label>
            <input
              type="number"
              value={data.yearlyPremiumWoman || ''}
              onChange={(e) =>
                update({ yearlyPremiumWoman: parseFloat(e.target.value) || undefined })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IPV m (CHF)</label>
            <input
              type="number"
              value={data.ipvMan || ''}
              onChange={(e) => update({ ipvMan: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Prämienverbilligung"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IPV w (CHF)</label>
            <input
              type="number"
              value={data.ipvWoman || ''}
              onChange={(e) => update({ ipvWoman: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Prämienverbilligung"
            />
          </div>
        </div>
      </div>

      {/* Health Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Gesundheitsdaten</h3>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grösse m (cm)</label>
            <input
              type="number"
              value={data.heightMan || ''}
              onChange={(e) => update({ heightMan: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grösse w (cm)</label>
            <input
              type="number"
              value={data.heightWoman || ''}
              onChange={(e) => update({ heightWoman: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gewicht m (kg)</label>
            <input
              type="number"
              value={data.weightMan || ''}
              onChange={(e) => update({ weightMan: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gewicht w (kg)</label>
            <input
              type="number"
              value={data.weightWoman || ''}
              onChange={(e) => update({ weightWoman: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hausarzt m</label>
            <input
              type="text"
              value={data.familyDoctorMan || ''}
              onChange={(e) => update({ familyDoctorMan: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hausarzt w</label>
            <input
              type="text"
              value={data.familyDoctorWoman || ''}
              onChange={(e) => update({ familyDoctorWoman: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Raucher</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.isSmokerMan}
                  onChange={(e) => update({ isSmokerMan: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">m</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.isSmokerWoman}
                  onChange={(e) => update({ isSmokerWoman: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">w</span>
              </label>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Gesund</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.isHealthyMan}
                  onChange={(e) => update({ isHealthyMan: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">m</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={data.isHealthyWoman}
                  onChange={(e) => update({ isHealthyWoman: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">w</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Last 5 Years */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Letzte 5 Jahre</h3>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.hadAlternativePhysio}
              onChange={(e) => update({ hadAlternativePhysio: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Alternativ/Physio</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.hadAccident}
              onChange={(e) => update({ hadAccident: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Unfall</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.hadIllness}
              onChange={(e) => update({ hadIllness: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Krankheit</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={data.hadPsychologist}
              onChange={(e) => update({ hadPsychologist: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Psychologe</span>
          </label>
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ziele Schutz</h3>
        <textarea
          value={data.protectionGoals || ''}
          onChange={(e) => update({ protectionGoals: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Ziele im Bereich Gesundheitsschutz..."
        />
      </div>
    </div>
  );
}
