/**
 * 兑换码输入组件 - 大气神秘风格
 */

import React, { useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { QuotaManager } from '../services/quota';
import { redeemCode as redeemCodeApi, getUserStatus } from '../services/api';
import { Ticket, Sparkles, CheckCircle2, XCircle, Gift, KeyRound } from 'lucide-react';

const GOLD = "#d4af37";
const GOLD_LIGHT = "#f5d061";

interface RedeemCodeModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RedeemCodeModal({ open, onClose, onSuccess }: RedeemCodeModalProps) {
  const [code, setCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRedeem = async () => {
    if (!code.trim()) {
      setMessage({ type: 'error', text: '请输入兑换码' });
      return;
    }

    setIsRedeeming(true);
    setMessage(null);

    try {
      const result = await redeemCodeApi(code.trim());

      if (!result.success) {
        setMessage({ type: 'error', text: result.message });
        return;
      }

      if (result.plan && typeof result.total === 'number' && typeof result.remaining === 'number') {
        QuotaManager.setQuotaFromServer({
          plan: result.plan,
          total: result.total,
          remaining: result.remaining,
          activatedAt: new Date().toISOString(),
          activationCode: code.trim().toUpperCase(),
        });
      } else {
        const status = await getUserStatus();
        if (status?.ok && status?.plan) {
          QuotaManager.setQuotaFromServer({
            plan: status.plan,
            total: Number(status.total || 0),
            remaining: Number(status.remaining || 0),
            activatedAt: status.activatedAt || new Date().toISOString(),
          });
        }
      }

      setMessage({ type: 'success', text: result.message });
      setCode('');

      setTimeout(() => {
        onSuccess();
        onClose();
        setMessage(null);
      }, 1500);
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRedeem();
    }
  };

  const btnStyle = {
    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
    color: '#000',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] max-w-lg p-0 overflow-hidden"
        style={{
          backgroundColor: '#0a0a0a',
          border: `1px solid ${GOLD}33`,
          boxShadow: `0 0 80px ${GOLD}1a`,
        }}
      >
        {/* 顶部装饰 */}
        <div 
          className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% -30%, ${GOLD}25 0%, transparent 70%)`,
          }}
        />

        {/* 内容 */}
        <div className="relative p-8">
          {/* 图标 */}
          <div className="flex justify-center mb-6">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${GOLD}20 0%, ${GOLD}10 100%)`,
                border: `2px solid ${GOLD}4d`,
                boxShadow: `0 10px 40px ${GOLD}33`,
              }}
            >
              <Gift className="w-10 h-10" style={{ color: GOLD }} />
            </div>
          </div>

          {/* 标题 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-stone-100 mb-2">兑换码激活</h2>
            <p className="text-stone-500 text-sm">输入兑换码，解锁您的解卦额度</p>
          </div>

          {/* 输入框 */}
          <div className="mb-6">
            <div className="relative">
              <div 
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: `${GOLD}99` }}
              >
                <KeyRound className="w-5 h-5" />
              </div>
              <Input
                placeholder="请输入兑换码"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                disabled={isRedeeming}
                className="pl-12 pr-4 py-4 text-center text-lg font-mono tracking-[0.3em] text-stone-100 placeholder:text-stone-600 placeholder:tracking-normal rounded-xl"
                style={{ 
                  backgroundColor: 'rgba(38,38,38,0.6)', 
                  border: `2px solid ${GOLD}33`,
                  height: '56px',
                }}
              />
            </div>
          </div>

          {/* 消息提示 */}
          {message && (
            <div
              className="mb-6 p-4 rounded-xl flex items-center gap-3"
              style={{
                backgroundColor: message.type === 'success' ? 'rgba(20,83,45,0.3)' : 'rgba(127,29,29,0.3)',
                border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
              <span className={message.type === 'success' ? 'text-green-300' : 'text-red-300'}>
                {message.text}
              </span>
            </div>
          )}

          {/* 激活按钮 */}
          <Button
            onClick={handleRedeem}
            disabled={isRedeeming || !code.trim()}
            className="w-full font-bold py-4 rounded-xl text-lg shadow-lg disabled:opacity-50"
            style={{
              ...btnStyle,
              boxShadow: `0 10px 40px ${GOLD}33`,
              height: '56px',
            }}
          >
            {isRedeeming ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                验证中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                立即激活
              </span>
            )}
          </Button>

          {/* 提示信息 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-stone-600">
              兑换码不区分大小写 · 每个码只能使用一次 · 激活后永久有效
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
