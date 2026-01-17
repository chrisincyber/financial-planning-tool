import { useState, useEffect } from 'react';
import { useClients } from '../context/ClientContext';
import { db, getOrCreateLegalSecurity } from '../db';
import { Save, Scale, FileText, Users, Heart, Briefcase } from 'lucide-react';
import type { LegalSecurity as LegalSecurityType } from '../types';

const legalDocuments = [
  {
    key: 'hasAdvanceDirective',
    title: 'Vorsorgeauftrag',
    description: 'Bestimmt, wer bei Urteilsunfähigkeit Entscheidungen trifft',
    icon: FileText,
  },
  {
    key: 'hasPatientDecree',
    title: 'Patientenverfügung',
    description: 'Medizinische Wünsche für den Notfall',
    icon: Heart,
  },
  {
    key: 'hasCohabitationAgreement',
    title: 'Konkubinatsvertrag',
    description: 'Regelung für unverheiratete Paare',
    icon: Users,
  },
  {
    key: 'hasWill',
    title: 'Testament',
    description: 'Letztwillige Verfügung',
    icon: FileText,
  },
  {
    key: 'hasBeneficiaryOrder',
    title: 'Begünstigung regeln',
    description: 'Begünstigung im Todesfall festlegen',
    icon: Users,
  },
  {
    key: 'hasPensionBeneficiary',
    title: 'PK Begünstigung',
    description: 'Pensionskasse Begünstigungsordnung',
    icon: Briefcase,
  },
  {
    key: 'has3aBeneficiary',
    title: '3a/3b Begünstigung',
    description: 'Säule 3a/3b Begünstigungsordnung',
    icon: Briefcase,
  },
];

export default function LegalSecurity() {
  const { currentClient } = useClients();
  const [data, setData] = useState<LegalSecurityType | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentClient?.id) {
      getOrCreateLegalSecurity(currentClient.id).then(setData);
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
      await db.legalSecurity.update(data.id, data);
    } finally {
      setSaving(false);
    }
  };

  const update = (updates: Partial<LegalSecurityType>) => {
    setData({ ...data, ...updates });
  };

  const completedCount = legalDocuments.filter(
    (doc) => data[doc.key as keyof LegalSecurityType]
  ).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Scale className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Rechtssicherheit</h2>
            <p className="text-sm text-gray-500">
              {completedCount} von {legalDocuments.length} Dokumenten vorhanden
            </p>
          </div>
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

      {/* Progress Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Fortschritt</span>
          <span className="text-sm text-gray-500">
            {Math.round((completedCount / legalDocuments.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all"
            style={{ width: `${(completedCount / legalDocuments.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {legalDocuments.map((doc) => {
          const isCompleted = data[doc.key as keyof LegalSecurityType] as boolean;
          const Icon = doc.icon;

          return (
            <button
              key={doc.key}
              onClick={() => update({ [doc.key]: !isCompleted })}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                isCompleted
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    isCompleted ? 'bg-primary-100' : 'bg-gray-100'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isCompleted ? 'text-primary-600' : 'text-gray-500'}`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-medium ${
                        isCompleted ? 'text-primary-700' : 'text-gray-900'
                      }`}
                    >
                      {doc.title}
                    </h3>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isCompleted
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isCompleted && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Service Package */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={data.wantsServicePackage}
            onChange={(e) => update({ wantsServicePackage: e.target.checked })}
            className="w-5 h-5 text-primary-600 border-gray-300 rounded"
          />
          <div>
            <span className="font-medium text-gray-900">Servicepaket erwünscht</span>
            <p className="text-sm text-gray-500">
              Unterstützung bei der Erstellung rechtlicher Dokumente
            </p>
          </div>
        </label>
      </div>

      {/* Goals */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ziele Rechtssicherheit</h3>
        <textarea
          value={data.legalGoals || ''}
          onChange={(e) => update({ legalGoals: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          placeholder="Ziele und Notizen zur rechtlichen Absicherung..."
        />
      </div>
    </div>
  );
}
