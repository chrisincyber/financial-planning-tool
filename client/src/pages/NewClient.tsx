import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsService } from '../services/clients.service';
import { useClients } from '../context/ClientContext';
import { useAuth } from '../context/AuthContext';
import { Save, ArrowLeft } from 'lucide-react';

export default function NewClient() {
  const navigate = useNavigate();
  const { refreshClients, setCurrentClientId } = useClients();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    partnerFirstName: '',
    partnerLastName: '',
    postalCode: '',
    city: '',
    birthDate: '',
    partnerBirthDate: '',
    phone: '',
    email: '',
    // Planning goals
    avoidDoubleInsurance: false,
    closeCoverageGaps: false,
    saveTaxes: false,
    increaseReturns: false,
    securePartner: false,
    financialSecurity: false,
    wealthBuilding: false,
    retirementPlanning: false,
    savingForChildren: false,
    homeOwnership: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) return;

    setSaving(true);
    try {
      if (!user) throw new Error('Not authenticated');
      const clientId = await clientsService.create(formData, user.id);
      await refreshClients();
      setCurrentClientId(clientId);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating client:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Zurück
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Neuer Klient</h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Persönliche Daten</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vorname *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nachname *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geburtsdatum
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobiltelefon
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Partner Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Partner/in (optional)</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vorname Partner/in
                </label>
                <input
                  type="text"
                  value={formData.partnerFirstName}
                  onChange={(e) => setFormData({ ...formData, partnerFirstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nachname Partner/in
                </label>
                <input
                  type="text"
                  value={formData.partnerLastName}
                  onChange={(e) => setFormData({ ...formData, partnerLastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Geburtsdatum Partner/in
                </label>
                <input
                  type="date"
                  value={formData.partnerBirthDate}
                  onChange={(e) => setFormData({ ...formData, partnerBirthDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PLZ
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ort
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Planning Goals */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Persönliche Planung und Zielsetzung
            </h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Optimierung</h4>
                <div className="space-y-2">
                  {[
                    { key: 'avoidDoubleInsurance', label: 'Doppelversicherungen vermeiden' },
                    { key: 'closeCoverageGaps', label: 'Deckungslücken schliessen' },
                    { key: 'saveTaxes', label: 'Steuern sparen' },
                    { key: 'increaseReturns', label: 'Rendite erhöhen' },
                    { key: 'securePartner', label: 'Lebenspartner absichern' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData[item.key as keyof typeof formData] as boolean}
                        onChange={(e) =>
                          setFormData({ ...formData, [item.key]: e.target.checked })
                        }
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Planung</h4>
                <div className="space-y-2">
                  {[
                    { key: 'financialSecurity', label: 'Finanzielle Sicherheit' },
                    { key: 'wealthBuilding', label: 'Vermögensaufbau' },
                    { key: 'retirementPlanning', label: 'Für Ruhestand vorsorgen' },
                    { key: 'savingForChildren', label: 'Für Kinder (sparen oder absichern)' },
                    { key: 'homeOwnership', label: 'Im Eigenheim wohnen' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData[item.key as keyof typeof formData] as boolean}
                        onChange={(e) =>
                          setFormData({ ...formData, [item.key]: e.target.checked })
                        }
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Speichern...' : 'Klient erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
