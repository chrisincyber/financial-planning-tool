import { useState, useEffect } from 'react';
import { useClients } from '../context/ClientContext';
import { useAuth } from '../context/AuthContext';
import {
  bankAccountsService,
  securitiesService,
  realEstateService,
  otherAssetsService,
  liabilitiesService,
  calculateNetWorth,
} from '../services/assets.service';
import {
  Landmark,
  TrendingUp,
  Home,
  Car,
  CreditCard,
  Plus,
  Trash2,
  PieChart as PieChartIcon,
  Wallet,
} from 'lucide-react';
import type { BankAccount, SecurityHolding, RealEstate, OtherAsset, Liability } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0d9488', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#22c55e', '#ec4899'];

type TabType = 'overview' | 'bank' | 'securities' | 'realEstate' | 'other' | 'liabilities';

export default function Assets() {
  const { currentClient } = useClients();
  const { isAdvisor } = useAuth();
  const isReadOnly = !isAdvisor;

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);

  // Data states
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [securities, setSecurities] = useState<SecurityHolding[]>([]);
  const [realEstate, setRealEstate] = useState<RealEstate[]>([]);
  const [otherAssets, setOtherAssets] = useState<OtherAsset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [netWorth, setNetWorth] = useState<Awaited<ReturnType<typeof calculateNetWorth>> | null>(null);

  // Form states
  const [showBankForm, setShowBankForm] = useState(false);
  const [showSecurityForm, setShowSecurityForm] = useState(false);
  const [showRealEstateForm, setShowRealEstateForm] = useState(false);
  const [showOtherForm, setShowOtherForm] = useState(false);
  const [showLiabilityForm, setShowLiabilityForm] = useState(false);

  useEffect(() => {
    if (currentClient?.id) {
      loadData();
    }
  }, [currentClient]);

  const loadData = async () => {
    if (!currentClient?.id) return;
    setLoading(true);
    try {
      const [bank, sec, re, other, liab, nw] = await Promise.all([
        bankAccountsService.getByClientId(currentClient.id),
        securitiesService.getByClientId(currentClient.id),
        realEstateService.getByClientId(currentClient.id),
        otherAssetsService.getByClientId(currentClient.id),
        liabilitiesService.getByClientId(currentClient.id),
        calculateNetWorth(currentClient.id),
      ]);
      setBankAccounts(bank);
      setSecurities(sec);
      setRealEstate(re);
      setOtherAssets(other);
      setLiabilities(liab);
      setNetWorth(nw);
    } finally {
      setLoading(false);
    }
  };

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

  const tabs: { id: TabType; label: string; icon: typeof Landmark }[] = [
    { id: 'overview', label: 'Übersicht', icon: PieChartIcon },
    { id: 'bank', label: 'Konten', icon: Landmark },
    { id: 'securities', label: 'Wertschriften', icon: TrendingUp },
    { id: 'realEstate', label: 'Immobilien', icon: Home },
    { id: 'other', label: 'Sonstiges', icon: Car },
    { id: 'liabilities', label: 'Schulden', icon: CreditCard },
  ];

  const pieData = netWorth
    ? [
        { name: 'Konten', value: netWorth.breakdown.bankAccounts },
        { name: 'Wertschriften', value: netWorth.breakdown.securities },
        { name: 'Immobilien', value: netWorth.breakdown.realEstate },
        { name: 'Sonstiges', value: netWorth.breakdown.otherAssets },
        { name: '2. Säule', value: netWorth.breakdown.pillar2 },
        { name: '3. Säule', value: netWorth.breakdown.pillar3 },
        { name: 'Lebensvers.', value: netWorth.breakdown.lifeInsurance },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
          <Wallet className="w-5 h-5 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Vermögensübersicht</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && netWorth && (
        <div className="space-y-6">
          {/* Net Worth Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Gesamtvermögen</p>
              <p className="text-3xl font-bold text-green-600">
                {netWorth.totalAssets.toLocaleString('de-CH')} CHF
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Schulden</p>
              <p className="text-3xl font-bold text-red-600">
                {netWorth.totalLiabilities.toLocaleString('de-CH')} CHF
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-500 mb-1">Nettovermögen</p>
              <p className={`text-3xl font-bold ${netWorth.netWorth >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
                {netWorth.netWorth.toLocaleString('de-CH')} CHF
              </p>
            </div>
          </div>

          {/* Chart and Breakdown */}
          <div className="grid gap-6 lg:grid-cols-2">
            {pieData.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vermögensaufteilung</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString('de-CH')} CHF`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
              <div className="space-y-3">
                {[
                  { label: 'Bankkonten', value: netWorth.breakdown.bankAccounts, color: 'bg-teal-500' },
                  { label: 'Wertschriften', value: netWorth.breakdown.securities, color: 'bg-sky-500' },
                  { label: 'Immobilien', value: netWorth.breakdown.realEstate, color: 'bg-violet-500' },
                  { label: 'Sonstige Vermögenswerte', value: netWorth.breakdown.otherAssets, color: 'bg-amber-500' },
                  { label: 'Pensionskasse (2. Säule)', value: netWorth.breakdown.pillar2, color: 'bg-red-500' },
                  { label: 'Säule 3a/3b', value: netWorth.breakdown.pillar3, color: 'bg-green-500' },
                  { label: 'Lebensversicherungen', value: netWorth.breakdown.lifeInsurance, color: 'bg-pink-500' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                    <span className="font-medium">{item.value.toLocaleString('de-CH')} CHF</span>
                  </div>
                ))}
                <div className="border-t pt-3 mt-3 flex items-center justify-between">
                  <span className="font-medium text-gray-900">Schulden</span>
                  <span className="font-medium text-red-600">
                    -{netWorth.totalLiabilities.toLocaleString('de-CH')} CHF
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Accounts Tab */}
      {activeTab === 'bank' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Bankkonten</h3>
            {!isReadOnly && (
              <button
                onClick={() => setShowBankForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" /> Konto hinzufügen
              </button>
            )}
          </div>

          {showBankForm && !isReadOnly && (
            <BankAccountForm
              clientId={currentClient.id!}
              onSave={() => {
                setShowBankForm(false);
                loadData();
              }}
              onCancel={() => setShowBankForm(false)}
            />
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Bank</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Typ</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Inhaber</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Saldo</th>
                  {!isReadOnly && <th className="w-10"></th>}
                </tr>
              </thead>
              <tbody>
                {bankAccounts.map((account) => (
                  <tr key={account.id} className="border-t border-gray-100">
                    <td className="py-3 px-4">{account.bankName}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {account.accountType === 'checking' && 'Privatkonto'}
                      {account.accountType === 'savings' && 'Sparkonto'}
                      {account.accountType === 'salary' && 'Lohnkonto'}
                      {account.accountType === 'other' && 'Sonstige'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {account.owner === 'man' && 'm'}
                      {account.owner === 'woman' && 'w'}
                      {account.owner === 'joint' && 'gemeinsam'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {account.balance.toLocaleString('de-CH')} CHF
                    </td>
                    {!isReadOnly && (
                      <td className="py-3 px-4">
                        <button
                          onClick={async () => {
                            await bankAccountsService.delete(account.id!);
                            loadData();
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {bankAccounts.length === 0 && (
                  <tr>
                    <td colSpan={isReadOnly ? 4 : 5} className="py-8 text-center text-gray-500">
                      Keine Bankkonten erfasst
                    </td>
                  </tr>
                )}
              </tbody>
              {bankAccounts.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 font-medium">Total</td>
                    <td className="py-3 px-4 text-right font-bold text-primary-600">
                      {bankAccounts.reduce((sum, a) => sum + a.balance, 0).toLocaleString('de-CH')} CHF
                    </td>
                    {!isReadOnly && <td></td>}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* Securities Tab */}
      {activeTab === 'securities' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Wertschriften</h3>
            {!isReadOnly && (
              <button
                onClick={() => setShowSecurityForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" /> Position hinzufügen
              </button>
            )}
          </div>

          {showSecurityForm && !isReadOnly && (
            <SecurityForm
              clientId={currentClient.id!}
              onSave={() => {
                setShowSecurityForm(false);
                loadData();
              }}
              onCancel={() => setShowSecurityForm(false)}
            />
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Beschreibung</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Typ</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Depotbank</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Wert</th>
                  {!isReadOnly && <th className="w-10"></th>}
                </tr>
              </thead>
              <tbody>
                {securities.map((sec) => (
                  <tr key={sec.id} className="border-t border-gray-100">
                    <td className="py-3 px-4">{sec.description}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {sec.investmentType === 'stocks' && 'Aktien'}
                      {sec.investmentType === 'bonds' && 'Obligationen'}
                      {sec.investmentType === 'funds' && 'Fonds'}
                      {sec.investmentType === 'etf' && 'ETF'}
                      {sec.investmentType === 'structured' && 'Strukturiert'}
                      {sec.investmentType === 'crypto' && 'Krypto'}
                      {sec.investmentType === 'other' && 'Sonstige'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{sec.custodianBank}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {sec.currentValue.toLocaleString('de-CH')} {sec.currency}
                    </td>
                    {!isReadOnly && (
                      <td className="py-3 px-4">
                        <button
                          onClick={async () => {
                            await securitiesService.delete(sec.id!);
                            loadData();
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {securities.length === 0 && (
                  <tr>
                    <td colSpan={isReadOnly ? 4 : 5} className="py-8 text-center text-gray-500">
                      Keine Wertschriften erfasst
                    </td>
                  </tr>
                )}
              </tbody>
              {securities.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 font-medium">Total</td>
                    <td className="py-3 px-4 text-right font-bold text-primary-600">
                      {securities.reduce((sum, s) => sum + s.currentValue, 0).toLocaleString('de-CH')} CHF
                    </td>
                    {!isReadOnly && <td></td>}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* Real Estate Tab */}
      {activeTab === 'realEstate' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Immobilien</h3>
            {!isReadOnly && (
              <button
                onClick={() => setShowRealEstateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" /> Immobilie hinzufügen
              </button>
            )}
          </div>

          {showRealEstateForm && !isReadOnly && (
            <RealEstateForm
              clientId={currentClient.id!}
              onSave={() => {
                setShowRealEstateForm(false);
                loadData();
              }}
              onCancel={() => setShowRealEstateForm(false)}
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {realEstate.map((property) => (
              <div key={property.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{property.address}</h4>
                    <p className="text-sm text-gray-500">
                      {property.propertyType === 'house' && 'Einfamilienhaus'}
                      {property.propertyType === 'apartment' && 'Eigentumswohnung'}
                      {property.propertyType === 'land' && 'Grundstück'}
                      {property.propertyType === 'commercial' && 'Gewerbe'}
                      {property.propertyType === 'vacation' && 'Ferienimmobilie'}
                      {property.propertyType === 'other' && 'Sonstige'}
                      {property.isOwnResidence && ' • Eigennutzung'}
                    </p>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={async () => {
                        await realEstateService.delete(property.id!);
                        loadData();
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Marktwert</p>
                    <p className="font-medium">{property.currentValue.toLocaleString('de-CH')} CHF</p>
                  </div>
                  {property.taxValue && (
                    <div>
                      <p className="text-gray-500">Steuerwert</p>
                      <p className="font-medium">{property.taxValue.toLocaleString('de-CH')} CHF</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {realEstate.length === 0 && (
              <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                Keine Immobilien erfasst
              </div>
            )}
          </div>
        </div>
      )}

      {/* Other Assets Tab */}
      {activeTab === 'other' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Sonstige Vermögenswerte</h3>
            {!isReadOnly && (
              <button
                onClick={() => setShowOtherForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" /> Hinzufügen
              </button>
            )}
          </div>

          {showOtherForm && !isReadOnly && (
            <OtherAssetForm
              clientId={currentClient.id!}
              onSave={() => {
                setShowOtherForm(false);
                loadData();
              }}
              onCancel={() => setShowOtherForm(false)}
            />
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Beschreibung</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Typ</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Wert</th>
                  {!isReadOnly && <th className="w-10"></th>}
                </tr>
              </thead>
              <tbody>
                {otherAssets.map((asset) => (
                  <tr key={asset.id} className="border-t border-gray-100">
                    <td className="py-3 px-4">{asset.description}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {asset.assetType === 'vehicle' && 'Fahrzeug'}
                      {asset.assetType === 'art' && 'Kunst'}
                      {asset.assetType === 'jewelry' && 'Schmuck'}
                      {asset.assetType === 'collectibles' && 'Sammlerstücke'}
                      {asset.assetType === 'business' && 'Beteiligung'}
                      {asset.assetType === 'loan_receivable' && 'Darlehen'}
                      {asset.assetType === 'other' && 'Sonstige'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium">
                      {asset.currentValue.toLocaleString('de-CH')} CHF
                    </td>
                    {!isReadOnly && (
                      <td className="py-3 px-4">
                        <button
                          onClick={async () => {
                            await otherAssetsService.delete(asset.id!);
                            loadData();
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {otherAssets.length === 0 && (
                  <tr>
                    <td colSpan={isReadOnly ? 3 : 4} className="py-8 text-center text-gray-500">
                      Keine sonstigen Vermögenswerte erfasst
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Liabilities Tab */}
      {activeTab === 'liabilities' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Schulden & Verbindlichkeiten</h3>
            {!isReadOnly && (
              <button
                onClick={() => setShowLiabilityForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" /> Hinzufügen
              </button>
            )}
          </div>

          {showLiabilityForm && !isReadOnly && (
            <LiabilityForm
              clientId={currentClient.id!}
              onSave={() => {
                setShowLiabilityForm(false);
                loadData();
              }}
              onCancel={() => setShowLiabilityForm(false)}
            />
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Gläubiger</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Typ</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Zins</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Restschuld</th>
                  {!isReadOnly && <th className="w-10"></th>}
                </tr>
              </thead>
              <tbody>
                {liabilities.map((liability) => (
                  <tr key={liability.id} className="border-t border-gray-100">
                    <td className="py-3 px-4">{liability.creditor}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {liability.liabilityType === 'mortgage' && 'Hypothek'}
                      {liability.liabilityType === 'personal_loan' && 'Privatkredit'}
                      {liability.liabilityType === 'car_loan' && 'Autokredit'}
                      {liability.liabilityType === 'credit_card' && 'Kreditkarte'}
                      {liability.liabilityType === 'student_loan' && 'Studienkredit'}
                      {liability.liabilityType === 'business_loan' && 'Geschäftskredit'}
                      {liability.liabilityType === 'other' && 'Sonstige'}
                    </td>
                    <td className="py-3 px-4 text-right text-sm">{liability.interestRate}%</td>
                    <td className="py-3 px-4 text-right font-medium text-red-600">
                      {liability.currentBalance.toLocaleString('de-CH')} CHF
                    </td>
                    {!isReadOnly && (
                      <td className="py-3 px-4">
                        <button
                          onClick={async () => {
                            await liabilitiesService.delete(liability.id!);
                            loadData();
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {liabilities.length === 0 && (
                  <tr>
                    <td colSpan={isReadOnly ? 4 : 5} className="py-8 text-center text-gray-500">
                      Keine Schulden erfasst
                    </td>
                  </tr>
                )}
              </tbody>
              {liabilities.length > 0 && (
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="py-3 px-4 font-medium">Total Schulden</td>
                    <td className="py-3 px-4 text-right font-bold text-red-600">
                      {liabilities.reduce((sum, l) => sum + l.currentBalance, 0).toLocaleString('de-CH')} CHF
                    </td>
                    {!isReadOnly && <td></td>}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Form Components
function BankAccountForm({ clientId, onSave, onCancel }: { clientId: string; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    bankName: '',
    accountType: 'checking' as BankAccount['accountType'],
    owner: 'man' as BankAccount['owner'],
    balance: '',
    iban: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await bankAccountsService.create({
        clientId,
        bankName: form.bankName,
        accountType: form.accountType,
        owner: form.owner,
        balance: parseFloat(form.balance) || 0,
        iban: form.iban || undefined,
      });
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
          <input
            type="text"
            required
            value={form.bankName}
            onChange={(e) => setForm({ ...form, bankName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="z.B. UBS, CS, ZKB..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kontotyp</label>
          <select
            value={form.accountType}
            onChange={(e) => setForm({ ...form, accountType: e.target.value as BankAccount['accountType'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="checking">Privatkonto</option>
            <option value="savings">Sparkonto</option>
            <option value="salary">Lohnkonto</option>
            <option value="other">Sonstige</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Inhaber</label>
          <select
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value as BankAccount['owner'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="man">m</option>
            <option value="woman">w</option>
            <option value="joint">gemeinsam</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Saldo (CHF)</label>
          <input
            type="number"
            required
            value={form.balance}
            onChange={(e) => setForm({ ...form, balance: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:text-gray-800">
          Abbrechen
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          {saving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </form>
  );
}

function SecurityForm({ clientId, onSave, onCancel }: { clientId: string; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    description: '',
    investmentType: 'funds' as SecurityHolding['investmentType'],
    custodianBank: '',
    owner: 'man' as SecurityHolding['owner'],
    currentValue: '',
    currency: 'CHF',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await securitiesService.create({
        clientId,
        description: form.description,
        investmentType: form.investmentType,
        custodianBank: form.custodianBank,
        owner: form.owner,
        currentValue: parseFloat(form.currentValue) || 0,
        currency: form.currency,
      });
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
          <input
            type="text"
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
          <select
            value={form.investmentType}
            onChange={(e) => setForm({ ...form, investmentType: e.target.value as SecurityHolding['investmentType'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="stocks">Aktien</option>
            <option value="bonds">Obligationen</option>
            <option value="funds">Fonds</option>
            <option value="etf">ETF</option>
            <option value="structured">Strukturierte Produkte</option>
            <option value="crypto">Kryptowährungen</option>
            <option value="other">Sonstige</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Depotbank</label>
          <input
            type="text"
            required
            value={form.custodianBank}
            onChange={(e) => setForm({ ...form, custodianBank: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wert</label>
          <input
            type="number"
            required
            value={form.currentValue}
            onChange={(e) => setForm({ ...form, currentValue: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Währung</label>
          <select
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="CHF">CHF</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:text-gray-800">
          Abbrechen
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          {saving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </form>
  );
}

function RealEstateForm({ clientId, onSave, onCancel }: { clientId: string; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    address: '',
    propertyType: 'apartment' as RealEstate['propertyType'],
    owner: 'joint' as RealEstate['owner'],
    currentValue: '',
    isOwnResidence: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await realEstateService.create({
        clientId,
        address: form.address,
        propertyType: form.propertyType,
        owner: form.owner,
        currentValue: parseFloat(form.currentValue) || 0,
        isOwnResidence: form.isOwnResidence,
      });
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
          <input
            type="text"
            required
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
          <select
            value={form.propertyType}
            onChange={(e) => setForm({ ...form, propertyType: e.target.value as RealEstate['propertyType'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="house">Einfamilienhaus</option>
            <option value="apartment">Eigentumswohnung</option>
            <option value="land">Grundstück</option>
            <option value="commercial">Gewerbeimmobilie</option>
            <option value="vacation">Ferienimmobilie</option>
            <option value="other">Sonstige</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marktwert (CHF)</label>
          <input
            type="number"
            required
            value={form.currentValue}
            onChange={(e) => setForm({ ...form, currentValue: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={form.isOwnResidence}
              onChange={(e) => setForm({ ...form, isOwnResidence: e.target.checked })}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm">Eigennutzung</span>
          </label>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:text-gray-800">
          Abbrechen
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          {saving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </form>
  );
}

function OtherAssetForm({ clientId, onSave, onCancel }: { clientId: string; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    description: '',
    assetType: 'vehicle' as OtherAsset['assetType'],
    owner: 'man' as OtherAsset['owner'],
    currentValue: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await otherAssetsService.create({
        clientId,
        description: form.description,
        assetType: form.assetType,
        owner: form.owner,
        currentValue: parseFloat(form.currentValue) || 0,
      });
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
          <input
            type="text"
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
          <select
            value={form.assetType}
            onChange={(e) => setForm({ ...form, assetType: e.target.value as OtherAsset['assetType'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="vehicle">Fahrzeug</option>
            <option value="art">Kunst</option>
            <option value="jewelry">Schmuck</option>
            <option value="collectibles">Sammlerstücke</option>
            <option value="business">Unternehmensbeteiligung</option>
            <option value="loan_receivable">Darlehen (Forderung)</option>
            <option value="other">Sonstige</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Inhaber</label>
          <select
            value={form.owner}
            onChange={(e) => setForm({ ...form, owner: e.target.value as OtherAsset['owner'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="man">m</option>
            <option value="woman">w</option>
            <option value="joint">gemeinsam</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wert (CHF)</label>
          <input
            type="number"
            required
            value={form.currentValue}
            onChange={(e) => setForm({ ...form, currentValue: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:text-gray-800">
          Abbrechen
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          {saving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </form>
  );
}

function LiabilityForm({ clientId, onSave, onCancel }: { clientId: string; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    creditor: '',
    liabilityType: 'mortgage' as Liability['liabilityType'],
    owner: 'joint' as Liability['owner'],
    originalAmount: '',
    currentBalance: '',
    interestRate: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await liabilitiesService.create({
        clientId,
        creditor: form.creditor,
        liabilityType: form.liabilityType,
        owner: form.owner,
        originalAmount: parseFloat(form.originalAmount) || 0,
        currentBalance: parseFloat(form.currentBalance) || 0,
        interestRate: parseFloat(form.interestRate) || 0,
      });
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gläubiger</label>
          <input
            type="text"
            required
            value={form.creditor}
            onChange={(e) => setForm({ ...form, creditor: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
          <select
            value={form.liabilityType}
            onChange={(e) => setForm({ ...form, liabilityType: e.target.value as Liability['liabilityType'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="mortgage">Hypothek</option>
            <option value="personal_loan">Privatkredit</option>
            <option value="car_loan">Autokredit</option>
            <option value="credit_card">Kreditkarte</option>
            <option value="student_loan">Studienkredit</option>
            <option value="business_loan">Geschäftskredit</option>
            <option value="other">Sonstige</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Restschuld (CHF)</label>
          <input
            type="number"
            required
            value={form.currentBalance}
            onChange={(e) => setForm({ ...form, currentBalance: e.target.value, originalAmount: form.originalAmount || e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Zinssatz (%)</label>
          <input
            type="number"
            step="0.01"
            required
            value={form.interestRate}
            onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-gray-600 hover:text-gray-800">
          Abbrechen
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          {saving ? 'Speichern...' : 'Speichern'}
        </button>
      </div>
    </form>
  );
}
