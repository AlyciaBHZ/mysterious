/**
 * 额度管理系统 - Phase 2
 * 
 * 管理用户的使用额度、套餐和兑换码验证
 */

export type PlanType = 'free' | 'trial' | 'basic' | 'standard' | 'pro';

export interface UserQuota {
  plan: PlanType;
  total: number;      // 总额度
  remaining: number;  // 剩余额度
  resetDate: string;  // 重置日期（免费用户用）
  activationCode?: string;  // 兑换码
  activatedAt?: string;     // 激活时间
}

// 套餐配置
export const PLAN_CONFIG = {
  free: {
    name: '免费体验',
    quota: 3,
    price: 0,
    description: '每日3次免费解卦',
    period: 'daily',
  },
  trial: {
    name: '体验包',
    quota: 20,
    price: 6,
    description: '20次解卦',
    period: 'permanent',
  },
  basic: {
    name: '基础包',
    quota: 80,
    price: 19,
    description: '80次解卦',
    period: 'permanent',
  },
  standard: {
    name: '超值包',
    quota: 250,
    price: 49,
    description: '250次解卦',
    popular: true,
  },
  pro: {
    name: '专业包',
    quota: 600,
    price: 99,
    description: '600次解卦',
  },
};

export class QuotaManager {
  private static STORAGE_KEY = 'mysterious_user_quota';

  /**
   * 获取用户当前额度
   */
  static getQuota(): UserQuota {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    
    if (!stored) {
      // 新用户：免费额度
      return this.createFreeQuota();
    }
    
    const quota: UserQuota = JSON.parse(stored);
    
    // 如果是免费用户，检查是否需要重置（每日重置）
    if (quota.plan === 'free') {
      const today = new Date().toISOString().split('T')[0];
      if (quota.resetDate !== today) {
        return this.createFreeQuota();
      }
    }
    
    return quota;
  }

  /**
   * 强制写入额度（用于从服务端同步）
   */
  static setQuota(quota: UserQuota): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(quota));
  }

  /**
   * 使用服务端返回的额度刷新本地缓存
   */
  static setQuotaFromServer(payload: {
    plan: string;
    total: number;
    remaining: number;
    activatedAt?: string | null;
    activationCode?: string;
  }): UserQuota {
    const today = new Date().toISOString().split('T')[0];
    const plan = (payload.plan as PlanType) || 'free';

    const quota: UserQuota = {
      plan,
      total: Number(payload.total || 0),
      remaining: Number(payload.remaining || 0),
      resetDate: today,
      activatedAt: payload.activatedAt || undefined,
      activationCode: payload.activationCode,
    };

    // Free plan: always treat as daily reset with total=3 if not provided.
    if (plan === 'free') {
      quota.total = quota.total || 3;
    }

    this.setQuota(quota);
    return quota;
  }

  /**
   * 创建免费用户额度
   */
  private static createFreeQuota(): UserQuota {
    const today = new Date().toISOString().split('T')[0];
    const quota: UserQuota = {
      plan: 'free',
      total: 3,
      remaining: 3,
      resetDate: today,
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(quota));
    return quota;
  }

  /**
   * 消耗额度
   */
  static consumeQuota(): boolean {
    const quota = this.getQuota();
    
    if (quota.remaining <= 0) {
      return false;
    }
    
    quota.remaining--;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(quota));
    
    return true;
  }

  /**
   * 检查是否需要升级提示
   */
  static shouldShowUpgradePrompt(): boolean {
    const quota = this.getQuota();
    return quota.plan === 'free' && quota.remaining === 0;
  }

  /**
   * 重置额度（仅用于测试）
   */
  static reset(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

