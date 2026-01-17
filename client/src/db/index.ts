import Dexie, { type EntityTable } from 'dexie';
import type {
  Client,
  Goal,
  PlannedAction,
  Housing,
  PropertyInsurance,
  HealthInsurance,
  LegalSecurity,
  TaxOptimization,
  Investment,
  Pension,
  Budget,
  ClientPreferences,
} from '../types';

const db = new Dexie('FinancialPlanningDB') as Dexie & {
  clients: EntityTable<Client, 'id'>;
  goals: EntityTable<Goal, 'id'>;
  plannedActions: EntityTable<PlannedAction, 'id'>;
  housing: EntityTable<Housing, 'id'>;
  propertyInsurance: EntityTable<PropertyInsurance, 'id'>;
  healthInsurance: EntityTable<HealthInsurance, 'id'>;
  legalSecurity: EntityTable<LegalSecurity, 'id'>;
  taxOptimization: EntityTable<TaxOptimization, 'id'>;
  investment: EntityTable<Investment, 'id'>;
  pension: EntityTable<Pension, 'id'>;
  budget: EntityTable<Budget, 'id'>;
  clientPreferences: EntityTable<ClientPreferences, 'id'>;
};

db.version(1).stores({
  clients: '++id, lastName, firstName, createdAt',
  goals: '++id, clientId, targetYear, status',
  plannedActions: '++id, clientId, status, priority',
  housing: '++id, clientId',
  propertyInsurance: '++id, clientId',
  healthInsurance: '++id, clientId',
  legalSecurity: '++id, clientId',
  taxOptimization: '++id, clientId',
  investment: '++id, clientId',
  pension: '++id, clientId',
  budget: '++id, clientId',
  clientPreferences: '++id, clientId',
});

export { db };

// Helper functions for client data management
export async function createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
  const now = new Date();
  const id = await db.clients.add({
    ...clientData,
    createdAt: now,
    updatedAt: now,
  });
  return id as number;
}

export async function updateClient(id: number, clientData: Partial<Client>): Promise<void> {
  await db.clients.update(id, {
    ...clientData,
    updatedAt: new Date(),
  });
}

export async function deleteClient(id: number): Promise<void> {
  // Delete all related data
  await Promise.all([
    db.goals.where('clientId').equals(id).delete(),
    db.plannedActions.where('clientId').equals(id).delete(),
    db.housing.where('clientId').equals(id).delete(),
    db.propertyInsurance.where('clientId').equals(id).delete(),
    db.healthInsurance.where('clientId').equals(id).delete(),
    db.legalSecurity.where('clientId').equals(id).delete(),
    db.taxOptimization.where('clientId').equals(id).delete(),
    db.investment.where('clientId').equals(id).delete(),
    db.pension.where('clientId').equals(id).delete(),
    db.budget.where('clientId').equals(id).delete(),
    db.clientPreferences.where('clientId').equals(id).delete(),
  ]);
  await db.clients.delete(id);
}

export async function getAllClients(): Promise<Client[]> {
  return await db.clients.orderBy('lastName').toArray();
}

export async function getClient(id: number): Promise<Client | undefined> {
  return await db.clients.get(id);
}

// Get or create related data for a client
export async function getOrCreateHousing(clientId: number): Promise<Housing> {
  let housing = await db.housing.where('clientId').equals(clientId).first();
  if (!housing) {
    const id = await db.housing.add({
      clientId,
      isRenter: false,
      seekingRentReduction: false,
      isOwner: false,
      hasMortgage: false,
      amortizationDirect: false,
      amortizationIndirect: false,
    });
    housing = await db.housing.get(id);
  }
  return housing!;
}

export async function getOrCreatePropertyInsurance(clientId: number): Promise<PropertyInsurance> {
  let insurance = await db.propertyInsurance.where('clientId').equals(clientId).first();
  if (!insurance) {
    const id = await db.propertyInsurance.add({
      clientId,
      hasPrivateLiability: false,
      hasHouseholdContents: false,
      hasVehicle: false,
      hasLegalProtection: false,
    });
    insurance = await db.propertyInsurance.get(id);
  }
  return insurance!;
}

export async function getOrCreateHealthInsurance(clientId: number): Promise<HealthInsurance> {
  let insurance = await db.healthInsurance.where('clientId').equals(clientId).first();
  if (!insurance) {
    const id = await db.healthInsurance.add({
      clientId,
      isSmokerMan: false,
      isSmokerWoman: false,
      isHealthyMan: true,
      isHealthyWoman: true,
      hadAlternativePhysio: false,
      hadAccident: false,
      hadIllness: false,
      hadPsychologist: false,
    });
    insurance = await db.healthInsurance.get(id);
  }
  return insurance!;
}

export async function getOrCreateLegalSecurity(clientId: number): Promise<LegalSecurity> {
  let legal = await db.legalSecurity.where('clientId').equals(clientId).first();
  if (!legal) {
    const id = await db.legalSecurity.add({
      clientId,
      hasAdvanceDirective: false,
      hasPatientDecree: false,
      hasCohabitationAgreement: false,
      hasWill: false,
      hasBeneficiaryOrder: false,
      hasPensionBeneficiary: false,
      has3aBeneficiary: false,
      wantsServicePackage: false,
    });
    legal = await db.legalSecurity.get(id);
  }
  return legal!;
}

export async function getOrCreateTaxOptimization(clientId: number): Promise<TaxOptimization> {
  let tax = await db.taxOptimization.where('clientId').equals(clientId).first();
  if (!tax) {
    const id = await db.taxOptimization.add({
      clientId,
      receivedTaxStatement: false,
      wantsServicePackage: false,
    });
    tax = await db.taxOptimization.get(id);
  }
  return tax!;
}

export async function getOrCreateInvestment(clientId: number): Promise<Investment> {
  let investment = await db.investment.where('clientId').equals(clientId).first();
  if (!investment) {
    const id = await db.investment.add({
      clientId,
      receivedTaxStatement: false,
      createInvestmentProfile: false,
      wantsAssetWithdrawal: false,
    });
    investment = await db.investment.get(id);
  }
  return investment!;
}

export async function getOrCreatePension(clientId: number): Promise<Pension> {
  let pension = await db.pension.where('clientId').equals(clientId).first();
  if (!pension) {
    const id = await db.pension.add({
      clientId,
      orderIKStatement: false,
      reviewPensionFund: false,
      review3a: false,
      review3b: false,
    });
    pension = await db.pension.get(id);
  }
  return pension!;
}

export async function getOrCreateBudget(clientId: number): Promise<Budget> {
  let budget = await db.budget.where('clientId').equals(clientId).first();
  if (!budget) {
    const id = await db.budget.add({
      clientId,
      taxesDA: false,
    });
    budget = await db.budget.get(id);
  }
  return budget!;
}

export async function getOrCreateClientPreferences(clientId: number): Promise<ClientPreferences> {
  let prefs = await db.clientPreferences.where('clientId').equals(clientId).first();
  if (!prefs) {
    const id = await db.clientPreferences.add({
      clientId,
      interestedInHousing: false,
      interestedInProtection: false,
      interestedInSilver: false,
      interestedInGold: false,
      interestedInPlatinum: false,
      interestedInPension: false,
      interestedInInvestment: false,
    });
    prefs = await db.clientPreferences.get(id);
  }
  return prefs!;
}

export async function getGoals(clientId: number): Promise<Goal[]> {
  return await db.goals.where('clientId').equals(clientId).toArray();
}

export async function getPlannedActions(clientId: number): Promise<PlannedAction[]> {
  return await db.plannedActions.where('clientId').equals(clientId).sortBy('priority');
}

// Export/Import functionality
export async function exportClientData(clientId: number): Promise<string> {
  const [
    client,
    goals,
    actions,
    housing,
    propertyInsurance,
    healthInsurance,
    legalSecurity,
    taxOptimization,
    investment,
    pension,
    budget,
    preferences,
  ] = await Promise.all([
    db.clients.get(clientId),
    db.goals.where('clientId').equals(clientId).toArray(),
    db.plannedActions.where('clientId').equals(clientId).toArray(),
    db.housing.where('clientId').equals(clientId).first(),
    db.propertyInsurance.where('clientId').equals(clientId).first(),
    db.healthInsurance.where('clientId').equals(clientId).first(),
    db.legalSecurity.where('clientId').equals(clientId).first(),
    db.taxOptimization.where('clientId').equals(clientId).first(),
    db.investment.where('clientId').equals(clientId).first(),
    db.pension.where('clientId').equals(clientId).first(),
    db.budget.where('clientId').equals(clientId).first(),
    db.clientPreferences.where('clientId').equals(clientId).first(),
  ]);

  return JSON.stringify({
    version: 1,
    exportDate: new Date().toISOString(),
    client,
    goals,
    actions,
    housing,
    propertyInsurance,
    healthInsurance,
    legalSecurity,
    taxOptimization,
    investment,
    pension,
    budget,
    preferences,
  }, null, 2);
}
