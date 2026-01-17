import { useState, useEffect, useMemo } from 'react';
import { useClients } from '../context/ClientContext';
import { useAuth } from '../context/AuthContext';
import { housingService } from '../services/data.service';
import { Save, Building2, Home, Calculator } from 'lucide-react';
import type { Housing as HousingType } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#0d9488', '#0f766e', '#115e59'];

export default function Housing() {
  const { currentClient } = useClients();
  const { isAdvisor } = useAuth();
  const isReadOnly = !isAdvisor;
  const [housing, setHousing] = useState<HousingType | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentClient?.id) {
      setLoading(true);
      setError(null);
      housingService.getByClientId(currentClient.id)
        .then(setHousing)
        .catch((err) => {
          console.error('Error loading housing:', err);
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

  if (!housing) {
    return <div className="text-center py-12">Keine Daten gefunden.</div>;
  }

  const handleSave = async () => {
    if (!currentClient?.id) return;
    setSaving(true);
    try {
      await housingService.upsert(currentClient.id, housing);
    } finally {
      setSaving(false);
    }
  };

  const updateHousing = (updates: Partial<HousingType>) => {
    setHousing({ ...housing, ...updates });
  };

  // Mortgage calculator
  const mortgageCalc = useMemo(() => {
    if (!housing.purchasePrice || !housing.interestRate) return null;

    const price = housing.purchasePrice;
    const debt = housing.debt || price * 0.8;
    const rate = housing.interestRate / 100;
    const monthlyInterest = (debt * rate) / 12;
    const yearlyInterest = debt * rate;

    // Amortization (assuming 15 years to reach 65% LTV)
    const targetLTV = 0.65;
    const targetDebt = price * targetLTV;
    const amortizationNeeded = Math.max(0, debt - targetDebt);
    const yearlyAmortization = amortizationNeeded / 15;

    // Total costs
    const utilityCosts = housing.utilityCosts || 0;
    const monthlyTotal = monthlyInterest + yearlyAmortization / 12 + utilityCosts;

    // Affordability (33% rule)
    const requiredIncome = monthlyTotal * 3 * 12;

    return {
      debt,
      ltv: (debt / price) * 100,
      monthlyInterest,
      yearlyInterest,
      yearlyAmortization,
      monthlyTotal,
      requiredIncome,
      utilityCosts,
    };
  }, [housing.purchasePrice, housing.debt, housing.interestRate, housing.utilityCosts]);

  const costBreakdown = mortgageCalc
    ? [
        { name: 'Hypothekarzins', value: mortgageCalc.monthlyInterest },
        { name: 'Amortisation', value: mortgageCalc.yearlyAmortization / 12 },
        { name: 'Nebenkosten', value: mortgageCalc.utilityCosts },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Wohnen</h2>
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rental Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Miete</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={housing.isRenter}
                onChange={(e) => updateHousing({ isRenter: e.target.checked })}
                disabled={isReadOnly}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded"
              />
              <span className="font-medium text-gray-700">Mieter</span>
            </label>

            {housing.isRenter && (
              <div className="space-y-4 pl-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mietkosten (CHF/Mt.)
                    </label>
                    <input
                      type="number"
                      value={housing.monthlyRent || ''}
                      onChange={(e) =>
                        updateHousing({ monthlyRent: parseFloat(e.target.value) || undefined })
                      }
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nebenkosten (CHF/Mt.)
                    </label>
                    <input
                      type="number"
                      value={housing.additionalCosts || ''}
                      onChange={(e) =>
                        updateHousing({ additionalCosts: parseFloat(e.target.value) || undefined })
                      }
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={housing.seekingRentReduction}
                    onChange={(e) => updateHousing({ seekingRentReduction: e.target.checked })}
                    disabled={isReadOnly}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Mietsenkung veranlassen</span>
                </label>

                {housing.monthlyRent && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Totale Wohnkosten:{' '}
                      <span className="font-semibold">
                        {((housing.monthlyRent || 0) + (housing.additionalCosts || 0)).toLocaleString(
                          'de-CH'
                        )}{' '}
                        CHF/Mt.
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ownership Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Eigentümer</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={housing.isOwner}
                onChange={(e) => updateHousing({ isOwner: e.target.checked })}
                disabled={isReadOnly}
                className="w-5 h-5 text-primary-600 border-gray-300 rounded"
              />
              <span className="font-medium text-gray-700">Eigentümer</span>
            </label>

            {housing.isOwner && (
              <div className="space-y-4 pl-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Eigentumsart
                    </label>
                    <select
                      value={housing.propertyType || ''}
                      onChange={(e) => updateHousing({ propertyType: e.target.value })}
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Auswählen...</option>
                      <option value="einfamilienhaus">Einfamilienhaus</option>
                      <option value="eigentumswohnung">Eigentumswohnung</option>
                      <option value="stockwerkeigentum">Stockwerkeigentum</option>
                      <option value="mehrfamilienhaus">Mehrfamilienhaus</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Erworben
                    </label>
                    <input
                      type="text"
                      value={housing.acquiredDate || ''}
                      onChange={(e) => updateHousing({ acquiredDate: e.target.value })}
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="z.B. 2020"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kaufpreis (CHF)
                    </label>
                    <input
                      type="number"
                      value={housing.purchasePrice || ''}
                      onChange={(e) =>
                        updateHousing({ purchasePrice: parseFloat(e.target.value) || undefined })
                      }
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Steuerwert (CHF)
                    </label>
                    <input
                      type="number"
                      value={housing.taxValue || ''}
                      onChange={(e) =>
                        updateHousing({ taxValue: parseFloat(e.target.value) || undefined })
                      }
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Eigenmietwert (CHF/Jahr)
                    </label>
                    <input
                      type="number"
                      value={housing.imputedRentalValue || ''}
                      onChange={(e) =>
                        updateHousing({ imputedRentalValue: parseFloat(e.target.value) || undefined })
                      }
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nebenkosten (CHF/Mt.)
                    </label>
                    <input
                      type="number"
                      value={housing.utilityCosts || ''}
                      onChange={(e) =>
                        updateHousing({ utilityCosts: parseFloat(e.target.value) || undefined })
                      }
                      disabled={isReadOnly}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Renovationen geplant
                  </label>
                  <textarea
                    value={housing.renovationPlans || ''}
                    onChange={(e) => updateHousing({ renovationPlans: e.target.value })}
                    disabled={isReadOnly}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="z.B. Küche 2025, Dach 2027..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mortgage Section */}
      {housing.isOwner && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Hypothek</h3>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={housing.hasMortgage}
                  onChange={(e) => updateHousing({ hasMortgage: e.target.checked })}
                  disabled={isReadOnly}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded"
                />
                <span className="font-medium text-gray-700">Hypothekarvertrag</span>
              </label>

              {housing.hasMortgage && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Schuld (CHF)
                      </label>
                      <input
                        type="number"
                        value={housing.debt || ''}
                        onChange={(e) =>
                          updateHousing({ debt: parseFloat(e.target.value) || undefined })
                        }
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hypo-Institut
                      </label>
                      <input
                        type="text"
                        value={housing.mortgageBank || ''}
                        onChange={(e) => updateHousing({ mortgageBank: e.target.value })}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Art</label>
                      <select
                        value={housing.mortgageType || ''}
                        onChange={(e) => updateHousing({ mortgageType: e.target.value })}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Auswählen...</option>
                        <option value="fix">Festhypothek</option>
                        <option value="saron">SARON</option>
                        <option value="variable">Variable</option>
                        <option value="kombiniert">Kombiniert</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Betrag (CHF)
                      </label>
                      <input
                        type="number"
                        value={housing.mortgageAmount || ''}
                        onChange={(e) =>
                          updateHousing({ mortgageAmount: parseFloat(e.target.value) || undefined })
                        }
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ablauf</label>
                      <input
                        type="text"
                        value={housing.mortgageExpiry || ''}
                        onChange={(e) => updateHousing({ mortgageExpiry: e.target.value })}
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="z.B. 31.12.2028"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zins (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={housing.interestRate || ''}
                        onChange={(e) =>
                          updateHousing({ interestRate: parseFloat(e.target.value) || undefined })
                        }
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amortisation
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={housing.amortizationDirect}
                          onChange={(e) =>
                            updateHousing({ amortizationDirect: e.target.checked })
                          }
                          disabled={isReadOnly}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Direkt</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={housing.amortizationIndirect}
                          onChange={(e) =>
                            updateHousing({ amortizationIndirect: e.target.checked })
                          }
                          disabled={isReadOnly}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Indirekt (3a)</span>
                      </label>
                    </div>
                  </div>

                  {(housing.amortizationDirect || housing.amortizationIndirect) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amortisationshöhe (CHF/Jahr)
                      </label>
                      <input
                        type="number"
                        value={housing.amortizationAmount || ''}
                        onChange={(e) =>
                          updateHousing({
                            amortizationAmount: parseFloat(e.target.value) || undefined,
                          })
                        }
                        disabled={isReadOnly}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Calculator Results */}
            {mortgageCalc && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">Hypothekenrechner</h4>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Belehnung (LTV)</span>
                    <span
                      className={`font-medium ${
                        mortgageCalc.ltv > 80 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {mortgageCalc.ltv.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hypothekarzins/Mt.</span>
                    <span className="font-medium">
                      {mortgageCalc.monthlyInterest.toLocaleString('de-CH', {
                        maximumFractionDigits: 0,
                      })}{' '}
                      CHF
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amortisation/Mt.</span>
                    <span className="font-medium">
                      {(mortgageCalc.yearlyAmortization / 12).toLocaleString('de-CH', {
                        maximumFractionDigits: 0,
                      })}{' '}
                      CHF
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Nebenkosten/Mt.</span>
                    <span className="font-medium">
                      {mortgageCalc.utilityCosts.toLocaleString('de-CH')} CHF
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between">
                    <span className="font-medium text-gray-900">Total/Mt.</span>
                    <span className="font-bold text-primary-600">
                      {mortgageCalc.monthlyTotal.toLocaleString('de-CH', {
                        maximumFractionDigits: 0,
                      })}{' '}
                      CHF
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Benötigtes Einkommen (33%)</span>
                    <span className="font-medium">
                      {mortgageCalc.requiredIncome.toLocaleString('de-CH', {
                        maximumFractionDigits: 0,
                      })}{' '}
                      CHF/Jahr
                    </span>
                  </div>
                </div>

                {costBreakdown.length > 0 && (
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={costBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {costBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) =>
                          `${Number(value).toLocaleString('de-CH', { maximumFractionDigits: 0 })} CHF`
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Future Goal */}
      {!housing.isOwner && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ziel Wohneigentum</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beschreibung
              </label>
              <input
                type="text"
                value={housing.homeOwnershipGoal || ''}
                onChange={(e) => updateHousing({ homeOwnershipGoal: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="z.B. Eigentumswohnung kaufen"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wann</label>
              <input
                type="text"
                value={housing.targetDate || ''}
                onChange={(e) => updateHousing({ targetDate: e.target.value })}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="z.B. 2027"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preis (CHF)
              </label>
              <input
                type="number"
                value={housing.targetPrice || ''}
                onChange={(e) =>
                  updateHousing({ targetPrice: parseFloat(e.target.value) || undefined })
                }
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
