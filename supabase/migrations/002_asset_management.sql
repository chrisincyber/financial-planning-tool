-- ============================================
-- MIGRATION 002: Asset Management & Extended Features
-- Run this in Supabase SQL Editor
-- ============================================

-- Update clients table with new fields
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS occupation_man TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS occupation_woman TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS employer_man TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS employer_woman TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS employment_rate_man DECIMAL;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS employment_rate_woman DECIMAL;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS marital_status TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS has_children BOOLEAN DEFAULT FALSE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS number_of_children INTEGER;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS children_ages TEXT;

-- ============================================
-- BANK ACCOUNTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  owner TEXT NOT NULL CHECK (owner IN ('man', 'woman', 'joint')),
  bank_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'salary', 'other')),
  iban TEXT,
  balance DECIMAL NOT NULL DEFAULT 0,
  interest_rate DECIMAL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bank_accounts_select" ON public.bank_accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = bank_accounts.client_id
      AND (c.advisor_id = auth.uid() OR c.linked_user_id = auth.uid())
    )
  );

CREATE POLICY "bank_accounts_insert" ON public.bank_accounts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = bank_accounts.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "bank_accounts_update" ON public.bank_accounts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = bank_accounts.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "bank_accounts_delete" ON public.bank_accounts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = bank_accounts.client_id
      AND c.advisor_id = auth.uid()
    )
  );

-- ============================================
-- SECURITIES/INVESTMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.securities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  owner TEXT NOT NULL CHECK (owner IN ('man', 'woman', 'joint')),
  custodian_bank TEXT NOT NULL,
  investment_type TEXT NOT NULL CHECK (investment_type IN ('stocks', 'bonds', 'funds', 'etf', 'structured', 'crypto', 'other')),
  description TEXT NOT NULL,
  quantity DECIMAL,
  purchase_price DECIMAL,
  current_value DECIMAL NOT NULL DEFAULT 0,
  purchase_date DATE,
  currency TEXT DEFAULT 'CHF',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.securities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "securities_select" ON public.securities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = securities.client_id
      AND (c.advisor_id = auth.uid() OR c.linked_user_id = auth.uid())
    )
  );

CREATE POLICY "securities_insert" ON public.securities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = securities.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "securities_update" ON public.securities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = securities.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "securities_delete" ON public.securities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = securities.client_id
      AND c.advisor_id = auth.uid()
    )
  );

-- ============================================
-- REAL ESTATE
-- ============================================
CREATE TABLE IF NOT EXISTS public.real_estate (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  owner TEXT NOT NULL CHECK (owner IN ('man', 'woman', 'joint')),
  property_type TEXT NOT NULL CHECK (property_type IN ('house', 'apartment', 'land', 'commercial', 'vacation', 'other')),
  address TEXT NOT NULL,
  purchase_date DATE,
  purchase_price DECIMAL,
  current_value DECIMAL NOT NULL DEFAULT 0,
  tax_value DECIMAL,
  imputed_rental_value DECIMAL,
  rental_income DECIMAL,
  is_own_residence BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.real_estate ENABLE ROW LEVEL SECURITY;

CREATE POLICY "real_estate_select" ON public.real_estate
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = real_estate.client_id
      AND (c.advisor_id = auth.uid() OR c.linked_user_id = auth.uid())
    )
  );

CREATE POLICY "real_estate_insert" ON public.real_estate
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = real_estate.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "real_estate_update" ON public.real_estate
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = real_estate.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "real_estate_delete" ON public.real_estate
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = real_estate.client_id
      AND c.advisor_id = auth.uid()
    )
  );

-- ============================================
-- OTHER ASSETS
-- ============================================
CREATE TABLE IF NOT EXISTS public.other_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  owner TEXT NOT NULL CHECK (owner IN ('man', 'woman', 'joint')),
  asset_type TEXT NOT NULL CHECK (asset_type IN ('vehicle', 'art', 'jewelry', 'collectibles', 'business', 'loan_receivable', 'other')),
  description TEXT NOT NULL,
  purchase_date DATE,
  purchase_price DECIMAL,
  current_value DECIMAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.other_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "other_assets_select" ON public.other_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = other_assets.client_id
      AND (c.advisor_id = auth.uid() OR c.linked_user_id = auth.uid())
    )
  );

CREATE POLICY "other_assets_insert" ON public.other_assets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = other_assets.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "other_assets_update" ON public.other_assets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = other_assets.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "other_assets_delete" ON public.other_assets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = other_assets.client_id
      AND c.advisor_id = auth.uid()
    )
  );

-- ============================================
-- LIABILITIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.liabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  owner TEXT NOT NULL CHECK (owner IN ('man', 'woman', 'joint')),
  liability_type TEXT NOT NULL CHECK (liability_type IN ('mortgage', 'personal_loan', 'car_loan', 'credit_card', 'student_loan', 'business_loan', 'other')),
  creditor TEXT NOT NULL,
  original_amount DECIMAL NOT NULL,
  current_balance DECIMAL NOT NULL,
  interest_rate DECIMAL NOT NULL,
  monthly_payment DECIMAL,
  start_date DATE,
  end_date DATE,
  linked_asset_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.liabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "liabilities_select" ON public.liabilities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = liabilities.client_id
      AND (c.advisor_id = auth.uid() OR c.linked_user_id = auth.uid())
    )
  );

CREATE POLICY "liabilities_insert" ON public.liabilities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = liabilities.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "liabilities_update" ON public.liabilities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = liabilities.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "liabilities_delete" ON public.liabilities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = liabilities.client_id
      AND c.advisor_id = auth.uid()
    )
  );

-- ============================================
-- PILLAR 1 (AHV/IV)
-- ============================================
CREATE TABLE IF NOT EXISTS public.pillar1 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,

  contribution_years_man INTEGER,
  average_income_man DECIMAL,
  expected_ahv_pension_man DECIMAL,
  has_contribution_gaps_man BOOLEAN DEFAULT FALSE,
  gap_years_man TEXT,

  contribution_years_woman INTEGER,
  average_income_woman DECIMAL,
  expected_ahv_pension_woman DECIMAL,
  has_contribution_gaps_woman BOOLEAN DEFAULT FALSE,
  gap_years_woman TEXT,

  ordered_ik_statement_man BOOLEAN DEFAULT FALSE,
  ordered_ik_statement_woman BOOLEAN DEFAULT FALSE,
  ik_statement_date_man DATE,
  ik_statement_date_woman DATE,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pillar1 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pillar1_select" ON public.pillar1
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = pillar1.client_id
      AND (c.advisor_id = auth.uid() OR c.linked_user_id = auth.uid())
    )
  );

CREATE POLICY "pillar1_insert" ON public.pillar1
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = pillar1.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "pillar1_update" ON public.pillar1
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = pillar1.client_id
      AND c.advisor_id = auth.uid()
    )
  );

-- ============================================
-- PILLAR 2 (BVG/Pensionskasse)
-- ============================================
CREATE TABLE IF NOT EXISTS public.pillar2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,

  pension_fund_man TEXT,
  insured_salary_man DECIMAL,
  current_balance_man DECIMAL,
  projected_pension_man DECIMAL,
  projected_capital_man DECIMAL,
  conversion_rate_man DECIMAL,
  max_voluntary_purchase_man DECIMAL,
  disability_pension_man DECIMAL,
  spouse_pension_man DECIMAL,
  child_pension_man DECIMAL,
  death_capital_man DECIMAL,
  early_retirement_possible_man BOOLEAN DEFAULT FALSE,
  earliest_retirement_age_man INTEGER,

  pension_fund_woman TEXT,
  insured_salary_woman DECIMAL,
  current_balance_woman DECIMAL,
  projected_pension_woman DECIMAL,
  projected_capital_woman DECIMAL,
  conversion_rate_woman DECIMAL,
  max_voluntary_purchase_woman DECIMAL,
  disability_pension_woman DECIMAL,
  spouse_pension_woman DECIMAL,
  child_pension_woman DECIMAL,
  death_capital_woman DECIMAL,
  early_retirement_possible_woman BOOLEAN DEFAULT FALSE,
  earliest_retirement_age_woman INTEGER,

  received_pension_statement_man BOOLEAN DEFAULT FALSE,
  received_pension_statement_woman BOOLEAN DEFAULT FALSE,
  statement_date_man DATE,
  statement_date_woman DATE,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pillar2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pillar2_select" ON public.pillar2
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = pillar2.client_id
      AND (c.advisor_id = auth.uid() OR c.linked_user_id = auth.uid())
    )
  );

CREATE POLICY "pillar2_insert" ON public.pillar2
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = pillar2.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "pillar2_update" ON public.pillar2
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = pillar2.client_id
      AND c.advisor_id = auth.uid()
    )
  );

-- ============================================
-- PILLAR 3 ACCOUNTS (3a/3b)
-- ============================================
CREATE TABLE IF NOT EXISTS public.pillar3_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  owner TEXT NOT NULL CHECK (owner IN ('man', 'woman')),
  pillar_type TEXT NOT NULL CHECK (pillar_type IN ('3a', '3b')),
  provider TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('bank_account', 'insurance', 'fund', 'etf')),
  account_number TEXT,
  start_date DATE,
  current_value DECIMAL NOT NULL DEFAULT 0,
  yearly_contribution DECIMAL,
  interest_rate DECIMAL,
  investment_strategy TEXT,
  beneficiaries TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pillar3_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pillar3_select" ON public.pillar3_accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = pillar3_accounts.client_id
      AND (c.advisor_id = auth.uid() OR c.linked_user_id = auth.uid())
    )
  );

CREATE POLICY "pillar3_insert" ON public.pillar3_accounts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = pillar3_accounts.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "pillar3_update" ON public.pillar3_accounts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = pillar3_accounts.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "pillar3_delete" ON public.pillar3_accounts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = pillar3_accounts.client_id
      AND c.advisor_id = auth.uid()
    )
  );

-- ============================================
-- RISK PROFILE
-- ============================================
CREATE TABLE IF NOT EXISTS public.risk_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL UNIQUE REFERENCES public.clients(id) ON DELETE CASCADE,

  investment_experience_years INTEGER,
  has_stock_experience BOOLEAN DEFAULT FALSE,
  has_bond_experience BOOLEAN DEFAULT FALSE,
  has_fund_experience BOOLEAN DEFAULT FALSE,
  has_derivative_experience BOOLEAN DEFAULT FALSE,

  reaction_to_loss TEXT CHECK (reaction_to_loss IN ('sell_all', 'sell_some', 'hold', 'buy_more')),
  investment_horizon TEXT CHECK (investment_horizon IN ('short', 'medium', 'long', 'very_long')),
  income_stability TEXT CHECK (income_stability IN ('very_stable', 'stable', 'variable', 'uncertain')),
  liquidity_needs TEXT CHECK (liquidity_needs IN ('high', 'medium', 'low')),
  max_acceptable_loss DECIMAL,

  risk_score INTEGER,
  risk_category TEXT CHECK (risk_category IN ('conservative', 'moderate_conservative', 'balanced', 'moderate_aggressive', 'aggressive')),
  recommended_stock_allocation DECIMAL,
  recommended_bond_allocation DECIMAL,
  recommended_cash_allocation DECIMAL,

  assessment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.risk_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "risk_profiles_select" ON public.risk_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = risk_profiles.client_id
      AND (c.advisor_id = auth.uid() OR c.linked_user_id = auth.uid())
    )
  );

CREATE POLICY "risk_profiles_insert" ON public.risk_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = risk_profiles.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "risk_profiles_update" ON public.risk_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = risk_profiles.client_id
      AND c.advisor_id = auth.uid()
    )
  );

-- ============================================
-- LIFE INSURANCE
-- ============================================
CREATE TABLE IF NOT EXISTS public.life_insurance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  owner TEXT NOT NULL CHECK (owner IN ('man', 'woman')),
  insurance_type TEXT NOT NULL CHECK (insurance_type IN ('term_life', 'whole_life', 'endowment', 'disability', 'combined')),
  provider TEXT NOT NULL,
  policy_number TEXT,
  start_date DATE,
  end_date DATE,
  premium DECIMAL NOT NULL,
  premium_frequency TEXT NOT NULL CHECK (premium_frequency IN ('monthly', 'quarterly', 'yearly')),
  sum_insured_death DECIMAL,
  sum_insured_disability DECIMAL,
  current_surrender_value DECIMAL,
  beneficiaries TEXT,
  is_pledged BOOLEAN DEFAULT FALSE,
  pledged_to TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.life_insurance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "life_insurance_select" ON public.life_insurance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = life_insurance.client_id
      AND (c.advisor_id = auth.uid() OR c.linked_user_id = auth.uid())
    )
  );

CREATE POLICY "life_insurance_insert" ON public.life_insurance
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = life_insurance.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "life_insurance_update" ON public.life_insurance
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = life_insurance.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "life_insurance_delete" ON public.life_insurance
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = life_insurance.client_id
      AND c.advisor_id = auth.uid()
    )
  );

-- ============================================
-- INCOME DETAILS
-- ============================================
CREATE TABLE IF NOT EXISTS public.income_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  owner TEXT NOT NULL CHECK (owner IN ('man', 'woman', 'joint')),
  income_type TEXT NOT NULL CHECK (income_type IN ('salary', 'bonus', 'self_employment', 'rental', 'dividends', 'interest', 'pension', 'alimony', 'child_support', 'other')),
  description TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('monthly', 'quarterly', 'yearly', 'one_time')),
  is_taxable BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.income_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "income_details_select" ON public.income_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = income_details.client_id
      AND (c.advisor_id = auth.uid() OR c.linked_user_id = auth.uid())
    )
  );

CREATE POLICY "income_details_insert" ON public.income_details
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = income_details.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "income_details_update" ON public.income_details
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = income_details.client_id
      AND c.advisor_id = auth.uid()
    )
  );

CREATE POLICY "income_details_delete" ON public.income_details
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = income_details.client_id
      AND c.advisor_id = auth.uid()
    )
  );

-- Done!
SELECT 'Migration 002 completed successfully!' as message;
