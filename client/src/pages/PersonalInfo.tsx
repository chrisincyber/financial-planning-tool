import { useState, useEffect } from 'react';
import { useClients } from '../context/ClientContext';
import { useAuth } from '../context/AuthContext';
import { clientsService } from '../services/clients.service';
import { invitationsService } from '../services/data.service';
import { Save, User, Users, Mail, Copy, Check, Trash2 } from 'lucide-react';
import type { Client } from '../types';

interface Invitation {
  id: string;
  email: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export default function PersonalInfo() {
  const { currentClient, refreshClients } = useClients();
  const { isAdvisor } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isReadOnly = !isAdvisor;

  useEffect(() => {
    if (currentClient) {
      setFormData({ ...currentClient });
      if (isAdvisor && currentClient.id) {
        invitationsService.getByClientId(currentClient.id).then(setInvitations);
      }
    }
  }, [currentClient, isAdvisor]);

  const handleInvite = async () => {
    if (!currentClient?.id || !inviteEmail) return;
    setInviting(true);
    try {
      const url = await invitationsService.create(currentClient.id, inviteEmail);
      setInviteUrl(url);
      setInviteEmail('');
      const updated = await invitationsService.getByClientId(currentClient.id);
      setInvitations(updated);
    } catch (error) {
      console.error('Error creating invitation:', error);
    } finally {
      setInviting(false);
    }
  };

  const handleCopyUrl = async () => {
    if (inviteUrl) {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteInvitation = async (id: string) => {
    if (!currentClient?.id) return;
    await invitationsService.delete(id);
    const updated = await invitationsService.getByClientId(currentClient.id);
    setInvitations(updated);
  };

  if (!currentClient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bitte wählen Sie zuerst einen Klienten aus.</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!currentClient.id || isReadOnly) return;
    setSaving(true);
    try {
      await clientsService.update(currentClient.id, formData);
      await refreshClients();
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Persönliche Daten</h2>
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

      {/* Main Person */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Hauptperson (m)</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.firstName || ''}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.lastName || ''}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Geburtsdatum</label>
            <input
              type="date"
              disabled={isReadOnly}
              value={formData.birthDate || ''}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobiltelefon</label>
            <input
              type="tel"
              disabled={isReadOnly}
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
            <input
              type="email"
              disabled={isReadOnly}
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Partner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-pink-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Partner/in (w)</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.partnerFirstName || ''}
              onChange={(e) => setFormData({ ...formData, partnerFirstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.partnerLastName || ''}
              onChange={(e) => setFormData({ ...formData, partnerLastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Geburtsdatum</label>
            <input
              type="date"
              disabled={isReadOnly}
              value={formData.partnerBirthDate || ''}
              onChange={(e) => setFormData({ ...formData, partnerBirthDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Adresse</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PLZ</label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.postalCode || ''}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
            <input
              type="text"
              disabled={isReadOnly}
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Planning Goals */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Persönliche Planung und Zielsetzung
        </h3>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h4 className="font-medium text-primary-700 mb-4">Optimierung</h4>
            <div className="space-y-3">
              {[
                { key: 'avoidDoubleInsurance', label: 'Doppelversicherungen vermeiden' },
                { key: 'closeCoverageGaps', label: 'Deckungslücken schliessen' },
                { key: 'saveTaxes', label: 'Steuern sparen' },
                { key: 'increaseReturns', label: 'Rendite erhöhen' },
                { key: 'securePartner', label: 'Lebenspartner absichern' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    disabled={isReadOnly}
                    checked={(formData[item.key as keyof Client] as boolean) || false}
                    onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                  />
                  <span className="text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-primary-700 mb-4">Planung</h4>
            <div className="space-y-3">
              {[
                { key: 'financialSecurity', label: 'Finanzielle Sicherheit' },
                { key: 'wealthBuilding', label: 'Vermögensaufbau' },
                { key: 'retirementPlanning', label: 'Für Ruhestand vorsorgen' },
                { key: 'savingForChildren', label: 'Für Kinder (sparen oder absichern)' },
                { key: 'homeOwnership', label: 'Im Eigenheim wohnen' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    disabled={isReadOnly}
                    checked={(formData[item.key as keyof Client] as boolean) || false}
                    onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                  />
                  <span className="text-gray-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notizen</h3>
        <textarea
          disabled={isReadOnly}
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
          placeholder="Allgemeine Notizen zum Klienten..."
        />
      </div>

      {/* Client Portal Invitation - Advisor Only */}
      {isAdvisor && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Kundenportal</h3>
              <p className="text-sm text-gray-500">Laden Sie den Klienten ein, seinen Finanzplan einzusehen</p>
            </div>
          </div>

          {/* Invite Form */}
          <div className="flex gap-3 mb-6">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="E-Mail-Adresse des Klienten"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              {inviting ? 'Senden...' : 'Einladen'}
            </button>
          </div>

          {/* Generated URL */}
          {inviteUrl && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-800 mb-2">Einladungslink erstellt:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteUrl}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-white border border-green-300 rounded-lg"
                />
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Kopiert!' : 'Kopieren'}
                </button>
              </div>
              <p className="text-xs text-green-700 mt-2">
                Teilen Sie diesen Link mit dem Klienten. Der Link ist 7 Tage gültig.
              </p>
            </div>
          )}

          {/* Existing Invitations */}
          {invitations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Bestehende Einladungen</h4>
              <div className="space-y-2">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      inv.accepted_at
                        ? 'bg-green-50 border-green-200'
                        : new Date(inv.expires_at) < new Date()
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{inv.email}</p>
                      <p className="text-xs text-gray-500">
                        {inv.accepted_at
                          ? `Akzeptiert am ${new Date(inv.accepted_at).toLocaleDateString('de-CH')}`
                          : new Date(inv.expires_at) < new Date()
                          ? 'Abgelaufen'
                          : `Gültig bis ${new Date(inv.expires_at).toLocaleDateString('de-CH')}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {inv.accepted_at ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Aktiv
                        </span>
                      ) : (
                        <button
                          onClick={() => handleDeleteInvitation(inv.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Einladung löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
