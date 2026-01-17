import { supabase } from '../lib/supabase';
import type {
  BankAccount,
  SecurityHolding,
  RealEstate,
  OtherAsset,
  Liability,
  Pillar1,
  Pillar2,
  Pillar3Account,
  RiskProfile,
  LifeInsurance,
  IncomeDetail,
} from '../types';

// Generic mapper helper
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function mapFromDb<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const key in row) {
    result[snakeToCamel(key)] = row[key];
  }
  return result as T;
}

function mapToDb(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (obj[key] !== undefined && key !== 'id') {
      result[camelToSnake(key)] = obj[key];
    }
  }
  return result;
}

// Generic CRUD service for list-based tables
function createListService<T extends { id?: string; clientId: string }>(tableName: string) {
  return {
    async getByClientId(clientId: string): Promise<T[]> {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('client_id', clientId)
        .order('created_at');

      if (error) throw error;
      return (data || []).map((row) => mapFromDb<T>(row));
    },

    async create(item: Omit<T, 'id'>): Promise<string> {
      const { data, error } = await supabase
        .from(tableName)
        .insert(mapToDb(item as unknown as Record<string, unknown>))
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    },

    async update(id: string, item: Partial<T>): Promise<void> {
      const { error } = await supabase
        .from(tableName)
        .update(mapToDb(item as unknown as Record<string, unknown>))
        .eq('id', id);

      if (error) throw error;
    },

    async delete(id: string): Promise<void> {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
    },
  };
}

// Generic single-record service
function createSingleRecordService<T extends { id?: string; clientId: string }>(tableName: string) {
  return {
    async getByClientId(clientId: string): Promise<T | null> {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No record exists - create one
          const { data: newData, error: insertError } = await supabase
            .from(tableName)
            .insert({ client_id: clientId })
            .select('*')
            .single();

          if (insertError) {
            console.error(`Error creating ${tableName}:`, insertError);
            return null;
          }
          return mapFromDb<T>(newData);
        }
        throw error;
      }
      return mapFromDb<T>(data);
    },

    async upsert(clientId: string, record: Partial<T>): Promise<void> {
      const { data: existing } = await supabase
        .from(tableName)
        .select('id')
        .eq('client_id', clientId)
        .single();

      const dbRecord = mapToDb({ ...record, clientId } as unknown as Record<string, unknown>);

      if (existing) {
        const { error } = await supabase
          .from(tableName)
          .update(dbRecord)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(tableName).insert(dbRecord);
        if (error) throw error;
      }
    },
  };
}

// Asset Services
export const bankAccountsService = createListService<BankAccount>('bank_accounts');
export const securitiesService = createListService<SecurityHolding>('securities');
export const realEstateService = createListService<RealEstate>('real_estate');
export const otherAssetsService = createListService<OtherAsset>('other_assets');
export const liabilitiesService = createListService<Liability>('liabilities');

// Pension Services
export const pillar1Service = createSingleRecordService<Pillar1>('pillar1');
export const pillar2Service = createSingleRecordService<Pillar2>('pillar2');
export const pillar3AccountsService = createListService<Pillar3Account>('pillar3_accounts');

// Other Services
export const riskProfileService = createSingleRecordService<RiskProfile>('risk_profiles');
export const lifeInsuranceService = createListService<LifeInsurance>('life_insurance');
export const incomeDetailsService = createListService<IncomeDetail>('income_details');

// Aggregate function to get total net worth
export async function calculateNetWorth(clientId: string): Promise<{
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  breakdown: {
    bankAccounts: number;
    securities: number;
    realEstate: number;
    otherAssets: number;
    pillar2: number;
    pillar3: number;
    lifeInsurance: number;
  };
}> {
  const [
    bankAccounts,
    securities,
    realEstate,
    otherAssets,
    liabilities,
    pillar2,
    pillar3Accounts,
    lifeInsurances,
  ] = await Promise.all([
    bankAccountsService.getByClientId(clientId),
    securitiesService.getByClientId(clientId),
    realEstateService.getByClientId(clientId),
    otherAssetsService.getByClientId(clientId),
    liabilitiesService.getByClientId(clientId),
    pillar2Service.getByClientId(clientId),
    pillar3AccountsService.getByClientId(clientId),
    lifeInsuranceService.getByClientId(clientId),
  ]);

  const bankAccountsTotal = bankAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  const securitiesTotal = securities.reduce((sum, s) => sum + (s.currentValue || 0), 0);
  const realEstateTotal = realEstate.reduce((sum, r) => sum + (r.currentValue || 0), 0);
  const otherAssetsTotal = otherAssets.reduce((sum, o) => sum + (o.currentValue || 0), 0);
  const pillar2Total = (pillar2?.currentBalanceMan || 0) + (pillar2?.currentBalanceWoman || 0);
  const pillar3Total = pillar3Accounts.reduce((sum, p) => sum + (p.currentValue || 0), 0);
  const lifeInsuranceTotal = lifeInsurances.reduce((sum, l) => sum + (l.currentSurrenderValue || 0), 0);

  const totalAssets = bankAccountsTotal + securitiesTotal + realEstateTotal + otherAssetsTotal + pillar2Total + pillar3Total + lifeInsuranceTotal;
  const totalLiabilities = liabilities.reduce((sum, l) => sum + (l.currentBalance || 0), 0);

  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    breakdown: {
      bankAccounts: bankAccountsTotal,
      securities: securitiesTotal,
      realEstate: realEstateTotal,
      otherAssets: otherAssetsTotal,
      pillar2: pillar2Total,
      pillar3: pillar3Total,
      lifeInsurance: lifeInsuranceTotal,
    },
  };
}
