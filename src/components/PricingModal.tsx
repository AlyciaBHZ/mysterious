/**
 * 定价套餐展示组件
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { PLAN_CONFIG } from '../services/quota';

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
  onSelectPlan: (plan: string) => void;
  onOpenRedeem?: () => void;
}

export function PricingModal({ open, onClose, onSelectPlan, onOpenRedeem }: PricingModalProps) {
  const plans = [
    { id: 'trial', ...PLAN_CONFIG.trial },
    { id: 'basic', ...PLAN_CONFIG.basic },
    { id: 'standard', ...PLAN_CONFIG.standard },
    { id: 'pro', ...PLAN_CONFIG.pro },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            升级套餐 💰
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            选择适合您的解卦次数套餐
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative border-2 rounded-xl p-6 transition-all hover:shadow-lg ${
                plan.popular
                  ? 'border-amber-500 bg-amber-50/50'
                  : 'border-stone-200 hover:border-amber-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  🔥 最受欢迎
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-stone-800 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-3xl font-bold text-amber-600">
                    ¥{plan.price}
                  </span>
                </div>
                <p className="text-stone-600">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-stone-700">
                  <span className="text-green-600">✓</span>
                  <span>{plan.quota}次解卦额度</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <span className="text-green-600">✓</span>
                  <span>永久有效，用完即止</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <span className="text-green-600">✓</span>
                  <span>支持所有排盘功能</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <span className="text-green-600">✓</span>
                  <span>AI智能解卦</span>
                </div>
              </div>

              <Button
                onClick={() => onSelectPlan(plan.id)}
                className={`w-full ${
                  plan.popular
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-stone-700 hover:bg-stone-800'
                }`}
              >
                微信/支付宝购买
              </Button>

              <div className="mt-3 text-center text-xs text-stone-500">
                平均每次 ¥{(plan.price / plan.quota).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-stone-100 rounded-lg text-sm text-stone-600">
          <p className="font-semibold mb-2">💡 购买说明：</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>购买前需要先登录（用于到账与历史记录同步）</li>
            <li>购买成功后会自动到账（无需兑换码）</li>
            <li>如你已有兑换码，可选择兑换码激活</li>
          </ol>
          {onOpenRedeem && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onOpenRedeem}
                className="text-amber-700 font-semibold hover:underline"
              >
                我有兑换码 → 去激活
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}





