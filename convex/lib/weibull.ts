/**
 * Weibull Distribution Forecasting Engine
 * 
 * This is the core intelligence behind Kept's predictions.
 * Weibull distributions model the "bathtub curve" of failure rates
 * that characterize most home systems.
 */

/**
 * Weibull survival probability: S(t) = exp(-(t/scale)^shape)
 * Returns probability (0-1) that a system survives to age t
 * 
 * @param age - Current age of the system in years
 * @param shape - Weibull shape parameter (β) - typically 1.5-4.0
 *   - β < 1: Decreasing failure rate (infant mortality)
 *   - β = 1: Constant failure rate (exponential distribution)
 *   - β > 1: Increasing failure rate (wear-out failures) - most home systems
 * @param scale - Weibull scale parameter (η) - characteristic life, typically lifespan * 1.1
 */
export function weibullSurvival(age: number, shape: number, scale: number): number {
  if (scale <= 0 || age < 0) return 1;
  if (age === 0) return 1;
  return Math.exp(-Math.pow(age / scale, shape));
}

/**
 * Conditional failure probability: probability system fails in next N years
 * given it has already survived to current age.
 * 
 * Formula: P(T ≤ t+n | T > t) = 1 - S(t+n)/S(t)
 * 
 * @param age - Current age of the system in years
 * @param years - Number of years to project forward
 * @param shape - Weibull shape parameter
 * @param scale - Weibull scale parameter
 * @returns Failure probability as percentage (0-100)
 */
export function conditionalFailureProbability(
  age: number,
  years: number,
  shape: number,
  scale: number
): number {
  const survivalNow = weibullSurvival(age, shape, scale);
  if (survivalNow < 0.001) return 100; // Already past expected life
  const survivalFuture = weibullSurvival(age + years, shape, scale);
  return Math.min(100, Math.max(0, ((survivalNow - survivalFuture) / survivalNow) * 100));
}

/**
 * Calculate expected remaining life for a system
 * 
 * @param age - Current age in years
 * @param shape - Weibull shape parameter
 * @param scale - Weibull scale parameter
 * @returns Expected remaining years
 */
export function expectedRemainingLife(age: number, shape: number, scale: number): number {
  // Use numerical integration to estimate mean residual life
  // MRL(t) = E[T-t | T>t] = ∫(t to ∞) S(x)/S(t) dx - for simplicity, use approximation
  const currentSurvival = weibullSurvival(age, shape, scale);
  if (currentSurvival < 0.01) return 0;
  
  // Approximate by finding when survival drops to 50% of current
  let remaining = 0;
  let step = 0.5;
  let maxYears = scale * 3; // Don't search forever
  
  for (let y = 0; y < maxYears; y += step) {
    const futureSurvival = weibullSurvival(age + y, shape, scale);
    if (futureSurvival < currentSurvival * 0.5) {
      remaining = y;
      break;
    }
    remaining = y;
  }
  
  // More accurate: use median remaining life
  return Math.max(0, remaining);
}

/**
 * Calculate system health score based on Weibull survival and maintenance
 * 
 * Formula:
 * - Base score: Blend of lifespan % (30%) and Weibull survival (70%)
 * - Subtract 4 points per overdue maintenance task
 * - Add 3 bonus points if serviced in last 6 months
 * - Clamp to 0-100
 * 
 * @param age - System age in years
 * @param shape - Weibull shape parameter
 * @param scale - Weibull scale parameter
 * @param defaultLifespan - Expected lifespan in years
 * @param overdueTaskCount - Number of overdue maintenance tasks
 * @param lastServiceDate - ISO date string of last service, or undefined
 */
export function calculateSystemHealthScore(
  age: number,
  shape: number,
  scale: number,
  defaultLifespan: number,
  overdueTaskCount: number,
  lastServiceDate?: string
): number {
  // Lifespan-based component (30% weight)
  const lifespanPercent = Math.max(0, 100 - (age / defaultLifespan) * 100);
  const lifespanComponent = lifespanPercent * 0.3;
  
  // Weibull survival component (70% weight)
  const survivalProbability = weibullSurvival(age, shape, scale) * 100;
  const weibullComponent = survivalProbability * 0.7;
  
  // Base score
  let score = lifespanComponent + weibullComponent;
  
  // Overdue task penalty
  score -= overdueTaskCount * 4;
  
  // Recent service bonus
  if (lastServiceDate) {
    const lastService = new Date(lastServiceDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    if (lastService >= sixMonthsAgo) {
      score += 3;
    }
  }
  
  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
}

/**
 * Calculate home health score as average of system scores with overdue penalty
 * 
 * @param systemScores - Array of individual system health scores
 * @param homeOverdueTaskCount - Total overdue tasks for the home
 */
export function calculateHomeHealthScore(
  systemScores: number[],
  homeOverdueTaskCount: number
): number {
  if (systemScores.length === 0) return 100; // No systems = perfect health
  
  const avgScore = systemScores.reduce((a, b) => a + b, 0) / systemScores.length;
  const penalty = homeOverdueTaskCount * 2;
  
  return Math.max(0, Math.min(100, Math.round((avgScore - penalty) * 10) / 10));
}

/**
 * Calculate remaining life percentage
 */
export function calculateRemainingLifePercent(
  age: number,
  defaultLifespan: number
): number {
  const remaining = Math.max(0, defaultLifespan - age);
  return Math.round((remaining / defaultLifespan) * 100);
}

/**
 * Estimate replacement year
 */
export function estimateReplacementYear(
  installYear: number,
  defaultLifespan: number
): number {
  return installYear + Math.round(defaultLifespan);
}

/**
 * Get health score label and color
 */
export function getHealthScoreInfo(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 90) return { label: 'Excellent', color: 'text-emerald-600', bgColor: 'bg-emerald-500' };
  if (score >= 70) return { label: 'Good', color: 'text-emerald-500', bgColor: 'bg-emerald-400' };
  if (score >= 50) return { label: 'Fair', color: 'text-amber-500', bgColor: 'bg-amber-500' };
  if (score >= 30) return { label: 'Needs Attention', color: 'text-amber-600', bgColor: 'bg-amber-600' };
  return { label: 'Critical', color: 'text-red-500', bgColor: 'bg-red-500' };
}

/**
 * Calculate age from install date
 */
export function calculateAge(installDate: string | undefined, yearBuilt?: number): number {
  const currentYear = new Date().getFullYear();
  
  if (installDate) {
    const installYear = new Date(installDate).getFullYear();
    return currentYear - installYear;
  }
  
  if (yearBuilt) {
    return currentYear - yearBuilt;
  }
  
  return 0;
}
