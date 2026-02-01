/**
 * In-memory fallback store for serverless warm instances.
 *
 * NOTE: This is NOT durable across cold starts.
 * It is only a fallback when Upstash Redis isn't configured.
 */
 
export const memoryUsedCodes = new Set(); // code -> used
export const memoryUsers = new Map(); // uid -> { plan, total, remaining, activatedAt }

// Auth fallback (NOT durable)
export const memoryAuthEmailToUid = new Map(); // email -> uid
export const memoryAuthUsers = new Map(); // uid -> { email, passwordHash, createdAt }
export const memoryChats = new Map(); // uid -> Array<{ id, createdAt, title, question, answer }>
 
