/**
 * API服务层 - Phase 1
 * 
 * 负责与Vercel后端通信，隐藏API Key
 */

// API端点配置
const API_URL_STORAGE_KEY = 'mysterious_api_url';
// Default to the stable production alias for the Vercel API project.
// (This avoids hardcoding a specific deployment URL like mysterious-xxxxx-*.vercel.app)
const DEFAULT_API_BASE_URL = 'https://mysterious-api.vercel.app/api';

function safeGetLocalStorageItem(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

const API_BASE_URL = normalizeBaseUrl(
  safeGetLocalStorageItem(API_URL_STORAGE_KEY) ||
    import.meta.env.VITE_API_URL ||
    DEFAULT_API_BASE_URL
);

// Helps debugging which backend is being used (especially after rotating keys in a new Vercel project).
console.info(`[mysterious] Using API_BASE_URL: ${API_BASE_URL}`);

interface GeminiResponse {
  success: boolean;
  result: string;
  remaining: number;
  plan: string;
  total?: number;
  model?: string;
  storage?: string;
}

interface ApiError {
  error: string;
  message: string;
  remaining?: number;
  details?: unknown;
}

/**
 * 调用Gemini API（通过Vercel代理）
 */
export async function callGeminiAPI(
  prompt: string,
  userToken: string = 'free'
): Promise<GeminiResponse> {
  try {
    const question = safeGetLocalStorageItem('mysterious_last_question') || '';
    const response = await fetch(`${API_BASE_URL}/gemini`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Session auth is optional; used for saving chat history and future paid checkout.
        ...(safeGetLocalStorageItem('session_token')
          ? { Authorization: `Bearer ${safeGetLocalStorageItem('session_token')}` }
          : {}),
      },
      body: JSON.stringify({
        prompt,
        userToken,
        question,
      }),
    });

    const data: GeminiResponse | ApiError = await response.json();

    // 成功
    if (response.ok && 'success' in data && data.success) {
      console.log(`✅ AI解卦成功 | 剩余次数: ${data.remaining} | 套餐: ${data.plan}`);
      return data;
    }

    // Key leaked / permission denied
    if (response.status === 403) {
      const error = data as ApiError;
      throw new Error(
        `${error.message || error.error || 'Gemini API 权限被拒绝'}\n\n` +
          `当前调用的后端：${API_BASE_URL}\n` +
          `如果你刚在 Vercel 更新了新 Key，请确认你更新的是这个项目，并且已 redeploy。`
      );
    }

    // 额度不足
    if (response.status === 429) {
      const error = data as ApiError;
      const msg = error.message || '请求过于频繁/额度不足（429）';
      // Distinguish: our own daily quota vs Gemini quota/billing
      const isGeminiQuota = /Gemini quota\/rate limit exceeded|plan\/billing|RESOURCE_EXHAUSTED|Quota exceeded/i.test(msg);
      throw new Error(
        isGeminiQuota
          ? `${msg}\n\n建议：\n- 等待一会儿再试（如果提示了 retry after）\n- 去 Google AI Studio/Cloud 检查该 Key 的配额与 Billing（有些项目 free-tier 配额可能是 0）\n\n当前调用的后端：${API_BASE_URL}`
          : (error.message || '今日免费额度已用完，请升级套餐')
      );
    }

    // 其他错误
    if ('error' in data) {
      throw new Error(data.message || data.error);
    }

    throw new Error('API返回数据格式错误');

  } catch (error) {
    console.error('❌ Gemini API调用失败:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('网络连接失败，请检查网络后重试');
  }
}

export async function getQuota(): Promise<{ ok: boolean; plan?: string; total?: number; remaining?: number; message?: string }> {
  const session = safeGetLocalStorageItem('session_token');
  if (!session) return { ok: false, message: '未登录' };
  try {
    const res = await fetch(`${API_BASE_URL}/quota`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${session}` },
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) return { ok: false, message: data?.message || '获取失败' };
    return { ok: true, plan: data?.plan, total: data?.total, remaining: data?.remaining };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : '网络错误' };
  }
}

// -------------------------
// Auth (user system)
// -------------------------

/**
 * 发送短信验证码
 */
export async function sendSmsCode(phone: string): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) return { ok: false, message: data?.message || '发送失败' };
    return { ok: true, message: data?.message };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : '网络错误' };
  }
}

/**
 * 手机号 + 验证码登录（自动注册）
 */
export async function loginWithPhone(phone: string, code: string): Promise<{ ok: boolean; message?: string; token?: string; isNew?: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) return { ok: false, message: data?.message || '登录失败' };
    if (data?.token) localStorage.setItem('session_token', data.token);
    return { ok: true, token: data?.token, isNew: data?.isNew };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : '网络错误' };
  }
}

// 保留邮箱登录（兼容旧用户）
export async function register(email: string, password: string): Promise<{ ok: boolean; message?: string; token?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) return { ok: false, message: data?.message || '注册失败' };
    if (data?.token) localStorage.setItem('session_token', data.token);
    return { ok: true, token: data?.token };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : '网络错误' };
  }
}

export async function login(email: string, password: string): Promise<{ ok: boolean; message?: string; token?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) return { ok: false, message: data?.message || '登录失败' };
    if (data?.token) localStorage.setItem('session_token', data.token);
    return { ok: true, token: data?.token };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : '网络错误' };
  }
}

export async function me(): Promise<{ ok: boolean; user?: { email?: string; phone?: string } }> {
  const session = safeGetLocalStorageItem('session_token');
  if (!session) return { ok: false };
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${session}` },
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) return { ok: false };
    return { ok: true, user: data?.user };
  } catch {
    return { ok: false };
  }
}

// -------------------------
// Chat history
// -------------------------

export async function listChats(limit: number = 20): Promise<{ ok: boolean; items?: any[]; message?: string }> {
  const session = safeGetLocalStorageItem('session_token');
  if (!session) return { ok: false, message: '未登录' };
  try {
    const res = await fetch(`${API_BASE_URL}/chat/list?limit=${encodeURIComponent(String(limit))}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${session}` },
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) return { ok: false, message: data?.message || '加载失败' };
    return { ok: true, items: data?.items || [] };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : '网络错误' };
  }
}

export async function getChat(id: string): Promise<{ ok: boolean; item?: any; message?: string }> {
  const session = safeGetLocalStorageItem('session_token');
  if (!session) return { ok: false, message: '未登录' };
  try {
    const res = await fetch(`${API_BASE_URL}/chat/get?id=${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${session}` },
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) return { ok: false, message: data?.message || '加载失败' };
    return { ok: true, item: data?.item };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : '网络错误' };
  }
}

// -------------------------
// Payments (Stripe Checkout)
// -------------------------

export async function createCheckout(planId: string): Promise<{ ok: boolean; url?: string; message?: string }> {
  const session = safeGetLocalStorageItem('session_token');
  if (!session) return { ok: false, message: '未登录' };
  try {
    const res = await fetch(`${API_BASE_URL}/pay/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session}` },
      body: JSON.stringify({ planId }),
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) return { ok: false, message: data?.message || '下单失败' };
    return { ok: true, url: data?.url };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : '网络错误' };
  }
}

export async function confirmCheckout(sessionId: string): Promise<{ ok: boolean; plan?: string; total?: number; remaining?: number; added?: number; message?: string }> {
  const session = safeGetLocalStorageItem('session_token');
  if (!session) return { ok: false, message: '未登录' };
  try {
    const res = await fetch(`${API_BASE_URL}/pay/confirm?session_id=${encodeURIComponent(sessionId)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${session}` },
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) return { ok: false, message: data?.message || '确认失败' };
    return { ok: true, plan: data?.plan, total: data?.total, remaining: data?.remaining, added: data?.added };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : '网络错误' };
  }
}

/**
 * 健康检查
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('❌ API健康检查失败:', error);
    return false;
  }
}

/**
 * (Debug) 允许在浏览器里覆盖后端地址，而无需重新打包部署。
 * 在 Console 执行：
 *   localStorage.setItem('mysterious_api_url', 'https://xxx.vercel.app/api')
 * 然后刷新页面即可生效。
 */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

/**
 * 获取用户状态（Phase 2实现）
 */
export async function getUserStatus() {
  const userToken = localStorage.getItem('user_token') || 'free';

  // Free users: no server-side identity; return a minimal shape.
  if (!userToken || userToken === 'free') {
    return { token: 'free', ok: true, plan: 'free', total: 3, remaining: 3 };
  }

  try {
    const res = await fetch(`${API_BASE_URL}/status`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) {
      return { token: 'free', ok: false, plan: 'free', total: 3, remaining: 3 };
    }
    return { token: userToken, ...data };
  } catch {
    return { token: 'free', ok: false, plan: 'free', total: 3, remaining: 3 };
  }
}

/**
 * 兑换码验证（Phase 2实现）
 */
export async function redeemCode(
  code: string
): Promise<{ success: boolean; message: string; token?: string; plan?: string; total?: number; remaining?: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();
    if (!response.ok || !data?.success) {
      return { success: false, message: data?.message || '兑换失败，请稍后重试' };
    }

    if (data?.token) {
      localStorage.setItem('user_token', data.token);
    }

    return {
      success: true,
      message: data?.message || '兑换成功',
      token: data?.token,
      plan: data?.plan,
      total: data?.total,
      remaining: data?.remaining,
    };
  } catch (e) {
    return {
      success: false,
      message: e instanceof Error ? e.message : '网络错误，请稍后重试',
    };
  }
}

