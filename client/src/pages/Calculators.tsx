import { useState } from 'react';
import { Calculator, TrendingUp, PiggyBank, Target, RefreshCw, Percent } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

type CalculatorType = 'compound' | 'savings' | 'goal' | 'retirement' | 'comparison';

export default function Calculators() {
  const [activeCalc, setActiveCalc] = useState<CalculatorType>('compound');

  const calculators = [
    { id: 'compound' as const, name: 'Zinseszins', icon: Percent, description: 'Kapitalentwicklung mit Zinseszins' },
    { id: 'savings' as const, name: 'Sparplan', icon: PiggyBank, description: 'Regelmässige Einzahlungen' },
    { id: 'goal' as const, name: 'Sparziel', icon: Target, description: 'Wie viel sparen für ein Ziel?' },
    { id: 'retirement' as const, name: 'Rente', icon: TrendingUp, description: 'Altersvorsorge berechnen' },
    { id: 'comparison' as const, name: 'Vergleich', icon: RefreshCw, description: 'Szenarien vergleichen' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Calculator className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Rendite-Rechner</h2>
      </div>

      {/* Calculator Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {calculators.map((calc) => (
          <button
            key={calc.id}
            onClick={() => setActiveCalc(calc.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              activeCalc === calc.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <calc.icon className={`w-6 h-6 mb-2 ${activeCalc === calc.id ? 'text-primary-600' : 'text-gray-500'}`} />
            <p className={`font-medium ${activeCalc === calc.id ? 'text-primary-700' : 'text-gray-900'}`}>
              {calc.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">{calc.description}</p>
          </button>
        ))}
      </div>

      {/* Calculator Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeCalc === 'compound' && <CompoundInterestCalculator />}
        {activeCalc === 'savings' && <SavingsPlanCalculator />}
        {activeCalc === 'goal' && <GoalCalculator />}
        {activeCalc === 'retirement' && <RetirementCalculator />}
        {activeCalc === 'comparison' && <ComparisonCalculator />}
      </div>
    </div>
  );
}

// ============================================
// COMPOUND INTEREST CALCULATOR (Zinseszinsrechner)
// ============================================
function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(20);
  const [compoundFrequency, setCompoundFrequency] = useState(1); // 1=yearly, 12=monthly

  const calculateCompound = () => {
    const data = [];
    let balance = principal;
    const periodicRate = rate / 100 / compoundFrequency;

    for (let year = 0; year <= years; year++) {
      const periods = year * compoundFrequency;
      balance = principal * Math.pow(1 + periodicRate, periods);
      const interest = balance - principal;
      data.push({
        year,
        balance: Math.round(balance),
        principal,
        interest: Math.round(interest),
      });
    }
    return data;
  };

  const data = calculateCompound();
  const finalBalance = data[data.length - 1]?.balance || 0;
  const totalInterest = finalBalance - principal;
  const totalReturn = ((finalBalance - principal) / principal) * 100;
  const annualizedReturn = (Math.pow(finalBalance / principal, 1 / years) - 1) * 100;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Zinseszinsrechner</h3>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anfangskapital (CHF)
            </label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jährliche Rendite (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anlagedauer (Jahre)
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>1 Jahr</span>
              <span className="font-medium text-primary-600">{years} Jahre</span>
              <span>50 Jahre</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zinseszins-Frequenz
            </label>
            <select
              value={compoundFrequency}
              onChange={(e) => setCompoundFrequency(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={1}>Jährlich</option>
              <option value={4}>Quartalsweise</option>
              <option value={12}>Monatlich</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Endkapital</p>
              <p className="text-2xl font-bold text-primary-600">
                {finalBalance.toLocaleString('de-CH')} CHF
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Zinsertrag</p>
              <p className="text-2xl font-bold text-green-600">
                +{totalInterest.toLocaleString('de-CH')} CHF
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Gesamtrendite</p>
              <p className="text-2xl font-bold text-blue-600">
                +{totalReturn.toFixed(1)}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Ø Jahresrendite</p>
              <p className="text-2xl font-bold text-purple-600">
                {annualizedReturn.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" label={{ value: 'Jahre', position: 'bottom' }} />
          <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(value) => `${Number(value).toLocaleString('de-CH')} CHF`} />
          <Legend />
          <Area type="monotone" dataKey="principal" stackId="1" stroke="#94a3b8" fill="#e2e8f0" name="Kapital" />
          <Area type="monotone" dataKey="interest" stackId="1" stroke="#10b981" fill="#6ee7b7" name="Zinsertrag" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// SAVINGS PLAN CALCULATOR (Sparplanrechner)
// ============================================
function SavingsPlanCalculator() {
  const [initialAmount, setInitialAmount] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [rate, setRate] = useState(5);
  const [years, setYears] = useState(20);

  const calculateSavings = () => {
    const data = [];
    const monthlyRate = rate / 100 / 12;
    let balance = initialAmount;
    let totalContributions = initialAmount;

    for (let year = 0; year <= years; year++) {
      if (year > 0) {
        for (let month = 0; month < 12; month++) {
          balance = balance * (1 + monthlyRate) + monthlyContribution;
          totalContributions += monthlyContribution;
        }
      }
      data.push({
        year,
        balance: Math.round(balance),
        contributions: Math.round(totalContributions),
        interest: Math.round(balance - totalContributions),
      });
    }
    return data;
  };

  const data = calculateSavings();
  const finalData = data[data.length - 1];
  const finalBalance = finalData?.balance || 0;
  const totalContributions = finalData?.contributions || 0;
  const totalInterest = finalData?.interest || 0;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Sparplanrechner</h3>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anfangskapital (CHF)
            </label>
            <input
              type="number"
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monatliche Einzahlung (CHF)
            </label>
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jährliche Rendite (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anlagedauer: {years} Jahre
            </label>
            <input
              type="range"
              min="1"
              max="40"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Endkapital</p>
              <p className="text-2xl font-bold text-primary-600">
                {finalBalance.toLocaleString('de-CH')} CHF
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Einzahlungen</p>
              <p className="text-2xl font-bold text-gray-600">
                {totalContributions.toLocaleString('de-CH')} CHF
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Zinsertrag</p>
              <p className="text-2xl font-bold text-green-600">
                +{totalInterest.toLocaleString('de-CH')} CHF
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500">Rendite auf Einzahlungen</p>
              <p className="text-2xl font-bold text-blue-600">
                +{((totalInterest / totalContributions) * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="bg-primary-50 rounded-lg p-4">
            <p className="text-sm text-primary-700">
              Mit {monthlyContribution.toLocaleString('de-CH')} CHF/Monat über {years} Jahre bei {rate}% Rendite
              erhalten Sie <strong>{finalBalance.toLocaleString('de-CH')} CHF</strong>, davon{' '}
              <strong>{totalInterest.toLocaleString('de-CH')} CHF</strong> Zinsertrag.
            </p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(value) => `${Number(value).toLocaleString('de-CH')} CHF`} />
          <Legend />
          <Area type="monotone" dataKey="contributions" stackId="1" stroke="#94a3b8" fill="#e2e8f0" name="Einzahlungen" />
          <Area type="monotone" dataKey="interest" stackId="1" stroke="#10b981" fill="#6ee7b7" name="Zinsertrag" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// GOAL CALCULATOR (Sparzielrechner)
// ============================================
function GoalCalculator() {
  const [goalAmount, setGoalAmount] = useState(500000);
  const [currentSavings, setCurrentSavings] = useState(50000);
  const [years, setYears] = useState(15);
  const [rate, setRate] = useState(5);

  // Calculate required monthly savings
  const calculateRequiredSavings = () => {
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;

    // Future value of current savings
    const fvCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, months);

    // Remaining amount needed
    const remaining = goalAmount - fvCurrentSavings;

    if (remaining <= 0) {
      return { monthlyNeeded: 0, fvCurrentSavings, alreadyAchieved: true };
    }

    // PMT formula for monthly savings needed
    const monthlyNeeded = remaining * (monthlyRate / (Math.pow(1 + monthlyRate, months) - 1));

    return { monthlyNeeded: Math.max(0, monthlyNeeded), fvCurrentSavings, alreadyAchieved: false };
  };

  const result = calculateRequiredSavings();
  const totalContributions = result.monthlyNeeded * years * 12;
  const totalInterest = goalAmount - currentSavings - totalContributions;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Sparzielrechner</h3>
      <p className="text-gray-600">Wie viel müssen Sie monatlich sparen, um Ihr Ziel zu erreichen?</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sparziel (CHF)
            </label>
            <input
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bereits gespart (CHF)
            </label>
            <input
              type="number"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Zeithorizont: {years} Jahre
            </label>
            <input
              type="range"
              min="1"
              max="40"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Erwartete Rendite (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-4">
          {result.alreadyAchieved ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <p className="text-green-800 font-medium text-lg">
                Ihr Ziel ist bereits erreicht!
              </p>
              <p className="text-green-600 mt-2">
                Ihr aktuelles Kapital von {currentSavings.toLocaleString('de-CH')} CHF wächst
                bei {rate}% Rendite auf {Math.round(result.fvCurrentSavings).toLocaleString('de-CH')} CHF.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 text-center">
                <p className="text-primary-800">Benötigte monatliche Sparrate</p>
                <p className="text-4xl font-bold text-primary-600 mt-2">
                  {Math.round(result.monthlyNeeded).toLocaleString('de-CH')} CHF
                </p>
                <p className="text-sm text-primary-600 mt-1">pro Monat</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Aktuelles Kapital wird zu</p>
                  <p className="text-lg font-bold">
                    {Math.round(result.fvCurrentSavings).toLocaleString('de-CH')} CHF
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Neue Einzahlungen</p>
                  <p className="text-lg font-bold">
                    {Math.round(totalContributions).toLocaleString('de-CH')} CHF
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 col-span-2">
                  <p className="text-sm text-gray-500">Davon Zinsertrag</p>
                  <p className="text-lg font-bold text-green-600">
                    +{Math.round(totalInterest).toLocaleString('de-CH')} CHF
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// RETIREMENT CALCULATOR (Rentenrechner)
// ============================================
function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(65);
  const [currentSavings, setCurrentSavings] = useState(100000);
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [returnRate, setReturnRate] = useState(5);
  const [withdrawalRate] = useState(4);
  const [expectedAhv, setExpectedAhv] = useState(2400);
  const [expectedPk, setExpectedPk] = useState(2000);

  const yearsToRetirement = retirementAge - currentAge;
  const monthlyRate = returnRate / 100 / 12;
  const months = yearsToRetirement * 12;

  // Calculate retirement capital
  const fvCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, months);
  const fvContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  const totalRetirementCapital = fvCurrentSavings + fvContributions;

  // Sustainable monthly withdrawal (4% rule)
  const monthlyWithdrawal = (totalRetirementCapital * (withdrawalRate / 100)) / 12;
  const totalMonthlyIncome = monthlyWithdrawal + expectedAhv + expectedPk;

  // Calculate projection data
  const projectionData = [];
  let balance = currentSavings;
  for (let age = currentAge; age <= retirementAge; age++) {
    projectionData.push({
      age,
      capital: Math.round(balance),
    });
    balance = balance * (1 + returnRate / 100) + monthlyContribution * 12;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Altersvorsorge-Rechner</h3>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aktuelles Alter</label>
              <input
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pensionsalter</label>
              <input
                type="number"
                value={retirementAge}
                onChange={(e) => setRetirementAge(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aktuelles Vorsorgevermögen (CHF)
            </label>
            <input
              type="number"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monatliche Sparrate (CHF)
            </label>
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Erwartete Rendite: {returnRate}%
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={returnRate}
              onChange={(e) => setReturnRate(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AHV-Rente (CHF/Mt.)</label>
              <input
                type="number"
                value={expectedAhv}
                onChange={(e) => setExpectedAhv(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PK-Rente (CHF/Mt.)</label>
              <input
                type="number"
                value={expectedPk}
                onChange={(e) => setExpectedPk(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
            <p className="text-primary-800 font-medium">Vorsorgekapital bei Pensionierung</p>
            <p className="text-3xl font-bold text-primary-600 mt-1">
              {Math.round(totalRetirementCapital).toLocaleString('de-CH')} CHF
            </p>
            <p className="text-sm text-primary-600 mt-1">
              in {yearsToRetirement} Jahren (Alter {retirementAge})
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-800 font-medium mb-3">Monatliches Einkommen im Ruhestand</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-700">AHV-Rente</span>
                <span className="font-medium">{expectedAhv.toLocaleString('de-CH')} CHF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">PK-Rente</span>
                <span className="font-medium">{expectedPk.toLocaleString('de-CH')} CHF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Kapitalverzehr ({withdrawalRate}%)</span>
                <span className="font-medium">{Math.round(monthlyWithdrawal).toLocaleString('de-CH')} CHF</span>
              </div>
              <div className="border-t border-green-300 pt-2 flex justify-between">
                <span className="font-bold text-green-800">Total</span>
                <span className="font-bold text-green-800">{Math.round(totalMonthlyIncome).toLocaleString('de-CH')} CHF</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={projectionData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" label={{ value: 'Alter', position: 'bottom' }} />
          <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
          <Tooltip formatter={(value) => `${Number(value).toLocaleString('de-CH')} CHF`} />
          <Area type="monotone" dataKey="capital" stroke="#0d9488" fill="#5eead4" name="Vorsorgekapital" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================
// COMPARISON CALCULATOR (Szenarienvergleich)
// ============================================
function ComparisonCalculator() {
  const [scenarios, setScenarios] = useState([
    { name: 'Konservativ', rate: 2, color: '#94a3b8' },
    { name: 'Ausgewogen', rate: 5, color: '#0d9488' },
    { name: 'Wachstum', rate: 8, color: '#8b5cf6' },
  ]);
  const [principal, setPrincipal] = useState(100000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [years, setYears] = useState(20);

  const calculateScenario = (rate: number) => {
    const data = [];
    const monthlyRate = rate / 100 / 12;
    let balance = principal;

    for (let year = 0; year <= years; year++) {
      if (year > 0) {
        for (let month = 0; month < 12; month++) {
          balance = balance * (1 + monthlyRate) + monthlyContribution;
        }
      }
      data.push({
        year,
        balance: Math.round(balance),
      });
    }
    return data;
  };

  const chartData = [];
  for (let year = 0; year <= years; year++) {
    const point: Record<string, number> = { year };
    scenarios.forEach((scenario) => {
      const scenarioData = calculateScenario(scenario.rate);
      point[scenario.name] = scenarioData[year].balance;
    });
    chartData.push(point);
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Szenarienvergleich</h3>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Anfangskapital (CHF)</label>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monatliche Einzahlung (CHF)</label>
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jahre: {years}</label>
            <input
              type="range"
              min="5"
              max="40"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {scenarios.map((scenario, i) => {
              const finalValue = calculateScenario(scenario.rate)[years].balance;
              const totalContributions = principal + monthlyContribution * 12 * years;
              const gain = finalValue - totalContributions;

              return (
                <div
                  key={scenario.name}
                  className="rounded-lg p-4"
                  style={{ backgroundColor: `${scenario.color}20` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium" style={{ color: scenario.color }}>
                      {scenario.name}
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      value={scenario.rate}
                      onChange={(e) => {
                        const newScenarios = [...scenarios];
                        newScenarios[i].rate = Number(e.target.value);
                        setScenarios(newScenarios);
                      }}
                      className="w-16 px-2 py-1 text-sm border rounded text-right"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                  <p className="text-xl font-bold" style={{ color: scenario.color }}>
                    {finalValue.toLocaleString('de-CH')} CHF
                  </p>
                  <p className="text-sm text-gray-500">
                    +{gain.toLocaleString('de-CH')} CHF Gewinn
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip formatter={(value) => `${Number(value).toLocaleString('de-CH')} CHF`} />
          <Legend />
          {scenarios.map((scenario) => (
            <Line
              key={scenario.name}
              type="monotone"
              dataKey={scenario.name}
              stroke={scenario.color}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
