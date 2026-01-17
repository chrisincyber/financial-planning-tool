import { supabase } from '../lib/supabase';
import type { Client } from '../types';

// Convert snake_case DB to camelCase frontend
function mapClientFromDb(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    createdAt: new Date(row.created_at as string),
    updatedAt: new Date(row.updated_at as string),
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    partnerFirstName: row.partner_first_name as string | undefined,
    partnerLastName: row.partner_last_name as string | undefined,
    postalCode: row.postal_code as string | undefined,
    city: row.city as string | undefined,
    birthDate: row.birth_date as string | undefined,
    partnerBirthDate: row.partner_birth_date as string | undefined,
    phone: row.phone as string | undefined,
    email: row.email as string | undefined,
    avoidDoubleInsurance: row.avoid_double_insurance as boolean,
    closeCoverageGaps: row.close_coverage_gaps as boolean,
    saveTaxes: row.save_taxes as boolean,
    increaseReturns: row.increase_returns as boolean,
    securePartner: row.secure_partner as boolean,
    financialSecurity: row.financial_security as boolean,
    wealthBuilding: row.wealth_building as boolean,
    retirementPlanning: row.retirement_planning as boolean,
    savingForChildren: row.saving_for_children as boolean,
    homeOwnership: row.home_ownership as boolean,
    notes: row.notes as string | undefined,
  };
}

// Convert camelCase frontend to snake_case DB
function mapClientToDb(client: Partial<Client>, advisorId?: string) {
  const result: Record<string, unknown> = {};

  if (advisorId) result.advisor_id = advisorId;
  if (client.firstName !== undefined) result.first_name = client.firstName;
  if (client.lastName !== undefined) result.last_name = client.lastName;
  if (client.partnerFirstName !== undefined) result.partner_first_name = client.partnerFirstName;
  if (client.partnerLastName !== undefined) result.partner_last_name = client.partnerLastName;
  if (client.postalCode !== undefined) result.postal_code = client.postalCode;
  if (client.city !== undefined) result.city = client.city;
  if (client.birthDate !== undefined) result.birth_date = client.birthDate;
  if (client.partnerBirthDate !== undefined) result.partner_birth_date = client.partnerBirthDate;
  if (client.phone !== undefined) result.phone = client.phone;
  if (client.email !== undefined) result.email = client.email;
  if (client.avoidDoubleInsurance !== undefined) result.avoid_double_insurance = client.avoidDoubleInsurance;
  if (client.closeCoverageGaps !== undefined) result.close_coverage_gaps = client.closeCoverageGaps;
  if (client.saveTaxes !== undefined) result.save_taxes = client.saveTaxes;
  if (client.increaseReturns !== undefined) result.increase_returns = client.increaseReturns;
  if (client.securePartner !== undefined) result.secure_partner = client.securePartner;
  if (client.financialSecurity !== undefined) result.financial_security = client.financialSecurity;
  if (client.wealthBuilding !== undefined) result.wealth_building = client.wealthBuilding;
  if (client.retirementPlanning !== undefined) result.retirement_planning = client.retirementPlanning;
  if (client.savingForChildren !== undefined) result.saving_for_children = client.savingForChildren;
  if (client.homeOwnership !== undefined) result.home_ownership = client.homeOwnership;
  if (client.notes !== undefined) result.notes = client.notes;

  return result;
}

export const clientsService = {
  async getAll(): Promise<Client[]> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('last_name');

    if (error) throw error;
    return (data || []).map(mapClientFromDb);
  },

  async getById(id: string): Promise<Client | null> {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return mapClientFromDb(data);
  },

  async create(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>, advisorId: string): Promise<string> {
    const { data, error } = await supabase
      .from('clients')
      .insert(mapClientToDb(client, advisorId))
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async update(id: string, client: Partial<Client>): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .update({ ...mapClientToDb(client), updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
