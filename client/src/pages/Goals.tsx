import { useState, useEffect } from 'react';
import { useClients } from '../context/ClientContext';
import { db, getGoals, getPlannedActions } from '../db';
import { Plus, Trash2, Target, CheckSquare } from 'lucide-react';
import type { Goal, PlannedAction } from '../types';

const timelineYears = [1, 2, 3, 5, 10, 20];
const priorities = [
  { value: 'low', label: 'Niedrig', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium', label: 'Mittel', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'Hoch', color: 'bg-red-100 text-red-700' },
];

export default function Goals() {
  const { currentClient } = useClients();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [actions, setActions] = useState<PlannedAction[]>([]);
  const [saving, setSaving] = useState(false);

  // New goal form
  const [newGoal, setNewGoal] = useState({
    description: '',
    targetYear: 1,
    estimatedCost: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  // New action form
  const [newAction, setNewAction] = useState({
    forMan: true,
    forWoman: false,
    goal: '',
    action: '',
    responsible: '',
    deadline: '',
  });

  useEffect(() => {
    if (currentClient?.id) {
      loadData();
    }
  }, [currentClient]);

  const loadData = async () => {
    if (!currentClient?.id) return;
    const [g, a] = await Promise.all([
      getGoals(currentClient.id),
      getPlannedActions(currentClient.id),
    ]);
    setGoals(g);
    setActions(a);
  };

  if (!currentClient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Bitte wählen Sie zuerst einen Klienten aus.</p>
      </div>
    );
  }

  const addGoal = async () => {
    if (!newGoal.description || !currentClient.id) return;
    setSaving(true);
    try {
      await db.goals.add({
        clientId: currentClient.id,
        description: newGoal.description,
        targetYear: newGoal.targetYear,
        estimatedCost: newGoal.estimatedCost ? parseFloat(newGoal.estimatedCost) : undefined,
        priority: newGoal.priority,
        status: 'planned',
      });
      setNewGoal({ description: '', targetYear: 1, estimatedCost: '', priority: 'medium' });
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const deleteGoal = async (id: number) => {
    await db.goals.delete(id);
    await loadData();
  };

  const updateGoalStatus = async (id: number, status: Goal['status']) => {
    await db.goals.update(id, { status });
    await loadData();
  };

  const addAction = async () => {
    if (!newAction.goal || !newAction.action || !currentClient.id) return;
    setSaving(true);
    try {
      const maxPriority = actions.length > 0 ? Math.max(...actions.map((a) => a.priority)) : 0;
      await db.plannedActions.add({
        clientId: currentClient.id,
        forMan: newAction.forMan,
        forWoman: newAction.forWoman,
        priority: maxPriority + 1,
        goal: newAction.goal,
        action: newAction.action,
        responsible: newAction.responsible,
        deadline: newAction.deadline || undefined,
        status: 'pending',
      });
      setNewAction({
        forMan: true,
        forWoman: false,
        goal: '',
        action: '',
        responsible: '',
        deadline: '',
      });
      await loadData();
    } finally {
      setSaving(false);
    }
  };

  const deleteAction = async (id: number) => {
    await db.plannedActions.delete(id);
    await loadData();
  };

  const updateActionStatus = async (id: number, status: PlannedAction['status']) => {
    await db.plannedActions.update(id, { status });
    await loadData();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Ziele & Planung</h2>

      {/* Goals Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Ziele in den nächsten Jahren / grössere Ausgaben
          </h3>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          {timelineYears.map((year) => (
            <div key={year} className="text-center">
              <div className="text-sm font-medium text-primary-600 mb-2">{year} Jahr(e)</div>
              <div className="min-h-[100px] bg-gray-50 rounded-lg p-2 space-y-2">
                {goals
                  .filter((g) => g.targetYear === year)
                  .map((goal) => (
                    <div
                      key={goal.id}
                      className={`p-2 rounded text-xs ${
                        goal.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : goal.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="font-medium truncate">{goal.description}</div>
                      {goal.estimatedCost && (
                        <div className="text-gray-500">
                          {goal.estimatedCost.toLocaleString('de-CH')} CHF
                        </div>
                      )}
                      <div className="flex gap-1 mt-1">
                        <button
                          onClick={() =>
                            updateGoalStatus(
                              goal.id!,
                              goal.status === 'completed' ? 'planned' : 'completed'
                            )
                          }
                          className="text-green-600 hover:text-green-800"
                          title={goal.status === 'completed' ? 'Als offen markieren' : 'Als erledigt markieren'}
                        >
                          <CheckSquare className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id!)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add Goal Form */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-700 mb-3">Neues Ziel hinzufügen</h4>
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm text-gray-600 mb-1">Beschreibung</label>
              <input
                type="text"
                value={newGoal.description}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="z.B. Neues Auto, Renovation..."
              />
            </div>
            <div className="w-32">
              <label className="block text-sm text-gray-600 mb-1">Jahr</label>
              <select
                value={newGoal.targetYear}
                onChange={(e) => setNewGoal({ ...newGoal, targetYear: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {timelineYears.map((y) => (
                  <option key={y} value={y}>
                    {y} Jahr(e)
                  </option>
                ))}
              </select>
            </div>
            <div className="w-36">
              <label className="block text-sm text-gray-600 mb-1">Kosten (CHF)</label>
              <input
                type="number"
                value={newGoal.estimatedCost}
                onChange={(e) => setNewGoal({ ...newGoal, estimatedCost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="0"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm text-gray-600 mb-1">Priorität</label>
              <select
                value={newGoal.priority}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, priority: e.target.value as 'low' | 'medium' | 'high' })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {priorities.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={addGoal}
              disabled={saving || !newGoal.description}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Hinzufügen
            </button>
          </div>
        </div>
      </div>

      {/* Planned Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Beabsichtigte Massnahmen</h3>
        </div>

        {/* Actions Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-600 w-16">m/w</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-600 w-12">Prio</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">Ziel</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-600">Was</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-600 w-28">Wer</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-600 w-28">Wann</th>
                <th className="text-left py-2 px-2 text-sm font-medium text-gray-600 w-28">Status</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action) => (
                <tr key={action.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-2">
                    <span className="text-sm">
                      {action.forMan && 'm'}
                      {action.forMan && action.forWoman && '/'}
                      {action.forWoman && 'w'}
                    </span>
                  </td>
                  <td className="py-2 px-2">
                    <span className="text-sm font-medium">{action.priority}</span>
                  </td>
                  <td className="py-2 px-2 text-sm">{action.goal}</td>
                  <td className="py-2 px-2 text-sm">{action.action}</td>
                  <td className="py-2 px-2 text-sm">{action.responsible}</td>
                  <td className="py-2 px-2 text-sm">{action.deadline || '-'}</td>
                  <td className="py-2 px-2">
                    <select
                      value={action.status}
                      onChange={(e) =>
                        updateActionStatus(action.id!, e.target.value as PlannedAction['status'])
                      }
                      className={`text-xs px-2 py-1 rounded-full border-0 ${
                        action.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : action.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <option value="pending">Ausstehend</option>
                      <option value="in_progress">In Bearbeitung</option>
                      <option value="completed">Erledigt</option>
                    </select>
                  </td>
                  <td className="py-2 px-2">
                    <button
                      onClick={() => deleteAction(action.id!)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {actions.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    Noch keine Massnahmen erfasst
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Action Form */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-700 mb-3">Neue Massnahme hinzufügen</h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newAction.forMan}
                  onChange={(e) => setNewAction({ ...newAction, forMan: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                />
                <span className="text-sm">m</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newAction.forWoman}
                  onChange={(e) => setNewAction({ ...newAction, forWoman: e.target.checked })}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                />
                <span className="text-sm">w</span>
              </label>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ziel</label>
              <input
                type="text"
                value={newAction.goal}
                onChange={(e) => setNewAction({ ...newAction, goal: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Ziel der Massnahme"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Was</label>
              <input
                type="text"
                value={newAction.action}
                onChange={(e) => setNewAction({ ...newAction, action: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Beschreibung"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Wer</label>
              <input
                type="text"
                value={newAction.responsible}
                onChange={(e) => setNewAction({ ...newAction, responsible: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Verantwortlich"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Wann</label>
              <input
                type="text"
                value={newAction.deadline}
                onChange={(e) => setNewAction({ ...newAction, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="z.B. Q2 2025"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addAction}
                disabled={saving || !newAction.goal || !newAction.action}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
