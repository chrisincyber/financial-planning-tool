import { useClients } from '../context/ClientContext';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Target,
  Building2,
  Shield,
  Heart,
  Scale,
  Receipt,
  TrendingUp,
  PiggyBank,
  Wallet,
  Plus,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  goalsService,
  plannedActionsService,
  housingService,
  budgetService,
} from '../services/data.service';
import type { Goal, PlannedAction, Housing, Budget } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const modules = [
  { name: 'Persönliche Daten', href: '/personal', icon: Users, color: 'bg-blue-500' },
  { name: 'Ziele & Planung', href: '/goals', icon: Target, color: 'bg-purple-500' },
  { name: 'Wohnen', href: '/housing', icon: Building2, color: 'bg-green-500' },
  { name: 'Sachversicherung', href: '/property-insurance', icon: Shield, color: 'bg-yellow-500' },
  { name: 'Krankenversicherung', href: '/health-insurance', icon: Heart, color: 'bg-red-500' },
  { name: 'Rechtssicherheit', href: '/legal', icon: Scale, color: 'bg-indigo-500' },
  { name: 'Steueroptimierung', href: '/tax', icon: Receipt, color: 'bg-orange-500' },
  { name: 'Investment', href: '/investment', icon: TrendingUp, color: 'bg-cyan-500' },
  { name: 'Vorsorge', href: '/pension', icon: PiggyBank, color: 'bg-pink-500' },
  { name: 'Budget', href: '/budget', icon: Wallet, color: 'bg-teal-500' },
];

const COLORS = ['#0d9488', '#0f766e', '#115e59', '#134e4a', '#1a3a38'];

export default function Dashboard() {
  const { currentClient, clients, setCurrentClientId } = useClients();
  const { isAdvisor } = useAuth();
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [actions, setActions] = useState<PlannedAction[]>([]);
  const [housing, setHousing] = useState<Housing | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);

  useEffect(() => {
    if (currentClient?.id) {
      Promise.all([
        goalsService.getByClientId(currentClient.id),
        plannedActionsService.getByClientId(currentClient.id),
        housingService.getByClientId(currentClient.id),
        budgetService.getByClientId(currentClient.id),
      ]).then(([g, a, h, b]) => {
        setGoals(g);
        setActions(a);
        setHousing(h);
        setBudget(b);
      });
    }
  }, [currentClient]);

  // If no client is selected, show welcome screen
  if (!currentClient) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Willkommen bei Finanzplanung Petertil
          </h2>
          <p className="text-gray-600 mb-8">
            {isAdvisor
              ? 'Wählen Sie einen bestehenden Klienten aus oder erstellen Sie einen neuen.'
              : 'Bitte wählen Sie Ihren Finanzplan aus.'}
          </p>
          {isAdvisor && (
            <button
              onClick={() => navigate('/clients/new')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Neuen Klienten erstellen
            </button>
          )}
        </div>

        {clients.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isAdvisor ? 'Bestehende Klienten' : 'Ihre Finanzpläne'}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => {
                    setCurrentClientId(client.id!);
                  }}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-left"
                >
                  <p className="font-medium text-gray-900">
                    {client.firstName} {client.lastName}
                  </p>
                  {client.city && (
                    <p className="text-sm text-gray-500">
                      {client.postalCode} {client.city}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Calculate budget data for chart
  const budgetData = budget
    ? [
        { name: 'Steuern', value: (budget.taxesMan || 0) + (budget.taxesWoman || 0) },
        { name: 'Essen', value: (budget.foodMan || 0) + (budget.foodWoman || 0) },
        { name: 'Mobilität', value: (budget.mobilityMan || 0) + (budget.mobilityWoman || 0) },
        { name: 'Freizeit', value: (budget.leisureMan || 0) + (budget.leisureWoman || 0) },
        { name: 'Sonstiges', value: (budget.clothingMan || 0) + (budget.clothingWoman || 0) + (budget.travelMan || 0) + (budget.travelWoman || 0) },
      ].filter((d) => d.value > 0)
    : [];

  // Goals by timeline
  const goalsByYear = [1, 2, 3, 5, 10, 20].map((year) => ({
    year: `${year}J`,
    count: goals.filter((g) => g.targetYear === year).length,
  }));

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
              <p className="text-sm text-gray-500">Ziele</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {actions.filter((a) => a.status === 'completed').length}/{actions.length}
              </p>
              <p className="text-sm text-gray-500">Massnahmen erledigt</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {housing?.isOwner ? 'Eigentum' : housing?.isRenter ? 'Miete' : '-'}
              </p>
              <p className="text-sm text-gray-500">Wohnsituation</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {budget
                  ? `${((budget.savingsRateMan || 0) + (budget.savingsRateWoman || 0)).toLocaleString('de-CH')} CHF`
                  : '-'}
              </p>
              <p className="text-sm text-gray-500">Sparquote/Mt.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Charts */}
        {budgetData.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ausgabenverteilung</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={budgetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name }) => name}
                >
                  {budgetData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toLocaleString('de-CH')} CHF`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {goals.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ziele nach Zeithorizont</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={goalsByYear}>
                <XAxis dataKey="year" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Planned Actions */}
      {actions.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Beabsichtigte Massnahmen</h3>
            <button
              onClick={() => navigate('/goals')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Alle anzeigen <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {actions.slice(0, 5).map((action) => (
              <div
                key={action.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                {action.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{action.goal}</p>
                  <p className="text-sm text-gray-500 truncate">{action.action}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    action.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : action.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {action.status === 'completed'
                    ? 'Erledigt'
                    : action.status === 'in_progress'
                    ? 'In Bearbeitung'
                    : 'Ausstehend'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Module Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Module</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {modules.map((module) => (
            <button
              key={module.name}
              onClick={() => navigate(module.href)}
              className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-left group"
            >
              <div
                className={`w-10 h-10 ${module.color} rounded-lg flex items-center justify-center mb-3`}
              >
                <module.icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-medium text-gray-900 group-hover:text-primary-600">
                {module.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
