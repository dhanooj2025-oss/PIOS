// Core deterministic formulas for the Pricing Intelligence Operating System (PIOS)
// These formulas implement the equations specified in the product specification documents.

export interface ExchangeRates {
  [from: string]: { [to: string]: number };
}

// Default static exchange rates (with INR as the base currency triangulation point if needed)
export const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  USD: { INR: 83.5, GBP: 0.78, AED: 3.67, USD: 1.0 },
  INR: { USD: 1 / 83.5, GBP: 1 / 106.0, AED: 1 / 22.7, INR: 1.0 },
  GBP: { INR: 106.0, USD: 1.28, AED: 4.70, GBP: 1.0 },
  AED: { INR: 22.7, USD: 0.27, GBP: 0.21, AED: 1.0 }
};

/**
 * Converts any currency amount to a target currency using specified or default exchange rates.
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: ExchangeRates = DEFAULT_EXCHANGE_RATES
): number {
  const f = from.toUpperCase();
  const t = to.toUpperCase();
  if (f === t) return amount;

  // Direct conversion
  if (rates[f] && rates[f][t] !== undefined) {
    return amount * rates[f][t];
  }

  // Inverse conversion
  if (rates[t] && rates[t][f] !== undefined && rates[t][f] > 0) {
    return amount / rates[t][f];
  }

  // Triangulate through a common base currency if direct path isn't present
  const base = 'INR';
  if (f !== base && t !== base) {
    const amountInBase = convertCurrency(amount, f, base, rates);
    return convertCurrency(amountInBase, base, t, rates);
  }

  return amount; // Fallback
}

export interface WorkforceInput {
  annualSalary: number;
  salaryCurrency: string;
  totalWorkingHoursMonth: number;
  utilizationPercent: number;
  allocationFactor: number;
  overheadMultiplier: number;
  // Non-billable hourly categories
  meetingsHours: number;
  operationsHours: number;
  leaveHours: number;
  internalSupportHours: number;
  learningHours: number;
}

/**
 * 1. Workforce Economics Engine: Productive Hours Formula
 * Productive Hours = Total Working Hours - NonBillable Hours
 * NonBillable Hours = Meetings + Operations + Leave + Internal Support + Learning
 */
export function calculateProductiveHours(
  totalHours: number,
  meetings: number,
  operations: number,
  leave: number,
  internalSupport: number,
  learning: number
): number {
  const nonBillable = meetings + operations + leave + internalSupport + learning;
  return Math.max(0, totalHours - nonBillable);
}

/**
 * 2. Workforce Economics Engine: Effective Hourly Cost Formula
 * Effective Hourly Cost = (Monthly Salary + Cost Allocation) / Productive Hours
 */
export function calculateEffectiveHourlyCost(
  monthlySalary: number,
  costAllocation: number,
  productiveHours: number
): number {
  if (productiveHours <= 0) return 0;
  return (monthlySalary + costAllocation) / productiveHours;
}

/**
 * 3. Margin Intelligence Engine: Margin vs Markup Percentage
 * Margin % = ((Revenue - Cost) / Revenue) * 100
 * Markup % = ((Revenue - Cost) / Cost) * 100
 */
export function calculateMarginPercentage(revenue: number, cost: number): number {
  if (revenue <= 0) return 0;
  return ((revenue - cost) / revenue) * 100;
}

export function calculateMarkupPercentage(revenue: number, cost: number): number {
  if (cost <= 0) return 0;
  return ((revenue - cost) / cost) * 100;
}

/**
 * 4. Safe Billing Rate and Recommended Quote Logic
 * Recommended Quote = (Operational Cost + Contingency) / (1 - Target Margin)
 */
export function calculateRecommendedQuote(
  operationalCost: number,
  contingencyPercent: number,
  targetMarginPercent: number
): number {
  const marginDecimal = targetMarginPercent / 100;
  if (marginDecimal >= 1) return Infinity;
  const contingencyCost = operationalCost * (contingencyPercent / 100);
  return (operationalCost + contingencyCost) / (1 - marginDecimal);
}

export interface CashFlowMilestone {
  amount: number;
  paymentDelayDays: number;
}

/**
 * 5. Net Present Value (NPV) Engine
 * NPV = Sum of [CashFlow_t / (1 + r)^t]
 * Where r = discount rate (converted to a daily/period rate) and t = payment period in days.
 */
export function calculateNPV(
  milestones: CashFlowMilestone[],
  annualDiscountRatePercent: number
): number {
  let npv = 0;
  // Convert annual percentage rate to daily compound discount factor
  const r = annualDiscountRatePercent / 100 / 365;
  for (const milestone of milestones) {
    const t = milestone.paymentDelayDays;
    npv += milestone.amount / Math.pow(1 + r, t);
  }
  return npv;
}

/**
 * Calculates a weighted quote confidence score (0 - 100)
 * Weights: Margin Health = 30%, Operational Stability = 25%, Cash Recovery = 20%, Benchmark Alignment = 25%
 */
export function calculateQuoteConfidenceScore(
  marginHealthScore: number, // 0 - 100
  operationalStabilityScore: number, // 0 - 100
  cashRecoveryScore: number, // 0 - 100
  benchmarkAlignmentScore: number // 0 - 100
): number {
  return (
    marginHealthScore * 0.30 +
    operationalStabilityScore * 0.25 +
    cashRecoveryScore * 0.20 +
    benchmarkAlignmentScore * 0.25
  );
}

/**
 * Resolves confidence category name based on score
 */
export function getConfidenceCategory(score: number): {
  category: 'Strong Confidence' | 'Moderate Confidence' | 'Weak Confidence' | 'Critical Risk';
  color: string;
} {
  if (score >= 80) return { category: 'Strong Confidence', color: '#10b981' }; // Emerald
  if (score >= 60) return { category: 'Moderate Confidence', color: '#3b82f6' }; // Blue
  if (score >= 40) return { category: 'Weak Confidence', color: '#f59e0b' }; // Amber
  return { category: 'Critical Risk', color: '#ef4444' }; // Red
}

/**
 * Resolves Margin Risk level
 */
export function getMarginRiskLevel(marginPercent: number, minSafeMargin: number): {
  level: 'Safe' | 'Moderate' | 'Risky' | 'Unsustainable';
  color: string;
} {
  if (marginPercent > minSafeMargin + 5) return { level: 'Safe', color: '#10b981' };
  if (marginPercent >= minSafeMargin) return { level: 'Moderate', color: '#3b82f6' };
  if (marginPercent > 0) return { level: 'Risky', color: '#f59e0b' };
  return { level: 'Unsustainable', color: '#ef4444' };
}
