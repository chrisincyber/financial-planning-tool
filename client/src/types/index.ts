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
