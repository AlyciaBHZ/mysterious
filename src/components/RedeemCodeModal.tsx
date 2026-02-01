/**
 * 兑换码输入组件
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { QuotaManager } from '../services/quota';
import { redeemCode as redeemCodeApi, getUserStatus } from '../services/api';

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

      // 优先用 /redeem 的返回同步额度；否则用 /status 补一次
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            兑换码激活 🎟️
          </DialogTitle>
          <DialogDescription>
            输入您购买的兑换码来激活解卦次数
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="redemption-code">兑换码</Label>
            <Input
              id="redemption-code"
              placeholder="例如：BASIC-2024-K1L2"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              disabled={isRedeeming}
              className="font-mono text-center text-lg tracking-wider"
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
            >
              {message.type === 'success' ? '✅ ' : '❌ '}
              {message.text}
            </div>
          )}

          <Button
            onClick={handleRedeem}
            disabled={isRedeeming}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {isRedeeming ? '验证中...' : '立即激活'}
          </Button>

          <div className="p-3 bg-stone-100 rounded-lg text-xs text-stone-600">
            <p className="font-semibold mb-1">💡 提示：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>兑换码不区分大小写</li>
              <li>每个兑换码只能使用一次</li>
              <li>激活后立即生效，永久有效</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}




