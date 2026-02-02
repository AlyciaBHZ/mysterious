/**
 * 登录/注册弹窗 - 手机号 + 验证码
 */

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { loginWithPhone, sendSmsCode } from '../services/api';
import { Smartphone, KeyRound, Sparkles, Shield } from 'lucide-react';

const GOLD = "#d4af37";
const GOLD_LIGHT = "#f5d061";

export function AuthModal(props: { open: boolean; onClose: () => void; onAuthed: () => void }) {
  const { open, onClose, onAuthed } = props;
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // 验证码倒计时
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // 验证手机号格式
  const isValidPhone = (p: string) => /^1[3-9]\d{9}$/.test(p);

  // 发送验证码
  const handleSendCode = async () => {
    if (!isValidPhone(phone)) {
      setMsg({ type: 'error', text: '请输入正确的手机号' });
      return;
    }

    setSendingCode(true);
    setMsg(null);

    try {
      const r = await sendSmsCode(phone);
      if (!r.ok) {
        setMsg({ type: 'error', text: r.message || '发送失败' });
        return;
      }
      setMsg({ type: 'success', text: '验证码已发送' });
      setCountdown(60);
    } catch (err) {
      setMsg({ type: 'error', text: '发送失败，请稍后重试' });
    } finally {
      setSendingCode(false);
    }
  };

  // 登录/注册
  const handleSubmit = async () => {
    if (!isValidPhone(phone)) {
      setMsg({ type: 'error', text: '请输入正确的手机号' });
      return;
    }
    if (!code || code.length < 4) {
      setMsg({ type: 'error', text: '请输入验证码' });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      const r = await loginWithPhone(phone, code);
      if (!r.ok) {
        setMsg({ type: 'error', text: r.message || '登录失败' });
        return;
      }
      setMsg({ type: 'success', text: r.isNew ? '注册成功！' : '登录成功！' });
      setTimeout(() => {
        onAuthed();
        onClose();
      }, 500);
    } catch (err) {
      setMsg({ type: 'error', text: '操作失败，请稍后重试' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && phone && code) {
      handleSubmit();
    }
  };

  const btnStyle = {
    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
    color: '#000',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] max-w-md p-0 overflow-hidden"
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
                background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
                boxShadow: `0 10px 40px ${GOLD}4d`,
              }}
            >
              <Smartphone className="w-10 h-10 text-black" />
            </div>
          </div>

          {/* 标题 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-stone-100 mb-2">手机号登录</h2>
            <p className="text-stone-500 text-sm">
              未注册的手机号将自动创建账号
            </p>
          </div>

          {/* 表单 */}
          <div className="space-y-4 mb-6">
            {/* 手机号 */}
            <div className="relative">
              <div 
                className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
              >
                +86
              </div>
              <Input 
                type="tel"
                value={phone} 
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))} 
                onKeyPress={handleKeyPress}
                placeholder="请输入手机号"
                className="pl-14 py-4 text-stone-100 placeholder:text-stone-600 rounded-xl text-lg tracking-wider"
                style={{ 
                  backgroundColor: 'rgba(38,38,38,0.6)', 
                  border: `1px solid ${GOLD}33`,
                  height: '56px',
                }}
              />
            </div>

            {/* 验证码 */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <div 
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: `${GOLD}99` }}
                >
                  <KeyRound className="w-5 h-5" />
                </div>
                <Input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={handleKeyPress}
                  placeholder="验证码"
                  className="pl-12 py-4 text-stone-100 placeholder:text-stone-600 rounded-xl text-lg tracking-[0.3em] text-center"
                  style={{ 
                    backgroundColor: 'rgba(38,38,38,0.6)', 
                    border: `1px solid ${GOLD}33`,
                    height: '56px',
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode || countdown > 0 || !isValidPhone(phone)}
                className="px-5 rounded-xl font-medium whitespace-nowrap disabled:opacity-50"
                style={{ 
                  backgroundColor: countdown > 0 ? 'rgba(64,64,64,0.5)' : 'rgba(212,175,55,0.2)',
                  border: `1px solid ${countdown > 0 ? '#404040' : GOLD}66`,
                  color: countdown > 0 ? '#737373' : GOLD,
                  height: '56px',
                  minWidth: '120px',
                }}
              >
                {sendingCode ? (
                  <span className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : countdown > 0 ? (
                  `${countdown}s`
                ) : (
                  '获取验证码'
                )}
              </Button>
            </div>
          </div>

          {/* 消息提示 */}
          {msg && (
            <div 
              className="mb-6 p-3 rounded-xl text-sm flex items-center gap-2"
              style={{ 
                backgroundColor: msg.type === 'success' ? 'rgba(20,83,45,0.3)' : 'rgba(127,29,29,0.3)', 
                border: `1px solid ${msg.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                color: msg.type === 'success' ? '#86efac' : '#fca5a5',
              }}
            >
              {msg.text}
            </div>
          )}

          {/* 提交按钮 */}
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !phone || !code} 
            className="w-full font-bold py-4 rounded-xl text-lg shadow-lg disabled:opacity-50"
            style={{
              ...btnStyle,
              boxShadow: `0 10px 40px ${GOLD}33`,
              height: '56px',
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                登录中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                登录 / 注册
              </span>
            )}
          </Button>

          {/* 安全提示 */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-stone-600">
            <Shield className="w-4 h-4" />
            <span>验证码 5 分钟内有效，请勿泄露</span>
          </div>

          {/* 分隔线 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: '1px solid #333' }}></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-stone-600" style={{ backgroundColor: '#0a0a0a' }}>或者</span>
            </div>
          </div>

          {/* 游客模式 */}
          <Button
            type="button"
            onClick={() => {
              localStorage.setItem('guest_mode', '1');
              onClose();
            }}
            className="w-full py-3 rounded-xl text-sm"
            style={{ 
              backgroundColor: 'rgba(38,38,38,0.6)', 
              border: '1px solid #404040',
              color: '#a3a3a3',
            }}
          >
            以游客身份继续（每日3次）
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
