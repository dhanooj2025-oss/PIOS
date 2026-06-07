import { create } from 'zustand';
import {
  convertCurrency,
  calculateProductiveHours,
  calculateEffectiveHourlyCost,
  calculateRecommendedQuote,
  calculateNPV,
  calculateQuoteConfidenceScore,
  DEFAULT_EXCHANGE_RATES
} from '../utils/pricingEngine';
import type { ExchangeRates, CashFlowMilestone } from '../utils/pricingEngine';
import { supabase, isSupabaseConfigured } from '../utils/supabaseClient';


// Interface types corresponding to database records and frontend states
export interface Employee {
  id: string;
  roleName: string;
  department: string;
  annualSalary: number;
  salaryCurrency: string;
  totalWorkingHoursMonth: number;
  utilizationPercent: number;
  allocationFactor: number;
  overheadMultiplier: number;
  meetingsHours: number;
  operationsHours: number;
  leaveHours: number;
  internalSupportHours: number;
  learningHours: number;
  activeStatus: boolean;
}

export interface InfrastructureService {
  id: string;
  serviceName: string;
  category: string;
  monthlyCost: number;
  costCurrency: string;
  allocationType: 'organization_wide' | 'department_wise' | 'project_specific' | 'usage_based';
  allocationPercent: number;
  projectDependency: boolean;
  activeStatus: boolean;
}

export interface SaasTool {
  id: string;
  toolName: string;
  category: string;
  monthlyCost: number;
  costCurrency: string;
  seats: number;
  allocationPercent: number;
  aiDependency: boolean;
  activeStatus: boolean;
}

export interface OverheadCategory {
  id: string;
  categoryName: string;
  monthlyCost: number;
  costCurrency: string;
  allocationLogic: string;
  recurring: boolean;
}

export interface MarginPolicy {
  policyName: string;
  minimumSafeMargin: number;
  targetMargin: number;
  enterpriseMargin: number;
  contingencyDefault: number;
  emergencyBuffer: number;
  pricingMode: 'conservative' | 'balanced' | 'aggressive';
}

export interface RegionalBenchmark {
  regionName: string;
  currency: string;
  minimumRate: number;
  averageRate: number;
  enterpriseRate: number;
  competitivenessIndex: number;
}

export interface ProjectResourceAllocation {
  id: string;
  employeeId: string; // References Employee
  allocatedHours: number;
  quantity: number;
}

export interface Milestone {
  id: string;
  name: string;
  percentage: number; // e.g. 30 for 30%
  paymentDelayDays: number;
}

export interface ProjectEstimate {
  projectName: string;
  clientName: string;
  clientRegion: string; // e.g. 'US', 'UK', 'UAE', 'India'
  contractType: 'fixed_cost' | 'time_material' | 'retainer' | 'dedicated_team' | 'hourly' | 'amc';
  estimatedHours: number;
  deliveryTimelineDays: number;
  targetMargin: number;
  contingencyPercent: number;
  discountRate: number; // annual NPV discount rate %
  simAiToolsCost?: number;
  simSaasToolsCost?: number;
  simInfraCost?: number;
  simOtherCosts?: number;
}

export interface RecurringRevenue {
  id: string;
  clientName: string;
  revenueType: 'amc' | 'retainer' | 'dedicated_resource' | 'subscription' | 'consulting' | 'product';
  amount: number;
  currency: string;
  frequency: 'monthly' | 'yearly' | 'quarterly' | 'one_time';
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'ended';
  notes: string;
}

export interface RecurringExpense {
  id: string;
  expenseName: string;
  category: 'payroll' | 'hosting' | 'infrastructure' | 'ai_tools' | 'software_licenses' | 'internet' | 'rent' | 'compliance' | 'operations' | 'other';
  amount: number;
  currency: string;
  frequency: 'monthly' | 'yearly' | 'quarterly' | 'one_time';
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'ended';
  forecastImpact: 'high' | 'medium' | 'low';
}

export interface Receivable {
  id: string;
  client: string;
  invoice: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'unpaid' | 'paid' | 'overdue';
  daysOutstanding: number;
  collectionRisk: 'high' | 'medium' | 'low';
}

export interface Payable {
  id: string;
  vendor: string;
  expense: string;
  amount: number;
  currency: string;
  dueDate: string;
  status: 'unpaid' | 'paid' | 'overdue';
  priority: 'high' | 'medium' | 'low';
}

export interface ArchivedEstimate {
  id: string;
  projectName: string;
  clientName: string;
  clientRegion: string;
  contractType: 'fixed_cost' | 'time_material' | 'retainer' | 'dedicated_team' | 'hourly' | 'amc';
  estimatedHours: number;
  recommendedQuote: number;
  targetMargin: number;
  marginHealth: 'Passed' | 'Underquoted' | 'Flagged';
  confidenceScore: number;
  timestamp: string;
  deliveryTimelineDays: number;
  contingencyPercent: number;
  discountRate: number;
}

export interface UserProfile {
  fullName: string;
  designation: string;
  email: string;
  phoneNumber: string;
  profilePicture: string;
}

export interface CompanyProfile {
  companyName: string;
  companyLogo: string;
  website: string;
  baseCurrency: string;
  timeZone: string;
  companyAddress?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  currencyFormat: 'symbol_prefix' | 'symbol_suffix' | 'code_prefix' | 'code_suffix';
  dateFormat: 'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY';
  startWeekOn: 'Sunday' | 'Monday';
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  actionType: 'create' | 'update' | 'delete';
  changeSummary: string;
  createdAt: string;
}

interface PricingStore {
  // Profile & Preferences State
  userProfile: UserProfile;
  companyProfile: CompanyProfile;
  userPreferences: UserPreferences;

  // Configs
  baseCurrency: string;
  exchangeRates: ExchangeRates;
  employees: Employee[];
  infraServices: InfrastructureService[];
  saasTools: SaasTool[];
  overheads: OverheadCategory[];
  marginPolicy: MarginPolicy;
  benchmarks: RegionalBenchmark[];

  // Active Project Estimate State
  projectEstimate: ProjectEstimate;
  allocatedResources: ProjectResourceAllocation[];
  milestones: Milestone[];
  
  // Saved Estimate Library State
  savedEstimates: ArchivedEstimate[];

  // Financial Hub State
  recurringRevenues: RecurringRevenue[];
  recurringExpenses: RecurringExpense[];
  receivables: Receivable[];
  payables: Payable[];
  auditLogs: AuditLog[];

  // Calculated Live Metrics
  metrics: {
    totalWorkforceCostMonth: number;
    totalInfraCostMonth: number;
    totalSaaSCostMonth: number;
    totalOverheadCostMonth: number;
    monthlyOrganizationalBurn: number;
    totalProductiveHoursMonth: number;
    effectiveHourlyBurn: number;

    // Financial Hub Aggregates
    totalRecurringRevenueMonth: number;
    totalRecurringExpenseMonth: number;
    totalOutstandingReceivables: number;
    totalOutstandingPayables: number;

    // Simulation Outputs
    simWorkforceCost: number;
    simInfraCost: number;
    simSaaSCost: number;
    simOverheadCost: number;
    simOperationalCost: number;
    simContingencyCost: number;
    simRecommendedQuote: number;
    simEffectiveBillingRate: number;
    simNPV: number;
    simMarginHealthScore: number;
    simStabilityScore: number;
    simCashRecoveryScore: number;
    simBenchmarkScore: number;
    simConfidenceScore: number;
  };

  // Setters & Actions
  setBaseCurrency: (currency: string) => void;
  updateExchangeRate: (from: string, to: string, rate: number) => void;
  
  // Employee Actions
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Infra Actions
  addInfraService: (service: Omit<InfrastructureService, 'id'>) => void;
  updateInfraService: (id: string, updates: Partial<InfrastructureService>) => void;
  deleteInfraService: (id: string) => void;

  // SaaS Actions
  addSaasTool: (tool: Omit<SaasTool, 'id'>) => void;
  updateSaasTool: (id: string, updates: Partial<SaasTool>) => void;
  deleteSaasTool: (id: string) => void;

  // Overheads Actions
  addOverhead: (overhead: Omit<OverheadCategory, 'id'>) => void;
  updateOverhead: (id: string, updates: Partial<OverheadCategory>) => void;
  deleteOverhead: (id: string) => void;

  // Margin actions
  updateMarginPolicy: (updates: Partial<MarginPolicy>) => void;

  // Active project actions
  updateProjectEstimate: (updates: Partial<ProjectEstimate>) => void;
  addAllocatedResource: (resource: Omit<ProjectResourceAllocation, 'id'>) => void;
  updateAllocatedResource: (id: string, updates: Partial<ProjectResourceAllocation>) => void;
  deleteAllocatedResource: (id: string) => void;

  // Milestone actions
  addMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;
  setMilestonesPreset: (presetName: string) => void;

  // Saved estimate actions
  saveActiveEstimate: (projectName: string, clientName: string) => void;
  deleteArchivedEstimate: (id: string) => void;
  loadArchivedEstimate: (id: string) => void;

  // Financial Hub Actions
  addRecurringRevenue: (revenue: Omit<RecurringRevenue, 'id'>) => void;
  updateRecurringRevenue: (id: string, updates: Partial<RecurringRevenue>) => void;
  deleteRecurringRevenue: (id: string) => void;

  addRecurringExpense: (expense: Omit<RecurringExpense, 'id'>) => void;
  updateRecurringExpense: (id: string, updates: Partial<RecurringExpense>) => void;
  deleteRecurringExpense: (id: string) => void;

  addReceivable: (receivable: Omit<Receivable, 'id'>) => void;
  updateReceivable: (id: string, updates: Partial<Receivable>) => void;
  deleteReceivable: (id: string) => void;

  addPayable: (payable: Omit<Payable, 'id'>) => void;
  updatePayable: (id: string, updates: Partial<Payable>) => void;
  deletePayable: (id: string) => void;

  // Profile & Preferences Actions
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updateCompanyProfile: (updates: Partial<CompanyProfile>) => void;
  updateUserPreferences: (updates: Partial<UserPreferences>) => void;

  // Recompute trigger
  recompute: () => void;

  // DB Sync State & Actions
  dbLoading: boolean;
  fetchInitialData: () => Promise<void>;
  addAuditLog: (log: Omit<AuditLog, 'id' | 'createdAt'>) => Promise<void>;
}

// Initial Mock Configurations based on specifications examples
const initialEmployees: Employee[] = [
  {
    id: 'e1',
    roleName: 'Senior Developer',
    department: 'Engineering',
    annualSalary: 1440000,
    salaryCurrency: 'INR',
    totalWorkingHoursMonth: 176,
    utilizationPercent: 85,
    allocationFactor: 1.0,
    overheadMultiplier: 1.1,
    meetingsHours: 15,
    operationsHours: 10,
    leaveHours: 8,
    internalSupportHours: 12,
    learningHours: 10,
    activeStatus: true
  },
  {
    id: 'e2',
    roleName: 'Junior Developer',
    department: 'Engineering',
    annualSalary: 720000,
    salaryCurrency: 'INR',
    totalWorkingHoursMonth: 176,
    utilizationPercent: 80,
    allocationFactor: 1.0,
    overheadMultiplier: 1.0,
    meetingsHours: 15,
    operationsHours: 8,
    leaveHours: 8,
    internalSupportHours: 5,
    learningHours: 15,
    activeStatus: true
  },
  {
    id: 'e3',
    roleName: 'UI/UX Designer',
    department: 'Design',
    annualSalary: 960000,
    salaryCurrency: 'INR',
    totalWorkingHoursMonth: 176,
    utilizationPercent: 75,
    allocationFactor: 1.0,
    overheadMultiplier: 1.0,
    meetingsHours: 12,
    operationsHours: 8,
    leaveHours: 8,
    internalSupportHours: 10,
    learningHours: 10,
    activeStatus: true
  },
  {
    id: 'e4',
    roleName: 'AI Engineer',
    department: 'Engineering',
    annualSalary: 1800000,
    salaryCurrency: 'INR',
    totalWorkingHoursMonth: 176,
    utilizationPercent: 90,
    allocationFactor: 1.2,
    overheadMultiplier: 1.2,
    meetingsHours: 10,
    operationsHours: 12,
    leaveHours: 8,
    internalSupportHours: 15,
    learningHours: 15,
    activeStatus: true
  }
];

const initialInfraServices: InfrastructureService[] = [
  {
    id: 'i1',
    serviceName: 'AWS Servers',
    category: 'AWS',
    monthlyCost: 800,
    costCurrency: 'USD',
    allocationType: 'organization_wide',
    allocationPercent: 100,
    projectDependency: false,
    activeStatus: true
  },
  {
    id: 'i2',
    serviceName: 'Supabase DB',
    category: 'Supabase',
    monthlyCost: 25,
    costCurrency: 'USD',
    allocationType: 'organization_wide',
    allocationPercent: 100,
    projectDependency: false,
    activeStatus: true
  },
  {
    id: 'i3',
    serviceName: 'GPU Cluster Hosting',
    category: 'GPU Hosting',
    monthlyCost: 1500,
    costCurrency: 'USD',
    allocationType: 'project_specific',
    allocationPercent: 100,
    projectDependency: true,
    activeStatus: true
  }
];

const initialSaasTools: SaasTool[] = [
  {
    id: 's1',
    toolName: 'Cursor AI',
    category: 'AI',
    monthlyCost: 20,
    costCurrency: 'USD',
    seats: 5,
    allocationPercent: 100,
    aiDependency: true,
    activeStatus: true
  },
  {
    id: 's2',
    toolName: 'Jira Enterprise',
    category: 'Productivity',
    monthlyCost: 8,
    costCurrency: 'USD',
    seats: 10,
    allocationPercent: 80,
    aiDependency: false,
    activeStatus: true
  },
  {
    id: 's3',
    toolName: 'Slack Pro',
    category: 'Productivity',
    monthlyCost: 6,
    costCurrency: 'USD',
    seats: 15,
    allocationPercent: 100,
    aiDependency: false,
    activeStatus: true
  }
];

const initialOverheads: OverheadCategory[] = [
  {
    id: 'o1',
    categoryName: 'Office Rent & Workspace',
    monthlyCost: 80000,
    costCurrency: 'INR',
    allocationLogic: 'capacity_division',
    recurring: true
  },
  {
    id: 'o2',
    categoryName: 'HR & Legal Compliance',
    monthlyCost: 35000,
    costCurrency: 'INR',
    allocationLogic: 'capacity_division',
    recurring: true
  },
  {
    id: 'o3',
    categoryName: 'Accounting & Taxes',
    monthlyCost: 15000,
    costCurrency: 'INR',
    allocationLogic: 'capacity_division',
    recurring: true
  }
];

const initialBenchmarks: RegionalBenchmark[] = [
  { regionName: 'US', currency: 'USD', minimumRate: 100, averageRate: 145, enterpriseRate: 220, competitivenessIndex: 85 },
  { regionName: 'UK', currency: 'GBP', minimumRate: 80, averageRate: 110, enterpriseRate: 180, competitivenessIndex: 75 },
  { regionName: 'UAE', currency: 'USD', minimumRate: 90, averageRate: 120, enterpriseRate: 190, competitivenessIndex: 80 },
  { regionName: 'India', currency: 'INR', minimumRate: 1800, averageRate: 2500, enterpriseRate: 4000, competitivenessIndex: 65 }
];

const initialSavedEstimates: ArchivedEstimate[] = [
  {
    id: 'arch_1',
    projectName: 'Project Zenith',
    clientName: 'TechNova Solutions',
    clientRegion: 'US',
    contractType: 'fixed_cost',
    estimatedHours: 800,
    recommendedQuote: 1400000,
    targetMargin: 42,
    marginHealth: 'Passed',
    confidenceScore: 92,
    timestamp: 'Oct 24, 2025',
    deliveryTimelineDays: 90,
    contingencyPercent: 12,
    discountRate: 8
  },
  {
    id: 'arch_2',
    projectName: 'Infrastructure Upgrade',
    clientName: 'Global Health Partners',
    clientRegion: 'UK',
    contractType: 'dedicated_team',
    estimatedHours: 600,
    recommendedQuote: 850000,
    targetMargin: 18,
    marginHealth: 'Underquoted',
    confidenceScore: 62,
    timestamp: 'Nov 12, 2025',
    deliveryTimelineDays: 60,
    contingencyPercent: 15,
    discountRate: 10
  },
  {
    id: 'arch_3',
    projectName: 'Acme Corp HQ Reno',
    clientName: 'Acme Corporation',
    clientRegion: 'US',
    contractType: 'time_material',
    estimatedHours: 350,
    recommendedQuote: 124839,
    targetMargin: 38.2,
    marginHealth: 'Passed',
    confidenceScore: 94,
    timestamp: 'May 10, 2026',
    deliveryTimelineDays: 45,
    contingencyPercent: 10,
    discountRate: 6
  },
  {
    id: 'arch_4',
    projectName: 'Stark Industries Plant',
    clientName: 'Stark Ind.',
    clientRegion: 'India',
    contractType: 'fixed_cost',
    estimatedHours: 200,
    recommendedQuote: 82662,
    targetMargin: 24.5,
    marginHealth: 'Flagged',
    confidenceScore: 78,
    timestamp: 'Apr 18, 2026',
    deliveryTimelineDays: 30,
    contingencyPercent: 8,
    discountRate: 7
  }
];

const initialRecurringRevenues: RecurringRevenue[] = [
  {
    id: 'rev_1',
    clientName: 'Client Retainer',
    revenueType: 'retainer',
    amount: 5000,
    currency: 'INR',
    frequency: 'monthly',
    startDate: '2026-06-02',
    endDate: '2027-06-02',
    status: 'active',
    notes: 'Monthly Client Retainer'
  },
  {
    id: 'rev_2',
    clientName: 'AMC - Initech',
    revenueType: 'amc',
    amount: 75000,
    currency: 'INR',
    frequency: 'monthly',
    startDate: '2026-06-15',
    endDate: '2027-06-15',
    status: 'active',
    notes: 'Annual Maintenance Contract'
  },
  {
    id: 'rev_3',
    clientName: 'Monthly Retainer',
    revenueType: 'retainer',
    amount: 60000,
    currency: 'INR',
    frequency: 'monthly',
    startDate: '2026-06-30',
    endDate: '2027-06-30',
    status: 'active',
    notes: 'Monthly Retainer'
  },
  {
    id: 'rev_4',
    clientName: 'Nexus Global',
    revenueType: 'amc',
    amount: 200000,
    currency: 'INR',
    frequency: 'monthly',
    startDate: '2026-06-05',
    endDate: '2026-12-31',
    status: 'active',
    notes: 'Nexus Global AMC'
  },
  {
    id: 'rev_5',
    clientName: 'Stark Ind',
    revenueType: 'retainer',
    amount: 400000,
    currency: 'INR',
    frequency: 'monthly',
    startDate: '2026-06-10',
    endDate: '2027-02-14',
    status: 'active',
    notes: 'Stark Ind Retainer'
  },
  {
    id: 'rev_6',
    clientName: 'TechNova',
    revenueType: 'dedicated_resource',
    amount: 300000,
    currency: 'INR',
    frequency: 'monthly',
    startDate: '2026-06-20',
    endDate: '2026-08-31',
    status: 'active',
    notes: 'TechNova Resources'
  },
  {
    id: 'rev_7',
    clientName: 'Acme Corp',
    revenueType: 'product',
    amount: 80000,
    currency: 'INR',
    frequency: 'monthly',
    startDate: '2026-06-25',
    endDate: '2026-12-31',
    status: 'active',
    notes: 'Acme Corp API'
  },
  {
    id: 'rev_8',
    clientName: 'Nova Systems',
    revenueType: 'consulting',
    amount: 570000,
    currency: 'INR',
    frequency: 'monthly',
    startDate: '2026-06-28',
    endDate: '2026-10-31',
    status: 'active',
    notes: 'Nova Systems Consulting'
  }
];

const initialRecurringExpenses: RecurringExpense[] = [
  {
    id: 'exp_1',
    expenseName: 'AWS Hosting',
    category: 'infrastructure',
    amount: 42000,
    currency: 'INR',
    frequency: 'monthly',
    startDate: '2026-06-04',
    endDate: '2027-12-31',
    status: 'active',
    forecastImpact: 'medium'
  },
  {
    id: 'exp_2',
    expenseName: 'OpenAI Subscription',
    category: 'ai_tools',
    amount: 8000,
    currency: 'INR',
    frequency: 'monthly',
    startDate: '2026-06-20',
    endDate: '2026-12-31',
    status: 'active',
    forecastImpact: 'low'
  },
  {
    id: 'exp_3',
    expenseName: 'Zoho One',
    category: 'software_licenses',
    amount: 10000,
    currency: 'INR',
    frequency: 'monthly',
    startDate: '2026-06-27',
    endDate: '2026-12-31',
    status: 'active',
    forecastImpact: 'low'
  },
  {
    id: 'exp_4',
    expenseName: 'Employee Payroll',
    category: 'payroll',
    amount: 300000,
    currency: 'INR',
    frequency: 'monthly',
    startDate: '2026-06-01',
    endDate: '2027-12-31',
    status: 'active',
    forecastImpact: 'high'
  },
  {
    id: 'exp_5',
    expenseName: 'AWS Cloud Hosting',
    category: 'infrastructure',
    amount: 80000,
    currency: 'INR',
    frequency: 'monthly',
    startDate: '2026-06-10',
    endDate: '2027-12-31',
    status: 'active',
    forecastImpact: 'medium'
  },
  {
    id: 'exp_6',
    expenseName: 'Cursor AI & SaaS tools',
    category: 'ai_tools',
    amount: 40000,
    currency: 'INR',
    frequency: 'monthly',
    startDate: '2026-06-15',
    endDate: '2026-12-31',
    status: 'active',
    forecastImpact: 'low'
  },
  {
    id: 'exp_7',
    expenseName: 'Rent & Utilities',
    category: 'operations',
    amount: 30000,
    currency: 'INR',
    frequency: 'monthly',
    startDate: '2026-06-18',
    endDate: '2026-12-31',
    status: 'active',
    forecastImpact: 'medium'
  },
  {
    id: 'exp_8',
    expenseName: 'Audit & Compliance',
    category: 'other',
    amount: 20000,
    currency: 'INR',
    frequency: 'monthly',
    startDate: '2026-06-22',
    endDate: '2026-12-31',
    status: 'active',
    forecastImpact: 'low'
  },
  {
    id: 'exp_9',
    expenseName: 'Marketing & Outbound',
    category: 'other',
    amount: 30000,
    currency: 'INR',
    frequency: 'monthly',
    startDate: '2026-06-28',
    endDate: '2026-12-31',
    status: 'active',
    forecastImpact: 'high'
  }
];

const initialReceivables: Receivable[] = [
  {
    id: 'rec_1',
    client: 'Acme Corp',
    invoice: 'INV-2026-001',
    amount: 150000,
    currency: 'INR',
    dueDate: '2026-06-01',
    status: 'unpaid',
    daysOutstanding: 11,
    collectionRisk: 'low'
  },
  {
    id: 'rec_2',
    client: 'Nova Systems',
    invoice: 'INV-2026-002',
    amount: 80000,
    currency: 'INR',
    dueDate: '2026-06-08',
    status: 'unpaid',
    daysOutstanding: 4,
    collectionRisk: 'low'
  },
  {
    id: 'rec_3',
    client: 'Globex Ltd',
    invoice: 'INV-2026-003',
    amount: 250000,
    currency: 'INR',
    dueDate: '2026-06-12',
    status: 'unpaid',
    daysOutstanding: 0,
    collectionRisk: 'low'
  },
  {
    id: 'rec_4',
    client: 'Cyberdyne Corp',
    invoice: 'INV-2026-004',
    amount: 120000,
    currency: 'INR',
    dueDate: '2026-06-23',
    status: 'unpaid',
    daysOutstanding: 0,
    collectionRisk: 'low'
  }
];

const initialPayables: Payable[] = [
  {
    id: 'pay_1',
    vendor: 'Figma',
    expense: 'Figma Subscription',
    amount: 3000,
    currency: 'INR',
    dueDate: '2026-06-06',
    status: 'unpaid',
    priority: 'low'
  },
  {
    id: 'pay_2',
    vendor: 'Internet Provider',
    expense: 'Internet Bill',
    amount: 5000,
    currency: 'INR',
    dueDate: '2026-06-10',
    status: 'unpaid',
    priority: 'low'
  },
  {
    id: 'pay_3',
    vendor: 'Office Landlord',
    expense: 'Office Rent',
    amount: 60000,
    currency: 'INR',
    dueDate: '2026-06-18',
    status: 'unpaid',
    priority: 'medium'
  },
  {
    id: 'pay_4',
    vendor: 'Payroll Provider',
    expense: 'Payroll',
    amount: 380000,
    currency: 'INR',
    dueDate: '2026-06-25',
    status: 'unpaid',
    priority: 'high'
  }
];

const loadLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const DEFAULT_USER_PROFILE: UserProfile = {
  fullName: 'Dhanooj B S',
  designation: 'Administrator',
  email: 'dhanooj@moonhive.com',
  phoneNumber: '+91 98765 43210',
  profilePicture: ''
};

const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  companyName: 'Moonhive',
  companyLogo: '',
  website: 'https://moonhive.com',
  baseCurrency: 'INR',
  timeZone: 'UTC+5:30 (Kolkata)',
  companyAddress: '123 Moonhive Tech Park, Bangalore, India'
};

const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'light',
  currencyFormat: 'symbol_prefix',
  dateFormat: 'YYYY-MM-DD',
  startWeekOn: 'Monday'
};

const mapAuditLogFromDB = (db: any): AuditLog => ({
  id: db.id,
  entityType: db.entity_type,
  entityId: db.entity_id,
  actionType: db.action_type,
  changeSummary: db.change_summary,
  createdAt: db.created_at
});

// --- DATABASE MAPPING HELPERS ---

const mapEmployeeFromDB = (db: any): Employee => ({
  id: db.id,
  roleName: db.role_name,
  department: db.department,
  annualSalary: Number(db.annual_salary),
  salaryCurrency: db.salary_currency,
  totalWorkingHoursMonth: Number(db.total_working_hours_month),
  utilizationPercent: Number(db.utilization_percent),
  allocationFactor: Number(db.allocation_factor),
  overheadMultiplier: Number(db.overhead_multiplier),
  meetingsHours: Number(db.meetings_hours),
  operationsHours: Number(db.operations_hours),
  leaveHours: Number(db.leave_hours),
  internalSupportHours: Number(db.internal_support_hours),
  learningHours: Number(db.learning_hours),
  activeStatus: db.active_status
});

const mapEmployeeToDB = (emp: Partial<Employee>) => {
  const db: any = {};
  if (emp.roleName !== undefined) db.role_name = emp.roleName;
  if (emp.department !== undefined) db.department = emp.department;
  if (emp.annualSalary !== undefined) db.annual_salary = emp.annualSalary;
  if (emp.salaryCurrency !== undefined) db.salary_currency = emp.salaryCurrency;
  if (emp.totalWorkingHoursMonth !== undefined) db.total_working_hours_month = emp.totalWorkingHoursMonth;
  if (emp.utilizationPercent !== undefined) db.utilization_percent = emp.utilizationPercent;
  if (emp.allocationFactor !== undefined) db.allocation_factor = emp.allocationFactor;
  if (emp.overheadMultiplier !== undefined) db.overhead_multiplier = emp.overheadMultiplier;
  if (emp.meetingsHours !== undefined) db.meetings_hours = emp.meetingsHours;
  if (emp.operationsHours !== undefined) db.operations_hours = emp.operationsHours;
  if (emp.leaveHours !== undefined) db.leave_hours = emp.leaveHours;
  if (emp.internalSupportHours !== undefined) db.internal_support_hours = emp.internalSupportHours;
  if (emp.learningHours !== undefined) db.learning_hours = emp.learningHours;
  if (emp.activeStatus !== undefined) db.active_status = emp.activeStatus;
  return db;
};

const mapInfraFromDB = (db: any): InfrastructureService => ({
  id: db.id,
  serviceName: db.service_name,
  category: db.category,
  monthlyCost: Number(db.monthly_cost),
  costCurrency: db.cost_currency,
  allocationType: db.allocation_type as any,
  allocationPercent: Number(db.allocation_percent),
  projectDependency: db.project_dependency,
  activeStatus: db.active_status
});

const mapInfraToDB = (infra: Partial<InfrastructureService>) => {
  const db: any = {};
  if (infra.serviceName !== undefined) db.service_name = infra.serviceName;
  if (infra.category !== undefined) db.category = infra.category;
  if (infra.monthlyCost !== undefined) db.monthly_cost = infra.monthlyCost;
  if (infra.costCurrency !== undefined) db.cost_currency = infra.costCurrency;
  if (infra.allocationType !== undefined) db.allocation_type = infra.allocationType;
  if (infra.allocationPercent !== undefined) db.allocation_percent = infra.allocationPercent;
  if (infra.projectDependency !== undefined) db.project_dependency = infra.projectDependency;
  if (infra.activeStatus !== undefined) db.active_status = infra.activeStatus;
  return db;
};

const mapSaasFromDB = (db: any): SaasTool => ({
  id: db.id,
  toolName: db.tool_name,
  category: db.category,
  monthlyCost: Number(db.monthly_cost),
  costCurrency: db.cost_currency,
  seats: db.seats,
  allocationPercent: Number(db.allocation_percent),
  aiDependency: db.ai_dependency,
  activeStatus: db.active_status
});

const mapSaasToDB = (tool: Partial<SaasTool>) => {
  const db: any = {};
  if (tool.toolName !== undefined) db.tool_name = tool.toolName;
  if (tool.category !== undefined) db.category = tool.category;
  if (tool.monthlyCost !== undefined) db.monthly_cost = tool.monthlyCost;
  if (tool.costCurrency !== undefined) db.cost_currency = tool.costCurrency;
  if (tool.seats !== undefined) db.seats = tool.seats;
  if (tool.allocationPercent !== undefined) db.allocation_percent = tool.allocationPercent;
  if (tool.aiDependency !== undefined) db.ai_dependency = tool.aiDependency;
  if (tool.activeStatus !== undefined) db.active_status = tool.activeStatus;
  return db;
};

const mapOverheadFromDB = (db: any): OverheadCategory => ({
  id: db.id,
  categoryName: db.category_name,
  monthlyCost: Number(db.monthly_cost),
  costCurrency: db.cost_currency,
  allocationLogic: db.allocation_logic,
  recurring: db.recurring
});

const mapOverheadToDB = (oh: Partial<OverheadCategory>) => {
  const db: any = {};
  if (oh.categoryName !== undefined) db.category_name = oh.categoryName;
  if (oh.monthlyCost !== undefined) db.monthly_cost = oh.monthlyCost;
  if (oh.costCurrency !== undefined) db.cost_currency = oh.costCurrency;
  if (oh.allocationLogic !== undefined) db.allocation_logic = oh.allocationLogic;
  if (oh.recurring !== undefined) db.recurring = oh.recurring;
  return db;
};

const mapMarginPolicyFromDB = (db: any): MarginPolicy => ({
  policyName: db.policy_name,
  minimumSafeMargin: Number(db.minimum_safe_margin),
  targetMargin: Number(db.target_margin),
  enterpriseMargin: Number(db.enterprise_margin),
  contingencyDefault: Number(db.contingency_default),
  emergencyBuffer: Number(db.emergency_buffer),
  pricingMode: db.pricing_mode as 'conservative' | 'balanced' | 'aggressive'
});

const mapMarginPolicyToDB = (p: Partial<MarginPolicy>) => {
  const db: any = {};
  if (p.policyName !== undefined) db.policy_name = p.policyName;
  if (p.minimumSafeMargin !== undefined) db.minimum_safe_margin = p.minimumSafeMargin;
  if (p.targetMargin !== undefined) db.target_margin = p.targetMargin;
  if (p.enterpriseMargin !== undefined) db.enterprise_margin = p.enterpriseMargin;
  if (p.contingencyDefault !== undefined) db.contingency_default = p.contingencyDefault;
  if (p.emergencyBuffer !== undefined) db.emergency_buffer = p.emergencyBuffer;
  if (p.pricingMode !== undefined) db.pricing_mode = p.pricingMode;
  return db;
};

const mapBenchmarkFromDB = (db: any): RegionalBenchmark => ({
  regionName: db.region_name,
  currency: db.currency,
  minimumRate: Number(db.minimum_rate),
  averageRate: Number(db.average_rate),
  enterpriseRate: Number(db.enterprise_rate),
  competitivenessIndex: Number(db.competitiveness_index)
});

/*
const mapBenchmarkToDB = (bm: Partial<RegionalBenchmark>) => {
  const db: any = {};
  if (bm.regionName !== undefined) db.region_name = bm.regionName;
  if (bm.currency !== undefined) db.currency = bm.currency;
  if (bm.minimumRate !== undefined) db.minimum_rate = bm.minimumRate;
  if (bm.averageRate !== undefined) db.average_rate = bm.averageRate;
  if (bm.enterpriseRate !== undefined) db.enterprise_rate = bm.enterpriseRate;
  if (bm.competitivenessIndex !== undefined) db.competitiveness_index = bm.competitivenessIndex;
  return db;
};
*/

const mapArchivedEstimateFromDB = (db: any): ArchivedEstimate => ({
  id: db.id,
  projectName: db.project_name,
  clientName: db.client_name,
  clientRegion: db.client_region,
  contractType: db.contract_type,
  estimatedHours: Number(db.estimated_hours),
  recommendedQuote: Number(db.recommended_quote),
  targetMargin: Number(db.target_margin),
  marginHealth: Number(db.target_margin) < 25 ? 'Underquoted' : (Number(db.target_margin) < 35 ? 'Flagged' : 'Passed'),
  confidenceScore: Number(db.profitability_score || db.risk_score || 85),
  timestamp: new Date(db.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  deliveryTimelineDays: Number(db.delivery_timeline_days),
  contingencyPercent: Number(db.contingency_percent),
  discountRate: 8
});

const mapRecurringRevenueFromDB = (db: any): RecurringRevenue => ({
  id: db.id,
  clientName: db.client_name,
  revenueType: db.revenue_type as any,
  amount: Number(db.amount),
  currency: db.currency,
  frequency: db.frequency as any,
  startDate: db.start_date,
  endDate: db.end_date,
  status: db.status as any,
  notes: db.notes || ''
});

const mapRecurringRevenueToDB = (rev: Partial<RecurringRevenue>) => {
  const db: any = {};
  if (rev.clientName !== undefined) db.client_name = rev.clientName;
  if (rev.revenueType !== undefined) db.revenue_type = rev.revenueType;
  if (rev.amount !== undefined) db.amount = rev.amount;
  if (rev.currency !== undefined) db.currency = rev.currency;
  if (rev.frequency !== undefined) db.frequency = rev.frequency;
  if (rev.startDate !== undefined) db.start_date = rev.startDate;
  if (rev.endDate !== undefined) db.end_date = rev.endDate;
  if (rev.status !== undefined) db.status = rev.status;
  if (rev.notes !== undefined) db.notes = rev.notes;
  return db;
};

const mapRecurringExpenseFromDB = (db: any): RecurringExpense => ({
  id: db.id,
  expenseName: db.expense_name,
  category: db.category as any,
  amount: Number(db.amount),
  currency: db.currency,
  frequency: db.frequency as any,
  startDate: db.start_date,
  endDate: db.end_date,
  status: db.status as any,
  forecastImpact: db.forecast_impact as any
});

const mapRecurringExpenseToDB = (exp: Partial<RecurringExpense>) => {
  const db: any = {};
  if (exp.expenseName !== undefined) db.expense_name = exp.expenseName;
  if (exp.category !== undefined) db.category = exp.category;
  if (exp.amount !== undefined) db.amount = exp.amount;
  if (exp.currency !== undefined) db.currency = exp.currency;
  if (exp.frequency !== undefined) db.frequency = exp.frequency;
  if (exp.startDate !== undefined) db.start_date = exp.startDate;
  if (exp.endDate !== undefined) db.end_date = exp.endDate;
  if (exp.status !== undefined) db.status = exp.status;
  if (exp.forecastImpact !== undefined) db.forecast_impact = exp.forecastImpact;
  return db;
};

const mapReceivableFromDB = (db: any): Receivable => {
  const due = new Date(db.due_date);
  const diffTime = Math.max(0, new Date().getTime() - due.getTime());
  const daysOutstanding = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const collectionRisk = daysOutstanding > 30 ? 'high' : (daysOutstanding > 15 ? 'medium' : 'low');

  return {
    id: db.id,
    client: db.client,
    invoice: db.invoice,
    amount: Number(db.amount),
    currency: db.currency,
    dueDate: db.due_date,
    status: db.status as any,
    daysOutstanding,
    collectionRisk
  };
};

const mapReceivableToDB = (rec: Partial<Receivable>) => {
  const db: any = {};
  if (rec.client !== undefined) db.client = rec.client;
  if (rec.invoice !== undefined) db.invoice = rec.invoice;
  if (rec.amount !== undefined) db.amount = rec.amount;
  if (rec.currency !== undefined) db.currency = rec.currency;
  if (rec.dueDate !== undefined) db.due_date = rec.dueDate;
  if (rec.status !== undefined) db.status = rec.status;
  return db;
};

const mapPayableFromDB = (db: any): Payable => {
  const due = new Date(db.due_date);
  const diffTime = due.getTime() - new Date().getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const priority = daysLeft < 3 ? 'high' : (daysLeft < 7 ? 'medium' : 'low');

  return {
    id: db.id,
    vendor: db.vendor,
    expense: db.expense,
    amount: Number(db.amount),
    currency: db.currency,
    dueDate: db.due_date,
    status: db.status as any,
    priority
  };
};

const mapPayableToDB = (p: Partial<Payable>) => {
  const db: any = {};
  if (p.vendor !== undefined) db.vendor = p.vendor;
  if (p.expense !== undefined) db.expense = p.expense;
  if (p.amount !== undefined) db.amount = p.amount;
  if (p.currency !== undefined) db.currency = p.currency;
  if (p.dueDate !== undefined) db.due_date = p.dueDate;
  if (p.status !== undefined) db.status = p.status;
  return db;
};

export const usePricingStore = create<PricingStore>((set, get) => ({
  dbLoading: false,

  fetchInitialData: async () => {
    if (!isSupabaseConfigured()) return;
    set({ dbLoading: true });
    try {
      // 1. Fetch Currency Exchange Rates
      const { data: rates } = await supabase.from('currency_exchange_rates').select('*');
      let exchangeRates = DEFAULT_EXCHANGE_RATES;
      if (rates && rates.length > 0) {
        exchangeRates = {};
        rates.forEach((r: any) => {
          if (!exchangeRates[r.from_currency]) {
            exchangeRates[r.from_currency] = {};
          }
          exchangeRates[r.from_currency][r.to_currency] = Number(r.rate);
        });
      }

      // 2. Fetch Employees
      const { data: employeesData } = await supabase.from('employees').select('*');
      const employees = employeesData ? employeesData.map(mapEmployeeFromDB) : initialEmployees;

      // 3. Fetch Infrastructure Services
      const { data: infraData } = await supabase.from('infrastructure_services').select('*');
      const infraServices = infraData ? infraData.map(mapInfraFromDB) : initialInfraServices;

      // 4. Fetch SaaS Tools
      const { data: saasData } = await supabase.from('saas_tools').select('*');
      const saasTools = saasData ? saasData.map(mapSaasFromDB) : initialSaasTools;

      // 5. Fetch Overhead Categories
      const { data: overheadsData } = await supabase.from('overhead_categories').select('*');
      const overheads = overheadsData ? overheadsData.map(mapOverheadFromDB) : initialOverheads;

      // 6. Fetch Margin Policy
      const { data: policyData } = await supabase.from('pricing_policies').select('*').eq('active_status', true);
      let marginPolicy = get().marginPolicy;
      if (policyData && policyData.length > 0) {
        marginPolicy = mapMarginPolicyFromDB(policyData[0]);
      }

      // 7. Fetch Benchmarks
      const { data: benchmarksData } = await supabase.from('regional_benchmarks').select('*');
      const benchmarks = benchmarksData ? benchmarksData.map(mapBenchmarkFromDB) : initialBenchmarks;

      // 8. Fetch Saved Estimates
      const { data: estimatesData } = await supabase.from('project_estimates').select('*').eq('status', 'saved');
      const savedEstimates = estimatesData ? estimatesData.map(mapArchivedEstimateFromDB) : initialSavedEstimates;

      // 9. Fetch Financial Hub records
      const { data: recurringRevenuesData } = await supabase.from('recurring_revenues').select('*');
      const recurringRevenues = recurringRevenuesData ? recurringRevenuesData.map(mapRecurringRevenueFromDB) : initialRecurringRevenues;

      const { data: recurringExpensesData } = await supabase.from('recurring_expenses').select('*');
      const recurringExpenses = recurringExpensesData ? recurringExpensesData.map(mapRecurringExpenseFromDB) : initialRecurringExpenses;

      const { data: receivablesData } = await supabase.from('receivables').select('*');
      const receivables = receivablesData ? receivablesData.map(mapReceivableFromDB) : initialReceivables;

      const { data: payablesData } = await supabase.from('payables').select('*');
      const payables = payablesData ? payablesData.map(mapPayableFromDB) : initialPayables;

      const { data: logsData } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
      const auditLogs = logsData ? logsData.map(mapAuditLogFromDB) : [];

      set({
        exchangeRates,
        employees,
        infraServices,
        saasTools,
        overheads,
        marginPolicy,
        benchmarks,
        savedEstimates,
        recurringRevenues,
        recurringExpenses,
        receivables,
        payables,
        auditLogs,
        dbLoading: false
      });
      get().recompute();
    } catch (e) {
      console.error('Error fetching initial data from Supabase:', e);
      set({ dbLoading: false });
    }
  },

  userProfile: loadLocalStorage('salezy-user-profile', DEFAULT_USER_PROFILE),
  companyProfile: loadLocalStorage('salezy-company-profile', DEFAULT_COMPANY_PROFILE),
  userPreferences: loadLocalStorage('salezy-user-preferences', DEFAULT_USER_PREFERENCES),
  baseCurrency: loadLocalStorage('salezy-company-profile', DEFAULT_COMPANY_PROFILE).baseCurrency,
  exchangeRates: DEFAULT_EXCHANGE_RATES,
  employees: initialEmployees,
  infraServices: initialInfraServices,
  saasTools: initialSaasTools,
  overheads: initialOverheads,
  marginPolicy: {
    policyName: 'Standard Growth Policy',
    minimumSafeMargin: 25,
    targetMargin: 35,
    enterpriseMargin: 45,
    contingencyDefault: 12,
    emergencyBuffer: 5,
    pricingMode: 'balanced'
  },
  benchmarks: initialBenchmarks,

  // Default simulated project estimate
  projectEstimate: {
    projectName: 'Enterprise AI Agent Platform',
    clientName: 'Nexus Global Corp',
    clientRegion: 'US',
    contractType: 'fixed_cost',
    estimatedHours: 320,
    deliveryTimelineDays: 60,
    targetMargin: 35,
    contingencyPercent: 15,
    discountRate: 8,
    simAiToolsCost: 12000,
    simSaasToolsCost: 15000,
    simInfraCost: 25000,
    simOtherCosts: 10000
  },

  // Initially allocate a Senior Developer and AI Engineer to our simulated project
  allocatedResources: [
    { id: 'ar1', employeeId: 'e1', allocatedHours: 160, quantity: 1 },
    { id: 'ar2', employeeId: 'e4', allocatedHours: 160, quantity: 1 }
  ],

  // 30/40/30 Standard Milestone Structure
  milestones: [
    { id: 'm1', name: 'Kickoff (30% Upfront)', percentage: 30, paymentDelayDays: 15 },
    { id: 'm2', name: 'Beta Delivery (40%)', percentage: 40, paymentDelayDays: 45 },
    { id: 'm3', name: 'Final Handover (30%)', percentage: 30, paymentDelayDays: 75 }
  ],

  // Saved Estimate Library State
  savedEstimates: initialSavedEstimates,

  // Financial Hub State
  recurringRevenues: initialRecurringRevenues,
  recurringExpenses: initialRecurringExpenses,
  receivables: initialReceivables,
  payables: initialPayables,
  auditLogs: [],

  metrics: {
    totalWorkforceCostMonth: 0,
    totalInfraCostMonth: 0,
    totalSaaSCostMonth: 0,
    totalOverheadCostMonth: 0,
    monthlyOrganizationalBurn: 0,
    totalProductiveHoursMonth: 0,
    effectiveHourlyBurn: 0,

    // Financial Hub Aggregates
    totalRecurringRevenueMonth: 0,
    totalRecurringExpenseMonth: 0,
    totalOutstandingReceivables: 0,
    totalOutstandingPayables: 0,

    simWorkforceCost: 0,
    simInfraCost: 0,
    simSaaSCost: 0,
    simOverheadCost: 0,
    simOperationalCost: 0,
    simContingencyCost: 0,
    simRecommendedQuote: 0,
    simEffectiveBillingRate: 0,
    simNPV: 0,
    simMarginHealthScore: 0,
    simStabilityScore: 0,
    simCashRecoveryScore: 0,
    simBenchmarkScore: 0,
    simConfidenceScore: 0
  },

  setBaseCurrency: (currency) => {
    set((state) => {
      const nextProfile = { ...state.companyProfile, baseCurrency: currency };
      localStorage.setItem('salezy-company-profile', JSON.stringify(nextProfile));
      return { baseCurrency: currency, companyProfile: nextProfile };
    });
    get().recompute();
  },

  updateExchangeRate: (from, to, rate) => {
    set((state) => {
      const nextRates = { ...state.exchangeRates };
      if (!nextRates[from]) nextRates[from] = {};
      nextRates[from][to] = rate;
      // Also update inverse for mathematical consistency
      if (!nextRates[to]) nextRates[to] = {};
      nextRates[to][from] = 1 / rate;
      return { exchangeRates: nextRates };
    });
    get().recompute();
  },

  addAuditLog: async (log) => {
    const newLog: AuditLog = {
      ...log,
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    if (isSupabaseConfigured()) {
      try {
        const dbLog = {
          entity_type: log.entityType,
          entity_id: log.entityId,
          action_type: log.actionType,
          change_summary: log.changeSummary
        };
        const { data, error } = await supabase.from('audit_logs').insert(dbLog).select('id, created_at').single();
        if (!error && data) {
          newLog.id = data.id;
          newLog.createdAt = data.created_at;
        } else if (error) {
          console.error('Error creating audit log in Supabase:', error);
        }
      } catch (err) {
        console.error('Error in addAuditLog:', err);
      }
    }
    set((state) => ({
      auditLogs: [newLog, ...state.auditLogs].slice(0, 100)
    }));
  },

  addEmployee: async (employee) => {
    let id = 'emp_' + Math.random().toString(36).substr(2, 9);
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('employees').insert(mapEmployeeToDB(employee)).select('id').single();
      if (!error && data) {
        id = data.id;
      } else {
        console.error('Error inserting employee in Supabase:', error);
      }
    }
    set((state) => ({ employees: [...state.employees, { ...employee, id }] }));
    get().recompute();
    get().addAuditLog({
      entityType: 'Employee',
      entityId: id,
      actionType: 'create',
      changeSummary: `Created employee role '${employee.roleName}' in ${employee.department}`
    });
  },

  updateEmployee: async (id, updates) => {
    set((state) => ({
      employees: state.employees.map((emp) => (emp.id === id ? { ...emp, ...updates } : emp))
    }));
    get().recompute();
    get().addAuditLog({
      entityType: 'Employee',
      entityId: id,
      actionType: 'update',
      changeSummary: `Updated employee role '${updates.roleName || 'Unnamed'}' settings`
    });

    if (isSupabaseConfigured()) {
      await supabase.from('employees').update(mapEmployeeToDB(updates)).eq('id', id);
    }
  },

  deleteEmployee: async (id) => {
    set((state) => ({
      employees: state.employees.filter((emp) => emp.id !== id),
      allocatedResources: state.allocatedResources.filter((ar) => ar.employeeId !== id)
    }));
    get().recompute();
    get().addAuditLog({
      entityType: 'Employee',
      entityId: id,
      actionType: 'delete',
      changeSummary: `Deleted employee role`
    });

    if (isSupabaseConfigured()) {
      await supabase.from('employees').delete().eq('id', id);
    }
  },

  addInfraService: async (service) => {
    let id = 'infra_' + Math.random().toString(36).substr(2, 9);
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('infrastructure_services').insert(mapInfraToDB(service)).select('id').single();
      if (!error && data) id = data.id;
    }
    set((state) => ({ infraServices: [...state.infraServices, { ...service, id }] }));
    get().recompute();
    get().addAuditLog({
      entityType: 'InfrastructureService',
      entityId: id,
      actionType: 'create',
      changeSummary: `Added infrastructure service '${service.serviceName}'`
    });
  },

  updateInfraService: async (id, updates) => {
    set((state) => ({
      infraServices: state.infraServices.map((is) => (is.id === id ? { ...is, ...updates } : is))
    }));
    get().recompute();
    get().addAuditLog({
      entityType: 'InfrastructureService',
      entityId: id,
      actionType: 'update',
      changeSummary: `Updated infrastructure service '${updates.serviceName || 'Unnamed'}'`
    });
    if (isSupabaseConfigured()) {
      await supabase.from('infrastructure_services').update(mapInfraToDB(updates)).eq('id', id);
    }
  },

  deleteInfraService: async (id) => {
    set((state) => ({
      infraServices: state.infraServices.filter((is) => is.id !== id)
    }));
    get().recompute();
    get().addAuditLog({
      entityType: 'InfrastructureService',
      entityId: id,
      actionType: 'delete',
      changeSummary: `Deleted infrastructure service`
    });
    if (isSupabaseConfigured()) {
      await supabase.from('infrastructure_services').delete().eq('id', id);
    }
  },

  addSaasTool: async (tool) => {
    let id = 'saas_' + Math.random().toString(36).substr(2, 9);
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('saas_tools').insert(mapSaasToDB(tool)).select('id').single();
      if (!error && data) id = data.id;
    }
    set((state) => ({ saasTools: [...state.saasTools, { ...tool, id }] }));
    get().recompute();
    get().addAuditLog({
      entityType: 'SaaSTool',
      entityId: id,
      actionType: 'create',
      changeSummary: `Added SaaS tool '${tool.toolName}'`
    });
  },

  updateSaasTool: async (id, updates) => {
    set((state) => ({
      saasTools: state.saasTools.map((st) => (st.id === id ? { ...st, ...updates } : st))
    }));
    get().recompute();
    get().addAuditLog({
      entityType: 'SaaSTool',
      entityId: id,
      actionType: 'update',
      changeSummary: `Updated SaaS tool '${updates.toolName || 'Unnamed'}'`
    });
    if (isSupabaseConfigured()) {
      await supabase.from('saas_tools').update(mapSaasToDB(updates)).eq('id', id);
    }
  },

  deleteSaasTool: async (id) => {
    set((state) => ({
      saasTools: state.saasTools.filter((st) => st.id !== id)
    }));
    get().recompute();
    get().addAuditLog({
      entityType: 'SaaSTool',
      entityId: id,
      actionType: 'delete',
      changeSummary: `Deleted SaaS tool`
    });
    if (isSupabaseConfigured()) {
      await supabase.from('saas_tools').delete().eq('id', id);
    }
  },

  addOverhead: async (overhead) => {
    let id = 'ovr_' + Math.random().toString(36).substr(2, 9);
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('overhead_categories').insert(mapOverheadToDB(overhead)).select('id').single();
      if (!error && data) id = data.id;
    }
    set((state) => ({ overheads: [...state.overheads, { ...overhead, id }] }));
    get().recompute();
    get().addAuditLog({
      entityType: 'OverheadCategory',
      entityId: id,
      actionType: 'create',
      changeSummary: `Added overhead category '${overhead.categoryName}'`
    });
  },

  updateOverhead: async (id, updates) => {
    set((state) => ({
      overheads: state.overheads.map((o) => (o.id === id ? { ...o, ...updates } : o))
    }));
    get().recompute();
    get().addAuditLog({
      entityType: 'OverheadCategory',
      entityId: id,
      actionType: 'update',
      changeSummary: `Updated overhead category '${updates.categoryName || 'Unnamed'}'`
    });
    if (isSupabaseConfigured()) {
      await supabase.from('overhead_categories').update(mapOverheadToDB(updates)).eq('id', id);
    }
  },

  deleteOverhead: async (id) => {
    set((state) => ({
      overheads: state.overheads.filter((o) => o.id !== id)
    }));
    get().recompute();
    get().addAuditLog({
      entityType: 'OverheadCategory',
      entityId: id,
      actionType: 'delete',
      changeSummary: `Deleted overhead category`
    });
    if (isSupabaseConfigured()) {
      await supabase.from('overhead_categories').delete().eq('id', id);
    }
  },

  updateMarginPolicy: async (updates) => {
    set((state) => ({
      marginPolicy: { ...state.marginPolicy, ...updates }
    }));
    get().recompute();
    get().addAuditLog({
      entityType: 'MarginPolicy',
      entityId: 'policy',
      actionType: 'update',
      changeSummary: `Updated margin policy configuration settings`
    });
    if (isSupabaseConfigured()) {
      const activePolicy = get().marginPolicy;
      const { data } = await supabase.from('pricing_policies').select('id').eq('active_status', true);
      if (data && data.length > 0) {
        await supabase.from('pricing_policies').update(mapMarginPolicyToDB(updates)).eq('id', data[0].id);
      } else {
        await supabase.from('pricing_policies').insert({ ...mapMarginPolicyToDB(activePolicy), active_status: true });
      }
    }
  },

  updateProjectEstimate: (updates) => {
    set((state) => ({ projectEstimate: { ...state.projectEstimate, ...updates } }));
    get().recompute();
  },

  addAllocatedResource: (resource) => {
    const id = 'alloc_' + Math.random().toString(36).substr(2, 9);
    set((state) => ({ allocatedResources: [...state.allocatedResources, { ...resource, id }] }));
    get().recompute();
  },

  updateAllocatedResource: (id, updates) => {
    set((state) => ({
      allocatedResources: state.allocatedResources.map((ar) => (ar.id === id ? { ...ar, ...updates } : ar))
    }));
    get().recompute();
  },

  deleteAllocatedResource: (id) => {
    set((state) => ({ allocatedResources: state.allocatedResources.filter((ar) => ar.id !== id) }));
    get().recompute();
  },

  addMilestone: (milestone) => {
    const id = 'ms_' + Math.random().toString(36).substr(2, 9);
    set((state) => ({ milestones: [...state.milestones, { ...milestone, id }] }));
    get().recompute();
  },

  updateMilestone: (id, updates) => {
    set((state) => ({
      milestones: state.milestones.map((ms) => (ms.id === id ? { ...ms, ...updates } : ms))
    }));
    get().recompute();
  },

  deleteMilestone: (id) => {
    set((state) => ({ milestones: state.milestones.filter((ms) => ms.id !== id) }));
    get().recompute();
  },

  setMilestonesPreset: (presetName) => {
    let preset: Milestone[];
    if (presetName === 'upfront') {
      preset = [{ id: 'ms_p1', name: '100% Upfront Delivery', percentage: 100, paymentDelayDays: 15 }];
    } else if (presetName === 'halves') {
      preset = [
        { id: 'ms_p1', name: '50% Upfront Kickoff', percentage: 50, paymentDelayDays: 15 },
        { id: 'ms_p2', name: '50% Delivery Signoff', percentage: 50, paymentDelayDays: 60 }
      ];
    } else {
      // default 30/40/30
      preset = [
        { id: 'ms_p1', name: '30% Upfront', percentage: 30, paymentDelayDays: 15 },
        { id: 'ms_p2', name: '40% Mid Delivery', percentage: 40, paymentDelayDays: 45 },
        { id: 'ms_p3', name: '30% Final Delivery', percentage: 30, paymentDelayDays: 75 }
      ];
    }
    set({ milestones: preset });
    get().recompute();
  },

  saveActiveEstimate: async (projectName: string, clientName: string) => {
    const { projectEstimate, metrics, marginPolicy, allocatedResources, milestones } = get();
    
    // Map margin health
    let marginHealth: 'Passed' | 'Underquoted' | 'Flagged' = 'Passed';
    const target = projectEstimate.targetMargin;
    const minSafe = marginPolicy.minimumSafeMargin;
    if (target < minSafe) {
      marginHealth = 'Underquoted';
    } else if (target < marginPolicy.targetMargin) {
      marginHealth = 'Flagged';
    }

    let id = 'arch_' + Math.random().toString(36).substr(2, 9);
    
    if (isSupabaseConfigured()) {
      const dbEstimate = {
        project_name: projectName || projectEstimate.projectName,
        client_name: clientName || projectEstimate.clientName,
        client_region: projectEstimate.clientRegion,
        project_type: projectEstimate.contractType,
        estimated_hours: projectEstimate.estimatedHours,
        delivery_timeline_days: projectEstimate.deliveryTimelineDays,
        contract_type: projectEstimate.contractType,
        target_margin: projectEstimate.targetMargin,
        contingency_percent: projectEstimate.contingencyPercent,
        recommended_quote: metrics.simRecommendedQuote,
        billing_rate: metrics.simEffectiveBillingRate,
        risk_score: metrics.simConfidenceScore,
        profitability_score: metrics.simConfidenceScore,
        status: 'saved'
      };

      const { data, error } = await supabase.from('project_estimates').insert(dbEstimate).select('id').single();
      if (!error && data) {
        id = data.id;

        // Save resources
        if (allocatedResources.length > 0) {
          const dbResources = allocatedResources.map(r => ({
            project_id: id,
            employee_id: r.employeeId,
            quantity: r.quantity,
            allocated_hours: r.allocatedHours,
            utilization_factor: 1.0,
            calculated_cost: 0
          }));
          await supabase.from('project_resources').insert(dbResources);
        }

        // Save milestones
        if (milestones.length > 0) {
          const dbMilestones = milestones.map(m => ({
            project_id: id,
            milestone_name: m.name,
            percentage: m.percentage,
            payment_delay_days: m.paymentDelayDays,
            expected_cash_flow: metrics.simRecommendedQuote * (m.percentage / 100)
          }));
          await supabase.from('milestone_structures').insert(dbMilestones);
        }
      } else {
        console.error('Error saving estimate to Supabase:', error);
      }
    }

    const newArchived: ArchivedEstimate = {
      id,
      projectName: projectName || projectEstimate.projectName,
      clientName: clientName || projectEstimate.clientName,
      clientRegion: projectEstimate.clientRegion,
      contractType: projectEstimate.contractType,
      estimatedHours: projectEstimate.estimatedHours,
      recommendedQuote: metrics.simRecommendedQuote,
      targetMargin: projectEstimate.targetMargin,
      marginHealth,
      confidenceScore: metrics.simConfidenceScore,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      deliveryTimelineDays: projectEstimate.deliveryTimelineDays,
      contingencyPercent: projectEstimate.contingencyPercent,
      discountRate: projectEstimate.discountRate
    };

    set((state) => ({
      savedEstimates: [newArchived, ...state.savedEstimates]
    }));
  },

  deleteArchivedEstimate: async (id: string) => {
    set((state) => ({
      savedEstimates: state.savedEstimates.filter((est) => est.id !== id)
    }));

    if (isSupabaseConfigured()) {
      await supabase.from('project_estimates').delete().eq('id', id);
    }
  },

  loadArchivedEstimate: async (id: string) => {
    const archived = get().savedEstimates.find((est) => est.id === id);
    if (archived) {
      let allocatedResources = get().allocatedResources;
      let milestones = get().milestones;

      if (isSupabaseConfigured()) {
        const { data: resourcesData } = await supabase.from('project_resources').select('*').eq('project_id', id);
        if (resourcesData) {
          allocatedResources = resourcesData.map((r: any) => ({
            id: r.id,
            employeeId: r.employee_id,
            allocatedHours: Number(r.allocated_hours),
            quantity: Number(r.quantity)
          }));
        }

        const { data: milestonesData } = await supabase.from('milestone_structures').select('*').eq('project_id', id);
        if (milestonesData) {
          milestones = milestonesData.map((m: any) => ({
            id: m.id,
            name: m.milestone_name,
            percentage: Number(m.percentage),
            paymentDelayDays: Number(m.payment_delay_days)
          }));
        }
      }

      set((state) => ({
        projectEstimate: {
          ...state.projectEstimate,
          projectName: archived.projectName,
          clientName: archived.clientName,
          clientRegion: archived.clientRegion,
          contractType: archived.contractType,
          estimatedHours: archived.estimatedHours,
          deliveryTimelineDays: archived.deliveryTimelineDays,
          targetMargin: archived.targetMargin,
          contingencyPercent: archived.contingencyPercent,
          discountRate: archived.discountRate
        },
        allocatedResources,
        milestones
      }));
      get().recompute();
    }
  },

  addRecurringRevenue: async (revenue) => {
    let id = 'rev_' + Math.random().toString(36).substr(2, 9);
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('recurring_revenues').insert(mapRecurringRevenueToDB(revenue)).select('id').single();
      if (!error && data) id = data.id;
    }
    set((state) => ({ recurringRevenues: [...state.recurringRevenues, { ...revenue, id }] }));
    get().recompute();
  },

  updateRecurringRevenue: async (id, updates) => {
    set((state) => ({
      recurringRevenues: state.recurringRevenues.map((rev) => (rev.id === id ? { ...rev, ...updates } : rev))
    }));
    get().recompute();
    if (isSupabaseConfigured()) {
      await supabase.from('recurring_revenues').update(mapRecurringRevenueToDB(updates)).eq('id', id);
    }
  },

  deleteRecurringRevenue: async (id) => {
    set((state) => ({
      recurringRevenues: state.recurringRevenues.filter((rev) => rev.id !== id)
    }));
    get().recompute();
    if (isSupabaseConfigured()) {
      await supabase.from('recurring_revenues').delete().eq('id', id);
    }
  },

  addRecurringExpense: async (expense) => {
    let id = 'exp_' + Math.random().toString(36).substr(2, 9);
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('recurring_expenses').insert(mapRecurringExpenseToDB(expense)).select('id').single();
      if (!error && data) id = data.id;
    }
    set((state) => ({ recurringExpenses: [...state.recurringExpenses, { ...expense, id }] }));
    get().recompute();
  },

  updateRecurringExpense: async (id, updates) => {
    set((state) => ({
      recurringExpenses: state.recurringExpenses.map((exp) => (exp.id === id ? { ...exp, ...updates } : exp))
    }));
    get().recompute();
    if (isSupabaseConfigured()) {
      await supabase.from('recurring_expenses').update(mapRecurringExpenseToDB(updates)).eq('id', id);
    }
  },

  deleteRecurringExpense: async (id) => {
    set((state) => ({
      recurringExpenses: state.recurringExpenses.filter((exp) => exp.id !== id)
    }));
    get().recompute();
    if (isSupabaseConfigured()) {
      await supabase.from('recurring_expenses').delete().eq('id', id);
    }
  },

  addReceivable: async (receivable) => {
    let id = 'rec_' + Math.random().toString(36).substr(2, 9);
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('receivables').insert(mapReceivableToDB(receivable)).select('id').single();
      if (!error && data) id = data.id;
    }
    set((state) => ({ receivables: [...state.receivables, { ...receivable, id }] }));
    get().recompute();
  },

  updateReceivable: async (id, updates) => {
    set((state) => ({
      receivables: state.receivables.map((rec) => (rec.id === id ? { ...rec, ...updates } : rec))
    }));
    get().recompute();
    if (isSupabaseConfigured()) {
      await supabase.from('receivables').update(mapReceivableToDB(updates)).eq('id', id);
    }
  },

  deleteReceivable: async (id) => {
    set((state) => ({
      receivables: state.receivables.filter((rec) => rec.id !== id)
    }));
    get().recompute();
    if (isSupabaseConfigured()) {
      await supabase.from('receivables').delete().eq('id', id);
    }
  },

  addPayable: async (payable) => {
    let id = 'pay_' + Math.random().toString(36).substr(2, 9);
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('payables').insert(mapPayableToDB(payable)).select('id').single();
      if (!error && data) id = data.id;
    }
    set((state) => ({ payables: [...state.payables, { ...payable, id }] }));
    get().recompute();
  },

  updatePayable: async (id, updates) => {
    set((state) => ({
      payables: state.payables.map((pay) => (pay.id === id ? { ...pay, ...updates } : pay))
    }));
    get().recompute();
    if (isSupabaseConfigured()) {
      await supabase.from('payables').update(mapPayableToDB(updates)).eq('id', id);
    }
  },

  deletePayable: async (id) => {
    set((state) => ({
      payables: state.payables.filter((pay) => pay.id !== id)
    }));
    get().recompute();
    if (isSupabaseConfigured()) {
      await supabase.from('payables').delete().eq('id', id);
    }
  },

  /**
   * Main Reactive Dependency-Based Recalculation Engine
   */
  recompute: () => {
    const {
      baseCurrency,
      exchangeRates,
      employees,
      infraServices,
      saasTools,
      overheads,
      marginPolicy,
      projectEstimate,
      allocatedResources,
      milestones,
      benchmarks,
      recurringRevenues,
      recurringExpenses,
      receivables,
      payables
    } = get();

    // 1. Workforce monthly cost sum (converted to base currency)
    let totalWorkforceCostMonth = 0;
    let totalProductiveHoursMonth = 0;

    const resolvedEmployees = employees.map((emp) => {
      const monthlySalaryInBase = convertCurrency(
        emp.annualSalary / 12,
        emp.salaryCurrency,
        baseCurrency,
        exchangeRates
      );

      const productiveHours = calculateProductiveHours(
        emp.totalWorkingHoursMonth,
        emp.meetingsHours,
        emp.operationsHours,
        emp.leaveHours,
        emp.internalSupportHours,
        emp.learningHours
      );

      if (emp.activeStatus) {
        totalProductiveHoursMonth += productiveHours;
        totalWorkforceCostMonth += monthlySalaryInBase;
      }

      return {
        ...emp,
        monthlySalaryInBase,
        productiveHours
      };
    });

    // 2. Infrastructure monthly costs (converted to base currency)
    let totalInfraCostMonth = 0;
    let simInfraCost = 0;
    infraServices.forEach((infra) => {
      if (!infra.activeStatus) return;
      const costInBase = convertCurrency(infra.monthlyCost, infra.costCurrency, baseCurrency, exchangeRates);
      
      // Pro-rate allocation_percent
      const allocatedCost = costInBase * (infra.allocationPercent / 100);
      totalInfraCostMonth += allocatedCost;

      if (infra.projectDependency) {
        // Project specific cost allocated directly to the active simulation project
        simInfraCost += costInBase;
      }
    });

    // 3. SaaS Tooling monthly costs (converted to base currency)
    let totalSaaSCostMonth = 0;
    let simSaaSCost = 0;
    saasTools.forEach((tool) => {
      if (!tool.activeStatus) return;
      const singleCostInBase = convertCurrency(tool.monthlyCost, tool.costCurrency, baseCurrency, exchangeRates);
      const totalToolCost = singleCostInBase * tool.seats * (tool.allocationPercent / 100);
      totalSaaSCostMonth += totalToolCost;

      if (tool.aiDependency) {
        // AI tools specifically mapped as a baseline factor for simulated estimation
        simSaaSCost += totalToolCost;
      }
    });

    // 4. Overheads categories sum (converted to base currency)
    let totalOverheadCostMonth = 0;
    overheads.forEach((ovr) => {
      if (!ovr.recurring) return;
      const costInBase = convertCurrency(ovr.monthlyCost, ovr.costCurrency, baseCurrency, exchangeRates);
      totalOverheadCostMonth += costInBase;
    });

    // 5. Total Monthly Organizational Burn
    const monthlyOrganizationalBurn =
      totalWorkforceCostMonth + totalInfraCostMonth + totalSaaSCostMonth + totalOverheadCostMonth;

    // 6. Effective Hourly Burn for the organization
    const effectiveHourlyBurn =
      totalProductiveHoursMonth > 0 ? monthlyOrganizationalBurn / totalProductiveHoursMonth : 0;

    // 6b. Financial Hub Aggregates calculation
    let totalRecurringRevenueMonth = 0;
    recurringRevenues.forEach(rev => {
      if (rev.status !== 'active') return;
      const amountInBase = convertCurrency(rev.amount, rev.currency || 'INR', baseCurrency, exchangeRates);
      let monthlyAmount = amountInBase;
      if (rev.frequency === 'yearly') {
        monthlyAmount = amountInBase / 12;
      } else if (rev.frequency === 'quarterly') {
        monthlyAmount = amountInBase / 3;
      }
      totalRecurringRevenueMonth += monthlyAmount;
    });

    let totalRecurringExpenseMonth = 0;
    recurringExpenses.forEach(exp => {
      if (exp.status !== 'active') return;
      const amountInBase = convertCurrency(exp.amount, exp.currency || 'INR', baseCurrency, exchangeRates);
      let monthlyAmount = amountInBase;
      if (exp.frequency === 'yearly') {
        monthlyAmount = amountInBase / 12;
      } else if (exp.frequency === 'quarterly') {
        monthlyAmount = amountInBase / 3;
      }
      totalRecurringExpenseMonth += monthlyAmount;
    });

    let totalOutstandingReceivables = 0;
    receivables.forEach(rec => {
      if (rec.status === 'unpaid' || rec.status === 'overdue') {
        const amountInBase = convertCurrency(rec.amount, rec.currency || 'INR', baseCurrency, exchangeRates);
        totalOutstandingReceivables += amountInBase;
      }
    });

    let totalOutstandingPayables = 0;
    payables.forEach(pay => {
      if (pay.status === 'unpaid' || pay.status === 'overdue') {
        const amountInBase = convertCurrency(pay.amount, pay.currency || 'INR', baseCurrency, exchangeRates);
        totalOutstandingPayables += amountInBase;
      }
    });

    // ----------------------------------------------------
    // PROJECT SIMULATOR CALCULATIONS
    // ----------------------------------------------------

    // a) Workforce Cost for project
    let simWorkforceCost = 0;
    allocatedResources.forEach((resource) => {
      const emp = resolvedEmployees.find((e) => e.id === resource.employeeId);
      if (!emp) return;

      // Effective hourly rate of this specific employee
      // Cost Allocation = Pro-rated portion of operational infrastructure + SaaS + overheads divided equally or by capacity
      // For simple mathematical safety: Cost Allocation per employee = (Total operational overheads / active capacity) * employee productive hours
      const activeCapacity = Math.max(1, totalProductiveHoursMonth);
      const overheadSharePerHour = (totalInfraCostMonth + totalSaaSCostMonth + totalOverheadCostMonth) / activeCapacity;
      
      const employeeCostAllocation = overheadSharePerHour * emp.productiveHours;
      const effectiveHourlyCost = calculateEffectiveHourlyCost(
        emp.monthlySalaryInBase,
        employeeCostAllocation,
        emp.productiveHours
      );

      simWorkforceCost += effectiveHourlyCost * resource.allocatedHours * resource.quantity;
    });

    // b) Overhead allocation based on capacity
    const activeCapacity = Math.max(1, totalProductiveHoursMonth);
    // Project overhead allocation = (Total Overheads / capacity) * project hours
    const overheadCostPerHour = totalOverheadCostMonth / activeCapacity;
    const simOverheadCost = overheadCostPerHour * projectEstimate.estimatedHours;

    // Direct platform costs allocated
    // If not project-specific, we pro-rate organization-wide infrastructure
    const baseInfraContribution = (totalInfraCostMonth / activeCapacity) * projectEstimate.estimatedHours;
    const baseSaaSContribution = (totalSaaSCostMonth / activeCapacity) * projectEstimate.estimatedHours;

    // Combine pro-rated and direct costs
    const finalSimInfra = simInfraCost + baseInfraContribution;
    const finalSimSaaS = simSaaSCost + baseSaaSContribution;

    // Total Operational Cost
    const simOperationalCost = simWorkforceCost + finalSimInfra + finalSimSaaS + simOverheadCost +
      (projectEstimate.simAiToolsCost || 0) +
      (projectEstimate.simSaasToolsCost || 0) +
      (projectEstimate.simInfraCost || 0) +
      (projectEstimate.simOtherCosts || 0);

    // Contingency Cost
    const simContingencyCost = simOperationalCost * (projectEstimate.contingencyPercent / 100);

    // Recommended Quote in base currency
    const simRecommendedQuote = calculateRecommendedQuote(
      simOperationalCost,
      projectEstimate.contingencyPercent,
      projectEstimate.targetMargin
    );

    // Effective Billing Rate per hour
    const simEffectiveBillingRate =
      projectEstimate.estimatedHours > 0 ? simRecommendedQuote / projectEstimate.estimatedHours : 0;

    // Cash Flow & NPV Engine Calculation
    const milestonesInBase: CashFlowMilestone[] = milestones.map((ms) => {
      const milestoneAmount = simRecommendedQuote * (ms.percentage / 100);
      return {
        amount: milestoneAmount,
        paymentDelayDays: ms.paymentDelayDays
      };
    });

    const simNPV = calculateNPV(milestonesInBase, projectEstimate.discountRate);

    // ----------------------------------------------------
    // RISK & CONFIDENCE SCORING
    // ----------------------------------------------------

    // 1. Margin Health Score: Ratio of Target Margin vs Min Safe Margin
    const marginMargin = projectEstimate.targetMargin - marginPolicy.minimumSafeMargin;
    const simMarginHealthScore = Math.min(
      100,
      Math.max(0, marginMargin >= 0 ? 80 + (marginMargin / 5) * 5 : 50 + (marginMargin / 5) * 10)
    );

    // 2. Operational Stability Score: Based on utilization percentage of allocated team
    let avgUtilization: number;
    if (allocatedResources.length > 0) {
      let utilizationSum = 0;
      let count = 0;
      allocatedResources.forEach((ar) => {
        const emp = employees.find((e) => e.id === ar.employeeId);
        if (emp) {
          utilizationSum += emp.utilizationPercent;
          count++;
        }
      });
      avgUtilization = count > 0 ? utilizationSum / count : 80;
    } else {
      avgUtilization = 80;
    }
    const simStabilityScore = Math.min(100, Math.max(20, avgUtilization));

    // 3. Cash Recovery Score: Ratios of NPV to Recommended Quote
    const cashRecoveryRatio = simRecommendedQuote > 0 ? simNPV / simRecommendedQuote : 1.0;
    const simCashRecoveryScore = Math.min(100, Math.max(0, cashRecoveryRatio * 100));

    // 4. Benchmark Score: Compares billing rate vs regional averages
    const regionBenchmark = benchmarks.find((b) => b.regionName.toUpperCase() === projectEstimate.clientRegion.toUpperCase());
    let simBenchmarkScore = 75; // Default neutral
    if (regionBenchmark) {
      const benchmarkAvgInBase = convertCurrency(
        regionBenchmark.averageRate,
        regionBenchmark.currency,
        baseCurrency,
        exchangeRates
      );
      const ratio = simEffectiveBillingRate / benchmarkAvgInBase;
      // High competitiveness index aligns with healthy average rates
      if (ratio >= 1.0 && ratio <= 1.5) {
        simBenchmarkScore = 95;
      } else if (ratio < 1.0 && ratio >= 0.7) {
        simBenchmarkScore = 80;
      } else if (ratio > 1.5) {
        simBenchmarkScore = 60; // Overpriced penalty
      } else {
        simBenchmarkScore = 40; // Underpriced penalty
      }
    }

    // Weighted Confidence Score
    const simConfidenceScore = calculateQuoteConfidenceScore(
      simMarginHealthScore,
      simStabilityScore,
      simCashRecoveryScore,
      simBenchmarkScore
    );

    // Update state metrics
    set({
      metrics: {
        totalWorkforceCostMonth,
        totalInfraCostMonth,
        totalSaaSCostMonth,
        totalOverheadCostMonth,
        monthlyOrganizationalBurn,
        totalProductiveHoursMonth,
        effectiveHourlyBurn,

        // Financial Hub Aggregates
        totalRecurringRevenueMonth,
        totalRecurringExpenseMonth,
        totalOutstandingReceivables,
        totalOutstandingPayables,

        simWorkforceCost,
        simInfraCost: finalSimInfra,
        simSaaSCost: finalSimSaaS,
        simOverheadCost,
        simOperationalCost,
        simContingencyCost,
        simRecommendedQuote,
        simEffectiveBillingRate,
        simNPV,
        simMarginHealthScore,
        simStabilityScore,
        simCashRecoveryScore,
        simBenchmarkScore,
        simConfidenceScore
      }
    });
  },

  updateUserProfile: (updates) => {
    set((state) => {
      const nextProfile = { ...state.userProfile, ...updates };
      localStorage.setItem('salezy-user-profile', JSON.stringify(nextProfile));
      return { userProfile: nextProfile };
    });
  },

  updateCompanyProfile: (updates) => {
    set((state) => {
      const nextProfile = { ...state.companyProfile, ...updates };
      localStorage.setItem('salezy-company-profile', JSON.stringify(nextProfile));
      
      if (updates.baseCurrency) {
        return { companyProfile: nextProfile, baseCurrency: updates.baseCurrency };
      }
      return { companyProfile: nextProfile };
    });
    
    if (updates.baseCurrency) {
      get().recompute();
    }
  },

  updateUserPreferences: (updates) => {
    set((state) => {
      const nextPrefs = { ...state.userPreferences, ...updates };
      localStorage.setItem('salezy-preferences', JSON.stringify(nextPrefs));
      return { userPreferences: nextPrefs };
    });
  }
}));
