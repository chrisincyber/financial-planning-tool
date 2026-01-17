import { supabase } from '../lib/supabase';
import type {
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

// Goals Service
export const goalsService = {
  async getByClientId(clientId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('client_id', clientId)
      .order('target_year');

    if (error) throw error;
    return (data || []).map((row) => mapFromDb<Goal>(row));
  },

  async create(goal: Omit<Goal, 'id'>): Promise<string> {
    const { data, error } = await supabase
      .from('goals')
      .insert(mapToDb(goal as unknown as Record<string, unknown>))
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async update(id: string, goal: Partial<Goal>): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .update(mapToDb(goal as unknown as Record<string, unknown>))
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw error;
  },
};

// Planned Actions Service
export const plannedActionsService = {
  async getByClientId(clientId: string): Promise<PlannedAction[]> {
    const { data, error } = await supabase
      .from('planned_actions')
      .select('*')
      .eq('client_id', clientId)
      .order('priority');

    if (error) throw error;
    return (data || []).map((row) => mapFromDb<PlannedAction>(row));
  },

  async create(action: Omit<PlannedAction, 'id'>): Promise<string> {
    const { data, error } = await supabase
      .from('planned_actions')
      .insert(mapToDb(action as unknown as Record<string, unknown>))
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async update(id: string, action: Partial<PlannedAction>): Promise<void> {
    const { error } = await supabase
      .from('planned_actions')
      .update(mapToDb(action as unknown as Record<string, unknown>))
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('planned_actions').delete().eq('id', id);
    if (error) throw error;
  },
};

// Generic single-record service factory
function createSingleRecordService<T extends { id?: string; clientId: string }>(tableName: string) {
  return {
    async getByClientId(clientId: string): Promise<T | null> {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return mapFromDb<T>(data);
    },

    async upsert(clientId: string, record: Partial<T>): Promise<void> {
      // First try to get existing
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

// Create services for single-record tables
export const housingService = createSingleRecordService<Housing>('housing');
export const propertyInsuranceService = createSingleRecordService<PropertyInsurance>('property_insurance');
export const healthInsuranceService = createSingleRecordService<HealthInsurance>('health_insurance');
export const legalSecurityService = createSingleRecordService<LegalSecurity>('legal_security');
export const taxOptimizationService = createSingleRecordService<TaxOptimization>('tax_optimization');
export const investmentService = createSingleRecordService<Investment>('investment');
export const pensionService = createSingleRecordService<Pension>('pension');
export const budgetService = createSingleRecordService<Budget>('budget');

// Invitations Service
export const invitationsService = {
  async create(clientId: string, email: string): Promise<string> {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const { error } = await supabase.from('client_invitations').insert({
      client_id: clientId,
      email,
      token,
      expires_at: expiresAt.toISOString(),
    });

    if (error) throw error;

    // Return the invitation URL
    const baseUrl = window.location.origin;
    return `${baseUrl}/auth/accept-invitation?token=${token}`;
  },

  async getByClientId(clientId: string) {
    const { data, error } = await supabase
      .from('client_invitations')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('client_invitations').delete().eq('id', id);
    if (error) throw error;
  },
};
