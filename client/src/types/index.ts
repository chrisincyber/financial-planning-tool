// Client/Personal Information
export interface Client {
  id?: string;
  createdAt: Date;
  updatedAt: Date;

  // Personal Info
  firstName: string;
  lastName: string;
  partnerFirstName?: string;
  partnerLastName?: string;
  postalCode?: string;
  city?: string;
  birthDate?: string;
  partnerBirthDate?: string;
  phone?: string;
  email?: string;

  // Employment
  occupationMan?: string;
  occupationWoman?: string;
  employerMan?: string;
  employerWoman?: string;
  employmentRateMan?: number; // percentage
  employmentRateWoman?: number;

  // Marital Status
  maritalStatus?: 'single' | 'married' | 'registered_partnership' | 'divorced' | 'widowed';
  hasChildren?: boolean;
  numberOfChildren?: number;
  childrenAges?: string;

  // Planning Goals (Optimierung)
  avoidDoubleInsurance: boolean;
  closeCoverageGaps: boolean;
  saveTaxes: boolean;
  increaseReturns: boolean;
  securePartner: boolean;

  // Planning Goals (Planung)
  financialSecurity: boolean;
  wealthBuilding: boolean;
  retirementPlanning: boolean;
  savingForChildren: boolean;
  homeOwnership: boolean;

  // Notes
  notes?: string;
}

// ============================================
// ASSET MANAGEMENT (Vermögensübersicht)
// ============================================

// Bank Account
export interface BankAccount {
  id?: string;
  clientId: string;
  owner: 'man' | 'woman' | 'joint';
  bankName: string;
  accountType: 'checking' | 'savings' | 'salary' | 'other';
  iban?: string;
  balance: number;
  interestRate?: number;
  notes?: string;
}

// Securities/Investments
export interface SecurityHolding {
  id?: string;
  clientId: string;
  owner: 'man' | 'woman' | 'joint';
  custodianBank: string;
  investmentType: 'stocks' | 'bonds' | 'funds' | 'etf' | 'structured' | 'crypto' | 'other';
  description: string;
  quantity?: number;
  purchasePrice?: number;
  currentValue: number;
  purchaseDate?: string;
  currency: string;
  notes?: string;
}

// Real Estate
export interface RealEstate {
  id?: string;
  clientId: string;
  owner: 'man' | 'woman' | 'joint';
  propertyType: 'house' | 'apartment' | 'land' | 'commercial' | 'vacation' | 'other';
  address: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue: number;
  taxValue?: number;
  imputedRentalValue?: number;
  rentalIncome?: number;
  isOwnResidence: boolean;
  notes?: string;
}

// Other Assets (vehicles, valuables, etc.)
export interface OtherAsset {
  id?: string;
  clientId: string;
  owner: 'man' | 'woman' | 'joint';
  assetType: 'vehicle' | 'art' | 'jewelry' | 'collectibles' | 'business' | 'loan_receivable' | 'other';
  description: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue: number;
  notes?: string;
}

// Liabilities
export interface Liability {
  id?: string;
  clientId: string;
  owner: 'man' | 'woman' | 'joint';
  liabilityType: 'mortgage' | 'personal_loan' | 'car_loan' | 'credit_card' | 'student_loan' | 'business_loan' | 'other';
  creditor: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  monthlyPayment?: number;
  startDate?: string;
  endDate?: string;
  linkedAssetId?: string; // for mortgages linked to real estate
  notes?: string;
}

// ============================================
// DETAILED PENSION SYSTEM (3-Säulen-System)
// ============================================

// 1st Pillar - AHV/IV
export interface Pillar1 {
  id?: string;
  clientId: string;

  // Man
  contributionYearsMan?: number;
  averageIncomeMan?: number;
  expectedAhvPensionMan?: number;
  hasContributionGapsMan?: boolean;
  gapYearsMan?: string;

  // Woman
  contributionYearsWoman?: number;
  averageIncomeWoman?: number;
  expectedAhvPensionWoman?: number;
  hasContributionGapsWoman?: boolean;
  gapYearsWoman?: string;

  // IK Statement
  orderedIKStatementMan?: boolean;
  orderedIKStatementWoman?: boolean;
  ikStatementDateMan?: string;
  ikStatementDateWoman?: string;

  notes?: string;
}

// 2nd Pillar - BVG/Pensionskasse
export interface Pillar2 {
  id?: string;
  clientId: string;

  // Man
  pensionFundMan?: string;
  insuredSalaryMan?: number;
  currentBalanceMan?: number;
  projectedPensionMan?: number;
  projectedCapitalMan?: number;
  conversionRateMan?: number;
  maxVoluntaryPurchaseMan?: number;
  disabilityPensionMan?: number;
  spousePensionMan?: number;
  childPensionMan?: number;
  deathCapitalMan?: number;
  earlyRetirementPossibleMan?: boolean;
  earliestRetirementAgeMan?: number;

  // Woman
  pensionFundWoman?: string;
  insuredSalaryWoman?: number;
  currentBalanceWoman?: number;
  projectedPensionWoman?: number;
  projectedCapitalWoman?: number;
  conversionRateWoman?: number;
  maxVoluntaryPurchaseWoman?: number;
  disabilityPensionWoman?: number;
  spousePensionWoman?: number;
  childPensionWoman?: number;
  deathCapitalWoman?: number;
  earlyRetirementPossibleWoman?: boolean;
  earliestRetirementAgeWoman?: number;

  // Documents
  receivedPensionStatementMan?: boolean;
  receivedPensionStatementWoman?: boolean;
  statementDateMan?: string;
  statementDateWoman?: string;

  notes?: string;
}

// 3rd Pillar - 3a/3b
export interface Pillar3Account {
  id?: string;
  clientId: string;
  owner: 'man' | 'woman';
  pillarType: '3a' | '3b';
  provider: string;
  productType: 'bank_account' | 'insurance' | 'fund' | 'etf';
  accountNumber?: string;
  startDate?: string;
  currentValue: number;
  yearlyContribution?: number;
  interestRate?: number;
  investmentStrategy?: string;
  beneficiaries?: string;
  notes?: string;
}

// ============================================
// RISK PROFILE
// ============================================

export interface RiskProfile {
  id?: string;
  clientId: string;

  // Investment Experience
  investmentExperienceYears?: number;
  hasStockExperience?: boolean;
  hasBondExperience?: boolean;
  hasFundExperience?: boolean;
  hasDerivativeExperience?: boolean;

  // Risk Tolerance Questions
  reactionToLoss?: 'sell_all' | 'sell_some' | 'hold' | 'buy_more';
  investmentHorizon?: 'short' | 'medium' | 'long' | 'very_long';
  incomeStability?: 'very_stable' | 'stable' | 'variable' | 'uncertain';
  liquidityNeeds?: 'high' | 'medium' | 'low';
  maxAcceptableLoss?: number; // percentage

  // Calculated Profile
  riskScore?: number; // 1-10
  riskCategory?: 'conservative' | 'moderate_conservative' | 'balanced' | 'moderate_aggressive' | 'aggressive';
  recommendedStockAllocation?: number;
  recommendedBondAllocation?: number;
  recommendedCashAllocation?: number;

  assessmentDate?: string;
  notes?: string;
}

// ============================================
// LIFE INSURANCE (Lebensversicherung)
// ============================================

export interface LifeInsurance {
  id?: string;
  clientId: string;
  owner: 'man' | 'woman';
  insuranceType: 'term_life' | 'whole_life' | 'endowment' | 'disability' | 'combined';
  provider: string;
  policyNumber?: string;
  startDate?: string;
  endDate?: string;
  premium: number;
  premiumFrequency: 'monthly' | 'quarterly' | 'yearly';
  sumInsuredDeath?: number;
  sumInsuredDisability?: number;
  currentSurrenderValue?: number;
  beneficiaries?: string;
  isPledged?: boolean;
  pledgedTo?: string;
  notes?: string;
}

// ============================================
// INCOME DETAILS
// ============================================

export interface IncomeDetail {
  id?: string;
  clientId: string;
  owner: 'man' | 'woman' | 'joint';
  incomeType: 'salary' | 'bonus' | 'self_employment' | 'rental' | 'dividends' | 'interest' | 'pension' | 'alimony' | 'child_support' | 'other';
  description: string;
  amount: number;
  frequency: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
  isTaxable: boolean;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

// ============================================
// TAX DETAILS (expanded)
// ============================================

export interface TaxDetail {
  id?: string;
  clientId: string;
  taxYear: number;
  canton: string;
  municipality: string;

  // Income
  grossIncomeMan?: number;
  grossIncomeWoman?: number;
  netIncomeMan?: number;
  netIncomeWoman?: number;

  // Deductions
  pillar2PurchaseMan?: number;
  pillar2PurchaseWoman?: number;
  pillar3aContributionMan?: number;
  pillar3aContributionWoman?: number;
  mortgageInterest?: number;
  maintenanceCosts?: number;
  childDeductions?: number;
  insurancePremiums?: number;
  professionalExpenses?: number;
  otherDeductions?: number;

  // Wealth
  totalWealth?: number;
  wealthTax?: number;

  // Results
  taxableIncome?: number;
  incomeTaxFederal?: number;
  incomeTaxCantonal?: number;
  incomeTaxMunicipal?: number;
  totalTaxBurden?: number;

  notes?: string;
}

// Goals with Timeline
export interface Goal {
  id?: string;
  clientId: string;
  description: string;
  targetYear: number; // 1, 2, 3, 5, 10, 20
  estimatedCost?: number;
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'in_progress' | 'completed';
}

// Intended Measures (Beabsichtigte Massnahmen)
export interface PlannedAction {
  id?: string;
  clientId: string;
  forMan: boolean;
  forWoman: boolean;
  priority: number;
  goal: string;
  action: string;
  responsible: string;
  deadline?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

// Housing (Wohnen)
export interface Housing {
  id?: string;
  clientId: string;

  // Rental
  isRenter: boolean;
  monthlyRent?: number;
  additionalCosts?: number;
  seekingRentReduction: boolean;

  // Ownership
  isOwner: boolean;
  propertyType?: string; // Eigentumsart
  hasMortgage: boolean;
  purchasePrice?: number;
  taxValue?: number;
  debt?: number;
  mortgageBank?: string;

  // Mortgage Details
  mortgageType?: string; // Art (Fix, Variable, etc.)
  mortgageAmount?: number;
  mortgageExpiry?: string;
  interestRate?: number;
  amortizationDirect: boolean;
  amortizationIndirect: boolean;
  amortizationAmount?: number;

  // Property Details
  acquiredDate?: string;
  imputedRentalValue?: number;
  renovationPlans?: string;
  utilityCosts?: number;

  // Future Goal
  homeOwnershipGoal?: string;
  targetDate?: string;
  targetPrice?: number;
}

// Property Insurance (Sachversicherung)
export interface PropertyInsurance {
  id?: string;
  clientId: string;

  // PHP - Privathaftpflicht
  hasPrivateLiability: boolean;
  privateLiabilityMan?: string;
  privateLiabilityWoman?: string;

  // HR - Hausrat
  hasHouseholdContents: boolean;
  householdContentsMan?: string;
  householdContentsWoman?: string;

  // MF - Motorfahrzeug
  hasVehicle: boolean;
  vehicleMan?: string;
  vehicleWoman?: string;

  // RS - Rechtsschutz
  hasLegalProtection: boolean;
  legalProtectionMan?: string;
  legalProtectionWoman?: string;

  remarks?: string;
}

// Health Insurance (Gesundheitsvorsorge)
export interface HealthInsurance {
  id?: string;
  clientId: string;

  // KVG - Grundversicherung
  kvgProviderMan?: string;
  kvgProviderWoman?: string;

  // VVG - Zusatzversicherung
  vvgProviderMan?: string;
  vvgProviderWoman?: string;

  // Franchise
  franchiseMan?: number;
  franchiseWoman?: number;

  // Costs per year
  yearlyPremiumMan?: number;
  yearlyPremiumWoman?: number;

  // IPV - Prämienverbilligung
  ipvMan?: number;
  ipvWoman?: number;

  // Health details
  heightMan?: number;
  heightWoman?: number;
  weightMan?: number;
  weightWoman?: number;

  // Family doctor
  familyDoctorMan?: string;
  familyDoctorWoman?: string;

  // Smoker
  isSmokerMan: boolean;
  isSmokerWoman: boolean;

  // Health status
  isHealthyMan: boolean;
  isHealthyWoman: boolean;

  // Last 5 years
  hadAlternativePhysio: boolean;
  hadAccident: boolean;
  hadIllness: boolean;
  hadPsychologist: boolean;

  protectionGoals?: string;
}

// Legal Security (Rechtssicherheit)
export interface LegalSecurity {
  id?: string;
  clientId: string;

  hasAdvanceDirective: boolean; // Vorsorgeauftrag
  hasPatientDecree: boolean; // Patientenverfügung
  hasCohabitationAgreement: boolean; // Konkubinatsvertrag
  hasWill: boolean; // Testament
  hasBeneficiaryOrder: boolean; // Begünstigung regeln
  hasPensionBeneficiary: boolean; // PK
  has3aBeneficiary: boolean; // 3a/3b
  wantsServicePackage: boolean; // Servicepaket erwünscht

  legalGoals?: string;
}

// Tax Optimization (Steueroptimierung)
export interface TaxOptimization {
  id?: string;
  clientId: string;

  receivedTaxStatement: boolean; // STEK erhalten
  wantsServicePackage: boolean;

  taxGoals?: string;

  // Current tax situation
  taxableIncomeMan?: number;
  taxableIncomeWoman?: number;
  currentTaxBurden?: number;

  // Deductions
  pillar3aContributionMan?: number;
  pillar3aContributionWoman?: number;
  pensionFundPurchase?: number;
  otherDeductions?: number;
}

// Investment
export interface Investment {
  id?: string;
  clientId: string;

  // Income (Einnahmen)
  incomeMan?: number;
  incomeWoman?: number;

  // Liquidity (Liquidität)
  liquidAssetsMan?: number;
  liquidAssetsWoman?: number;

  // Investment Assets (Anlagevermögen)
  investmentAssetsMan?: number;
  investmentAssetsWoman?: number;

  receivedTaxStatement: boolean; // STEK
  createInvestmentProfile: boolean; // Anlageprofil erstellen
  wantsAssetWithdrawal: boolean; // Vermögensauszug

  investmentGoals?: string;
}

// Pension/Retirement (Vorsorge)
export interface Pension {
  id?: string;
  clientId: string;

  // Disability/Death Insurance (Absicherung IV/Tod)
  pillar1AverageIncomeMan?: number;
  pillar1AverageIncomeWoman?: number;
  pillar2AmountMan?: number;
  pillar2AmountWoman?: number;
  disabilityNeedMan?: number;
  disabilityNeedWoman?: number;
  deathNeedMan?: number;
  deathNeedWoman?: number;

  // Retirement Planning (Altersvorsorge)
  targetRetirementAgeMan?: number;
  targetRetirementAgeWoman?: number;
  retirementNeedMan?: number;
  retirementNeedWoman?: number;

  // IK Order
  orderIKStatement: boolean;

  // Pension fund details
  reviewPensionFund: boolean; // PK
  review3a: boolean;
  review3b: boolean;
}

// Budget
export interface Budget {
  id?: string;
  clientId: string;

  // Expenses (monthly)
  taxesMan?: number;
  taxesWoman?: number;
  taxesDA?: boolean; // Direkte Abrechnung

  foodMan?: number;
  foodWoman?: number;

  mobilityMan?: number;
  mobilityWoman?: number;

  communicationMan?: number;
  communicationWoman?: number;

  clothingMan?: number;
  clothingWoman?: number;

  travelMan?: number;
  travelWoman?: number;

  leisureMan?: number;
  leisureWoman?: number;

  creditMan?: number;
  creditWoman?: number;

  // Savings Rate (Sparquote)
  savingsRateMan?: number;
  savingsRateWoman?: number;
}

// Follow-up and Interests
export interface ClientPreferences {
  id?: string;
  clientId: string;

  // Follow-up appointment
  followUpDate?: string;
  contactPreference?: 'du' | 'sie';
  preferredDay?: 'A' | 'B' | 'D';
  preferredWeek?: 1 | 2 | 4;
  isBirthday?: boolean;

  // Interest areas
  interestedInHousing: boolean;
  interestedInProtection: boolean;
  interestedInSilver: boolean;
  interestedInGold: boolean;
  interestedInPlatinum: boolean;
  interestedInPension: boolean;
  interestedInInvestment: boolean;

  // Notes
  personalNotes?: string; // Vorlieben, Ferien, Haustier
  salesOpportunities?: string; // Verk. Chancen
}

// Dashboard summary
export interface ClientSummary {
  client: Client;
  housing?: Housing;
  propertyInsurance?: PropertyInsurance;
  healthInsurance?: HealthInsurance;
  legalSecurity?: LegalSecurity;
  taxOptimization?: TaxOptimization;
  investment?: Investment;
  pension?: Pension;
  budget?: Budget;
  preferences?: ClientPreferences;
  goals: Goal[];
  actions: PlannedAction[];
}
