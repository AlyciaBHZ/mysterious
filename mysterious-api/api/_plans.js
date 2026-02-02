/**
 * Centralized plan configuration (single source of truth).
 *
 * Amounts are in CNY fen.
 */
 
export const PLANS = {
  trial: { name: '体验包', quota: 20, amount_cny_fen: 600 },
  basic: { name: '基础包', quota: 80, amount_cny_fen: 1900 },
  standard: { name: '超值包', quota: 250, amount_cny_fen: 4900 },
  pro: { name: '专业包', quota: 600, amount_cny_fen: 9900 },
};
 
export function getPlan(planId) {
  const id = String(planId || '').trim();
  return PLANS[id] ? { id, ...PLANS[id] } : null;
}
 
