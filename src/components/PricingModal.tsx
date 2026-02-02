/**
 * 定价套餐展示组件 - 大气神秘风格
 */

import React from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { PLAN_CONFIG } from '../services/quota';
import { Sparkles, Check, Zap, Crown, Star, Ticket, Shield, Infinity, ArrowRight } from 'lucide-react';

const GOLD = "#d4af37";
const GOLD_LIGHT = "#f5d061";

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
  onSelectPlan: (plan: string) => void;
  onOpenRedeem?: () => void;
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  trial: <Star className="w-8 h-8" />,
  basic: <Zap className="w-8 h-8" />,
  standard: <Crown className="w-8 h-8" />,
  pro: <Infinity className="w-8 h-8" />,
};

const PLAN_GRADIENTS: Record<string, string> = {
  trial: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  basic: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
  standard: `linear-gradient(135deg, ${GOLD}15 0%, ${GOLD}25 100%)`,
  pro: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
};

export function PricingModal({ open, onClose, onSelectPlan, onOpenRedeem }: PricingModalProps) {
  const plans = [
    { id: 'trial', ...PLAN_CONFIG.trial },
    { id: 'basic', ...PLAN_CONFIG.basic },
    { id: 'standard', ...PLAN_CONFIG.standard },
    { id: 'pro', ...PLAN_CONFIG.pro },
  ];

  const btnStyle = {
    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
    color: '#000',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] max-w-5xl max-h-[95vh] overflow-y-auto p-0"
        style={{
          backgroundColor: '#0a0a0a',
          border: `1px solid ${GOLD}33`,
          boxShadow: `0 0 100px ${GOLD}1a`,
        }}
      >
        {/* 顶部装饰 */}
        <div 
          className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% -20%, ${GOLD}20 0%, transparent 70%)`,
          }}
        />

        {/* 头部 */}
        <div className="relative text-center pt-10 pb-6 px-6">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ 
              background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
              boxShadow: `0 10px 40px ${GOLD}4d`,
            }}
          >
            <Sparkles className="w-8 h-8 text-black" />
          </div>
          <h2 className="text-3xl font-bold text-stone-100 mb-2">选择您的套餐</h2>
          <p className="text-stone-500 max-w-md mx-auto">
            解锁 AI 智能解卦，探索命理玄机
          </p>
        </div>

        {/* 套餐列表 */}
        <div className="px-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const isPopular = plan.popular;
              
              return (
                <div
                  key={plan.id}
                  className="relative rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] group"
                  style={{
                    background: PLAN_GRADIENTS[plan.id],
                    border: isPopular ? `2px solid ${GOLD}` : '1px solid #333',
                    boxShadow: isPopular ? `0 20px 60px ${GOLD}33` : '0 10px 40px rgba(0,0,0,0.3)',
                  }}
                >
                  {/* 热门标签 */}
                  {isPopular && (
                    <div 
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 whitespace-nowrap"
                      style={{ 
                        background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
                        color: '#000',
                        boxShadow: `0 4px 20px ${GOLD}4d`,
                      }}
                    >
                      <Zap className="w-4 h-4" />
                      推荐
                    </div>
                  )}

                  {/* 图标 */}
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ 
                      background: isPopular ? `linear-gradient(135deg, ${GOLD}33 0%, ${GOLD}1a 100%)` : 'rgba(255,255,255,0.05)',
                      color: isPopular ? GOLD : '#737373',
                      border: `1px solid ${isPopular ? `${GOLD}4d` : '#333'}`,
                    }}
                  >
                    {PLAN_ICONS[plan.id]}
                  </div>

                  {/* 套餐名称 */}
                  <h3 
                    className="text-xl font-bold mb-1"
                    style={{ color: isPopular ? GOLD : '#f5f5f5' }}
                  >
                    {plan.name}
                  </h3>

                  {/* 价格 */}
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-sm text-stone-500">¥</span>
                    <span 
                      className="text-4xl font-bold"
                      style={{ color: isPopular ? GOLD : '#f5f5f5' }}
                    >
                      {plan.price}
                    </span>
                  </div>

                  {/* 描述 */}
                  <p className="text-stone-500 text-sm mb-5">{plan.description}</p>

                  {/* 特性列表 */}
                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-center gap-2 text-sm text-stone-300">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }} />
                      <span><strong className="text-stone-100">{plan.quota}</strong> 次解卦额度</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-400">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: `${GOLD}99` }} />
                      <span>永久有效</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-400">
                      <Check className="w-4 h-4 flex-shrink-0" style={{ color: `${GOLD}99` }} />
                      <span>AI 智能解读</span>
                    </div>
                  </div>

                  {/* 购买按钮 */}
                  <Button
                    onClick={() => onSelectPlan(plan.id)}
                    className="w-full font-bold py-3 rounded-xl transition-all duration-300"
                    style={isPopular ? btnStyle : { 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      color: '#d4d4d4',
                      border: '1px solid #404040',
                    }}
                  >
                    立即购买
                  </Button>

                  {/* 单价 */}
                  <div className="mt-3 text-center text-xs text-stone-600">
                    ≈ ¥{(plan.price / plan.quota).toFixed(2)}/次
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部信息 */}
        <div 
          className="px-6 py-6 mt-2"
          style={{ 
            backgroundColor: 'rgba(23,23,23,0.8)',
            borderTop: `1px solid ${GOLD}1a`,
          }}
        >
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              {/* 安全提示 */}
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}
                >
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-stone-300 font-medium">安全支付</p>
                  <p className="text-xs text-stone-500">支持微信、支付宝，购买后自动到账</p>
                </div>
              </div>

              {/* 兑换码入口 */}
              {onOpenRedeem && (
                <button
                  type="button"
                  onClick={onOpenRedeem}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium group"
                  style={{ 
                    backgroundColor: 'rgba(212,175,55,0.1)',
                    border: `1px solid ${GOLD}33`,
                    color: GOLD,
                  }}
                >
                  <Ticket className="w-4 h-4" />
                  <span>已有兑换码？</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
