import { useState, useEffect } from 'react';
import { useClients } from '../context/ClientContext';
import { db, getOrCreatePropertyInsurance } from '../db';
import { Save, Shield } from 'lucide-react';
import type { PropertyInsurance as PropertyInsuranceType } from '../types';

export default function PropertyInsurance() {
  const { currentClient } = useClients();
  const [data, setData] = useState<PropertyInsuranceType | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentClient?.id) {
      getOrCreatePropertyInsurance(currentClient.id).then(setData);
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
      await db.propertyInsurance.update(data.id, data);
    } finally {
      setSaving(false);
    }
  };

  const update = (updates: Partial<PropertyInsuranceType>) => {
    setData({ ...data, ...updates });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sachversicherung</h2>
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

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 font-medium text-gray-700">Versicherung</th>
                <th className="text-center py-3 px-2 font-medium text-gray-700 w-16">Aktiv</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">m</th>
                <th className="text-left py-3 px-2 font-medium text-gray-700">w</th>
              </tr>
            </thead>
            <tbody>
              {/* PHP - Privathaftpflicht */}
              <tr className="border-b border-gray-100">
                <td className="py-4 px-2">
                  <div>
                    <span className="font-medium text-gray-900">PHP</span>
                    <p className="text-sm text-gray-500">Privathaftpflicht</p>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <input
                    type="checkbox"
                    checked={data.hasPrivateLiability}
                    onChange={(e) => update({ hasPrivateLiability: e.target.checked })}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded"
                  />
                </td>
                <td className="py-4 px-2">
                  <input
                    type="text"
                    value={data.privateLiabilityMan || ''}
                    onChange={(e) => update({ privateLiabilityMan: e.target.value })}
                    disabled={!data.hasPrivateLiability}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                    placeholder="Versicherung / Police"
                  />
                </td>
                <td className="py-4 px-2">
                  <input
                    type="text"
                    value={data.privateLiabilityWoman || ''}
                    onChange={(e) => update({ privateLiabilityWoman: e.target.value })}
                    disabled={!data.hasPrivateLiability}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                    placeholder="Versicherung / Police"
                  />
                </td>
              </tr>

              {/* HR - Hausrat */}
              <tr className="border-b border-gray-100">
                <td className="py-4 px-2">
                  <div>
                    <span className="font-medium text-gray-900">HR</span>
                    <p className="text-sm text-gray-500">Hausrat</p>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <input
                    type="checkbox"
                    checked={data.hasHouseholdContents}
                    onChange={(e) => update({ hasHouseholdContents: e.target.checked })}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded"
                  />
                </td>
                <td className="py-4 px-2">
                  <input
                    type="text"
                    value={data.householdContentsMan || ''}
                    onChange={(e) => update({ householdContentsMan: e.target.value })}
                    disabled={!data.hasHouseholdContents}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                    placeholder="Versicherung / Police"
                  />
                </td>
                <td className="py-4 px-2">
                  <input
                    type="text"
                    value={data.householdContentsWoman || ''}
                    onChange={(e) => update({ householdContentsWoman: e.target.value })}
                    disabled={!data.hasHouseholdContents}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                    placeholder="Versicherung / Police"
                  />
                </td>
              </tr>

              {/* MF - Motorfahrzeug */}
              <tr className="border-b border-gray-100">
                <td className="py-4 px-2">
                  <div>
                    <span className="font-medium text-gray-900">MF</span>
                    <p className="text-sm text-gray-500">Motorfahrzeug</p>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <input
                    type="checkbox"
                    checked={data.hasVehicle}
                    onChange={(e) => update({ hasVehicle: e.target.checked })}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded"
                  />
                </td>
                <td className="py-4 px-2">
                  <input
                    type="text"
                    value={data.vehicleMan || ''}
                    onChange={(e) => update({ vehicleMan: e.target.value })}
                    disabled={!data.hasVehicle}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                    placeholder="Versicherung / Police"
                  />
                </td>
                <td className="py-4 px-2">
                  <input
                    type="text"
                    value={data.vehicleWoman || ''}
                    onChange={(e) => update({ vehicleWoman: e.target.value })}
                    disabled={!data.hasVehicle}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                    placeholder="Versicherung / Police"
                  />
                </td>
              </tr>

              {/* RS - Rechtsschutz */}
              <tr>
                <td className="py-4 px-2">
                  <div>
                    <span className="font-medium text-gray-900">RS</span>
                    <p className="text-sm text-gray-500">Rechtsschutz</p>
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <input
                    type="checkbox"
                    checked={data.hasLegalProtection}
                    onChange={(e) => update({ hasLegalProtection: e.target.checked })}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded"
                  />
                </td>
                <td className="py-4 px-2">
                  <input
                    type="text"
                    value={data.legalProtectionMan || ''}
                    onChange={(e) => update({ legalProtectionMan: e.target.value })}
                    disabled={!data.hasLegalProtection}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                    placeholder="Versicherung / Police"
                  />
                </td>
                <td className="py-4 px-2">
                  <input
                    type="text"
                    value={data.legalProtectionWoman || ''}
                    onChange={(e) => update({ legalProtectionWoman: e.target.value })}
                    disabled={!data.hasLegalProtection}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                    placeholder="Versicherung / Police"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Remarks */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bemerkungen</h3>
        <textarea
          value={data.remarks || ''}
          onChange={(e) => update({ remarks: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Weitere Bemerkungen zu den Sachversicherungen..."
        />
      </div>
    </div>
  );
}
