-- ============================================
-- FINANZPLANUNG PETERTIL - DATABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('advisor', 'client')) DEFAULT 'advisor',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENTS TABLE (financial planning clients)
-- ============================================
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advisor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  linked_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  partner_first_name TEXT,
  partner_last_name TEXT,
  postal_code TEXT,
  city TEXT,
  birth_date DATE,
  partner_birth_date DATE,
  phone TEXT,
  email TEXT,

  avoid_double_insurance BOOLEAN DEFAULT FALSE,
  close_coverage_gaps BOOLEAN DEFAULT FALSE,
  save_taxes BOOLEAN DEFAULT FALSE,
  increase_returns BOOLEAN DEFAULT FALSE,
  secure_partner BOOLEAN DEFAULT FALSE,

  financial_security BOOLEAN DEFAULT FALSE,
  wealth_building BOOLEAN DEFAULT FALSE,
  retirement_planning BOOLEAN DEFAULT FALSE,
  saving_for_children BOOLEAN DEFAULT FALSE,
  home_ownership BOOLEAN DEFAULT FALSE,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GOALS TABLE
-- ============================================
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  target_year INTEGER NOT NULL,
  estimated_cost DECIMAL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed')) DEFAULT 'planned'
);

-- ============================================
-- PLANNED_ACTIONS TABLE
-- ============================================
CREATE TABLE public.planned_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  for_man BOOLEAN DEFAULT FALSE,
  for_woman BOOLEAN DEFAULT FALSE,
  priority INTEGER,
  goal TEXT,
  action TEXT,
  responsible TEXT,
  deadline TEXT,
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending'
);

-- ============================================
-- HOUSING TABLE
-- ============================================
CREATE TABLE public.housing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

  is_renter BOOLEAN DEFAULT FALSE,
  monthly_rent DECIMAL,
  additional_costs DECIMAL,
  seeking_rent_reduction BOOLEAN DEFAULT FALSE,

  is_owner BOOLEAN DEFAULT FALSE,
  property_type TEXT,
  has_mortgage BOOLEAN DEFAULT FALSE,
  purchase_price DECIMAL,
  tax_value DECIMAL,
  debt DECIMAL,
  mortgage_bank TEXT,

  mortgage_type TEXT,
  mortgage_amount DECIMAL,
  mortgage_expiry TEXT,
  interest_rate DECIMAL,
  amortization_direct BOOLEAN DEFAULT FALSE,
  amortization_indirect BOOLEAN DEFAULT FALSE,
  amortization_amount DECIMAL,

  acquired_date TEXT,
  imputed_rental_value DECIMAL,
  renovation_plans TEXT,
  utility_costs DECIMAL,

  home_ownership_goal TEXT,
  target_date TEXT,
  target_price DECIMAL,

  UNIQUE(client_id)
);

-- ============================================
-- PROPERTY_INSURANCE TABLE
-- ============================================
CREATE TABLE public.property_insurance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

  has_private_liability BOOLEAN DEFAULT FALSE,
  private_liability_man TEXT,
  private_liability_woman TEXT,

  has_household_contents BOOLEAN DEFAULT FALSE,
  household_contents_man TEXT,
  household_contents_woman TEXT,

  has_vehicle BOOLEAN DEFAULT FALSE,
  vehicle_man TEXT,
  vehicle_woman TEXT,

  has_legal_protection BOOLEAN DEFAULT FALSE,
  legal_protection_man TEXT,
  legal_protection_woman TEXT,

  remarks TEXT,

  UNIQUE(client_id)
);

-- ============================================
-- HEALTH_INSURANCE TABLE
-- ============================================
CREATE TABLE public.health_insurance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

  kvg_provider_man TEXT,
  kvg_provider_woman TEXT,
  vvg_provider_man TEXT,
  vvg_provider_woman TEXT,

  franchise_man INTEGER,
  franchise_woman INTEGER,
  yearly_premium_man DECIMAL,
  yearly_premium_woman DECIMAL,
  ipv_man DECIMAL,
  ipv_woman DECIMAL,

  height_man INTEGER,
  height_woman INTEGER,
  weight_man INTEGER,
  weight_woman INTEGER,

  family_doctor_man TEXT,
  family_doctor_woman TEXT,

  is_smoker_man BOOLEAN DEFAULT FALSE,
  is_smoker_woman BOOLEAN DEFAULT FALSE,
  is_healthy_man BOOLEAN DEFAULT TRUE,
  is_healthy_woman BOOLEAN DEFAULT TRUE,

  had_alternative_physio BOOLEAN DEFAULT FALSE,
  had_accident BOOLEAN DEFAULT FALSE,
  had_illness BOOLEAN DEFAULT FALSE,
  had_psychologist BOOLEAN DEFAULT FALSE,

  protection_goals TEXT,

  UNIQUE(client_id)
);

-- ============================================
-- LEGAL_SECURITY TABLE
-- ============================================
CREATE TABLE public.legal_security (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

  has_advance_directive BOOLEAN DEFAULT FALSE,
  has_patient_decree BOOLEAN DEFAULT FALSE,
  has_cohabitation_agreement BOOLEAN DEFAULT FALSE,
  has_will BOOLEAN DEFAULT FALSE,
  has_beneficiary_order BOOLEAN DEFAULT FALSE,
  has_pension_beneficiary BOOLEAN DEFAULT FALSE,
  has_3a_beneficiary BOOLEAN DEFAULT FALSE,
  wants_service_package BOOLEAN DEFAULT FALSE,
  legal_goals TEXT,

  UNIQUE(client_id)
);

-- ============================================
-- TAX_OPTIMIZATION TABLE
-- ============================================
CREATE TABLE public.tax_optimization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

  received_tax_statement BOOLEAN DEFAULT FALSE,
  wants_service_package BOOLEAN DEFAULT FALSE,
  tax_goals TEXT,

  taxable_income_man DECIMAL,
  taxable_income_woman DECIMAL,
  current_tax_burden DECIMAL,

  pillar_3a_contribution_man DECIMAL,
  pillar_3a_contribution_woman DECIMAL,
  pension_fund_purchase DECIMAL,
  other_deductions DECIMAL,

  UNIQUE(client_id)
);

-- ============================================
-- INVESTMENT TABLE
-- ============================================
CREATE TABLE public.investment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

  income_man DECIMAL,
  income_woman DECIMAL,
  liquid_assets_man DECIMAL,
  liquid_assets_woman DECIMAL,
  investment_assets_man DECIMAL,
  investment_assets_woman DECIMAL,

  received_tax_statement BOOLEAN DEFAULT FALSE,
  create_investment_profile BOOLEAN DEFAULT FALSE,
  wants_asset_withdrawal BOOLEAN DEFAULT FALSE,
  investment_goals TEXT,

  UNIQUE(client_id)
);

-- ============================================
-- PENSION TABLE
-- ============================================
CREATE TABLE public.pension (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

  pillar_1_average_income_man DECIMAL,
  pillar_1_average_income_woman DECIMAL,
  pillar_2_amount_man DECIMAL,
  pillar_2_amount_woman DECIMAL,
  disability_need_man DECIMAL,
  disability_need_woman DECIMAL,
  death_need_man DECIMAL,
  death_need_woman DECIMAL,

  target_retirement_age_man INTEGER,
  target_retirement_age_woman INTEGER,
  retirement_need_man DECIMAL,
  retirement_need_woman DECIMAL,

  order_ik_statement BOOLEAN DEFAULT FALSE,
  review_pension_fund BOOLEAN DEFAULT FALSE,
  review_3a BOOLEAN DEFAULT FALSE,
  review_3b BOOLEAN DEFAULT FALSE,

  UNIQUE(client_id)
);

-- ============================================
-- BUDGET TABLE
-- ============================================
CREATE TABLE public.budget (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

  taxes_man DECIMAL,
  taxes_woman DECIMAL,
  taxes_da BOOLEAN DEFAULT FALSE,

  food_man DECIMAL,
  food_woman DECIMAL,
  mobility_man DECIMAL,
  mobility_woman DECIMAL,
  communication_man DECIMAL,
  communication_woman DECIMAL,
  clothing_man DECIMAL,
  clothing_woman DECIMAL,
  travel_man DECIMAL,
  travel_woman DECIMAL,
  leisure_man DECIMAL,
  leisure_woman DECIMAL,
  credit_man DECIMAL,
  credit_woman DECIMAL,

  savings_rate_man DECIMAL,
  savings_rate_woman DECIMAL,

  UNIQUE(client_id)
);

-- ============================================
-- CLIENT_PREFERENCES TABLE
-- ============================================
CREATE TABLE public.client_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,

  follow_up_date DATE,
  contact_preference TEXT CHECK (contact_preference IN ('du', 'sie')),
  preferred_day TEXT CHECK (preferred_day IN ('A', 'B', 'D')),
  preferred_week INTEGER CHECK (preferred_week IN (1, 2, 4)),
  is_birthday BOOLEAN DEFAULT FALSE,

  interested_in_housing BOOLEAN DEFAULT FALSE,
  interested_in_protection BOOLEAN DEFAULT FALSE,
  interested_in_silver BOOLEAN DEFAULT FALSE,
  interested_in_gold BOOLEAN DEFAULT FALSE,
  interested_in_platinum BOOLEAN DEFAULT FALSE,
  interested_in_pension BOOLEAN DEFAULT FALSE,
  interested_in_investment BOOLEAN DEFAULT FALSE,

  personal_notes TEXT,
  sales_opportunities TEXT,

  UNIQUE(client_id)
);

-- ============================================
-- CLIENT_INVITATIONS TABLE
-- ============================================
CREATE TABLE public.client_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_clients_advisor ON public.clients(advisor_id);
CREATE INDEX idx_clients_linked_user ON public.clients(linked_user_id);
CREATE INDEX idx_goals_client ON public.goals(client_id);
CREATE INDEX idx_planned_actions_client ON public.planned_actions(client_id);
CREATE INDEX idx_invitations_token ON public.client_invitations(token);
CREATE INDEX idx_invitations_email ON public.client_invitations(email);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planned_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.housing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_optimization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pension ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.can_access_client(p_client_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.clients c
    WHERE c.id = p_client_id
    AND (
      c.advisor_id = auth.uid()
      OR c.linked_user_id = auth.uid()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_advisor_for_client(p_client_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.clients c
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE c.id = p_client_id
    AND c.advisor_id = auth.uid()
    AND p.role = 'advisor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_advisor()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'advisor'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- CLIENTS POLICIES
-- ============================================
CREATE POLICY "Users can view accessible clients"
  ON public.clients FOR SELECT
  USING (advisor_id = auth.uid() OR linked_user_id = auth.uid());

CREATE POLICY "Advisors can create clients"
  ON public.clients FOR INSERT
  WITH CHECK (advisor_id = auth.uid() AND public.is_advisor());

CREATE POLICY "Advisors can update their clients"
  ON public.clients FOR UPDATE
  USING (advisor_id = auth.uid() AND public.is_advisor());

CREATE POLICY "Advisors can delete their clients"
  ON public.clients FOR DELETE
  USING (advisor_id = auth.uid() AND public.is_advisor());

-- ============================================
-- GOALS POLICIES
-- ============================================
CREATE POLICY "Users can view goals"
  ON public.goals FOR SELECT
  USING (public.can_access_client(client_id));

CREATE POLICY "Advisors can create goals"
  ON public.goals FOR INSERT
  WITH CHECK (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can update goals"
  ON public.goals FOR UPDATE
  USING (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can delete goals"
  ON public.goals FOR DELETE
  USING (public.is_advisor_for_client(client_id));

-- ============================================
-- PLANNED_ACTIONS POLICIES
-- ============================================
CREATE POLICY "Users can view planned_actions"
  ON public.planned_actions FOR SELECT
  USING (public.can_access_client(client_id));

CREATE POLICY "Advisors can create planned_actions"
  ON public.planned_actions FOR INSERT
  WITH CHECK (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can update planned_actions"
  ON public.planned_actions FOR UPDATE
  USING (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can delete planned_actions"
  ON public.planned_actions FOR DELETE
  USING (public.is_advisor_for_client(client_id));

-- ============================================
-- HOUSING POLICIES
-- ============================================
CREATE POLICY "Users can view housing"
  ON public.housing FOR SELECT
  USING (public.can_access_client(client_id));

CREATE POLICY "Advisors can create housing"
  ON public.housing FOR INSERT
  WITH CHECK (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can update housing"
  ON public.housing FOR UPDATE
  USING (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can delete housing"
  ON public.housing FOR DELETE
  USING (public.is_advisor_for_client(client_id));

-- ============================================
-- PROPERTY_INSURANCE POLICIES
-- ============================================
CREATE POLICY "Users can view property_insurance"
  ON public.property_insurance FOR SELECT
  USING (public.can_access_client(client_id));

CREATE POLICY "Advisors can create property_insurance"
  ON public.property_insurance FOR INSERT
  WITH CHECK (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can update property_insurance"
  ON public.property_insurance FOR UPDATE
  USING (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can delete property_insurance"
  ON public.property_insurance FOR DELETE
  USING (public.is_advisor_for_client(client_id));

-- ============================================
-- HEALTH_INSURANCE POLICIES
-- ============================================
CREATE POLICY "Users can view health_insurance"
  ON public.health_insurance FOR SELECT
  USING (public.can_access_client(client_id));

CREATE POLICY "Advisors can create health_insurance"
  ON public.health_insurance FOR INSERT
  WITH CHECK (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can update health_insurance"
  ON public.health_insurance FOR UPDATE
  USING (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can delete health_insurance"
  ON public.health_insurance FOR DELETE
  USING (public.is_advisor_for_client(client_id));

-- ============================================
-- LEGAL_SECURITY POLICIES
-- ============================================
CREATE POLICY "Users can view legal_security"
  ON public.legal_security FOR SELECT
  USING (public.can_access_client(client_id));

CREATE POLICY "Advisors can create legal_security"
  ON public.legal_security FOR INSERT
  WITH CHECK (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can update legal_security"
  ON public.legal_security FOR UPDATE
  USING (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can delete legal_security"
  ON public.legal_security FOR DELETE
  USING (public.is_advisor_for_client(client_id));

-- ============================================
-- TAX_OPTIMIZATION POLICIES
-- ============================================
CREATE POLICY "Users can view tax_optimization"
  ON public.tax_optimization FOR SELECT
  USING (public.can_access_client(client_id));

CREATE POLICY "Advisors can create tax_optimization"
  ON public.tax_optimization FOR INSERT
  WITH CHECK (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can update tax_optimization"
  ON public.tax_optimization FOR UPDATE
  USING (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can delete tax_optimization"
  ON public.tax_optimization FOR DELETE
  USING (public.is_advisor_for_client(client_id));

-- ============================================
-- INVESTMENT POLICIES
-- ============================================
CREATE POLICY "Users can view investment"
  ON public.investment FOR SELECT
  USING (public.can_access_client(client_id));

CREATE POLICY "Advisors can create investment"
  ON public.investment FOR INSERT
  WITH CHECK (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can update investment"
  ON public.investment FOR UPDATE
  USING (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can delete investment"
  ON public.investment FOR DELETE
  USING (public.is_advisor_for_client(client_id));

-- ============================================
-- PENSION POLICIES
-- ============================================
CREATE POLICY "Users can view pension"
  ON public.pension FOR SELECT
  USING (public.can_access_client(client_id));

CREATE POLICY "Advisors can create pension"
  ON public.pension FOR INSERT
  WITH CHECK (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can update pension"
  ON public.pension FOR UPDATE
  USING (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can delete pension"
  ON public.pension FOR DELETE
  USING (public.is_advisor_for_client(client_id));

-- ============================================
-- BUDGET POLICIES
-- ============================================
CREATE POLICY "Users can view budget"
  ON public.budget FOR SELECT
  USING (public.can_access_client(client_id));

CREATE POLICY "Advisors can create budget"
  ON public.budget FOR INSERT
  WITH CHECK (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can update budget"
  ON public.budget FOR UPDATE
  USING (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can delete budget"
  ON public.budget FOR DELETE
  USING (public.is_advisor_for_client(client_id));

-- ============================================
-- CLIENT_PREFERENCES POLICIES
-- ============================================
CREATE POLICY "Users can view client_preferences"
  ON public.client_preferences FOR SELECT
  USING (public.can_access_client(client_id));

CREATE POLICY "Advisors can create client_preferences"
  ON public.client_preferences FOR INSERT
  WITH CHECK (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can update client_preferences"
  ON public.client_preferences FOR UPDATE
  USING (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can delete client_preferences"
  ON public.client_preferences FOR DELETE
  USING (public.is_advisor_for_client(client_id));

-- ============================================
-- CLIENT_INVITATIONS POLICIES
-- ============================================
CREATE POLICY "Advisors can view invitations"
  ON public.client_invitations FOR SELECT
  USING (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can create invitations"
  ON public.client_invitations FOR INSERT
  WITH CHECK (public.is_advisor_for_client(client_id));

CREATE POLICY "Advisors can delete invitations"
  ON public.client_invitations FOR DELETE
  USING (public.is_advisor_for_client(client_id));

-- Allow public read of invitations by token (for accepting)
CREATE POLICY "Anyone can view invitation by token"
  ON public.client_invitations FOR SELECT
  USING (true);

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'advisor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
