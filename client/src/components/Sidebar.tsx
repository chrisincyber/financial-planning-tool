import { NavLink, useNavigate } from 'react-router-dom';
import {
  Users,
  Home,
  Target,
  Building2,
  Shield,
  Heart,
  Scale,
  Receipt,
  TrendingUp,
  PiggyBank,
  Wallet,
  LayoutDashboard,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { useClients } from '../context/ClientContext';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Persönliche Daten', href: '/personal', icon: Users },
  { name: 'Ziele & Planung', href: '/goals', icon: Target },
  { name: 'Wohnen', href: '/housing', icon: Building2 },
  { name: 'Sachversicherung', href: '/property-insurance', icon: Shield },
  { name: 'Krankenversicherung', href: '/health-insurance', icon: Heart },
  { name: 'Rechtssicherheit', href: '/legal', icon: Scale },
  { name: 'Steueroptimierung', href: '/tax', icon: Receipt },
  { name: 'Investment', href: '/investment', icon: TrendingUp },
  { name: 'Vorsorge', href: '/pension', icon: PiggyBank },
  { name: 'Budget', href: '/budget', icon: Wallet },
];

export default function Sidebar() {
  const { clients, currentClient, setCurrentClientId } = useClients();
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-primary-800 text-white">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-primary-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">FINA</h1>
              <p className="text-xs text-primary-300">Finanzplanung</p>
            </div>
          </div>
        </div>

        {/* Client Selector */}
        <div className="px-4 py-4 border-b border-primary-700">
          <div className="relative">
            <button
              onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-primary-700 rounded-lg hover:bg-primary-600 transition-colors"
            >
              <span className="text-sm truncate">
                {currentClient
                  ? `${currentClient.firstName} ${currentClient.lastName}`
                  : 'Klient auswählen'}
              </span>
              <ChevronDown className="w-4 h-4 shrink-0" />
            </button>

            {clientDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 max-h-64 overflow-auto">
                <button
                  onClick={() => {
                    navigate('/clients/new');
                    setClientDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-primary-600 hover:bg-primary-50 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Neuer Klient
                </button>
                <div className="border-t border-gray-100" />
                {clients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      setCurrentClientId(client.id!);
                      setClientDropdownOpen(false);
                      navigate('/dashboard');
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-primary-50 ${
                      currentClient?.id === client.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700'
                    }`}
                  >
                    {client.firstName} {client.lastName}
                  </button>
                ))}
                {clients.length === 0 && (
                  <p className="px-3 py-2 text-sm text-gray-500">
                    Keine Klienten vorhanden
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-primary-200 hover:bg-white/5 hover:text-white'
                } ${!currentClient && item.href !== '/dashboard' ? 'opacity-50 pointer-events-none' : ''}`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-primary-700">
          <p className="text-xs text-primary-400 text-center">
            Persönlich · Nachhaltig · Transparent
          </p>
        </div>
      </div>
    </aside>
  );
}
