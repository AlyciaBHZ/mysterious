/**
 * 登录/注册弹窗 - 大气神秘风格
 */

import React, { useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { login, register } from '../services/api';
import { User, Mail, Lock, LogIn, UserPlus, Sparkles, Eye, EyeOff } from 'lucide-react';

const GOLD = "#d4af37";
const GOLD_LIGHT = "#f5d061";

export function AuthModal(props: { open: boolean; onClose: () => void; onAuthed: () => void }) {
  const { open, onClose, onAuthed } = props;
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>('');

  const submit = async () => {
    setLoading(true);
    setMsg('');
    try {
      const r = mode === 'login' ? await login(email, password) : await register(email, password);
      if (!r.ok) {
        setMsg(r.message || '操作失败');
        return;
      }
      onAuthed();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && email && password) {
      submit();
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
              <User className="w-10 h-10 text-black" />
            </div>
          </div>

          {/* 标题 */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-stone-100 mb-2">
              {mode === 'login' ? '欢迎回来' : '创建账号'}
            </h2>
            <p className="text-stone-500 text-sm">
              {mode === 'login' ? '登录以同步您的解卦历史' : '注册后每月享有免费额度'}
            </p>
          </div>

          {/* 模式切换 */}
          <div 
            className="flex rounded-xl p-1 mb-6"
            style={{ backgroundColor: 'rgba(38,38,38,0.6)' }}
          >
            <button
              type="button"
              onClick={() => { setMode('login'); setMsg(''); }}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
              style={mode === 'login' ? {
                background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
                color: '#000',
              } : {
                color: '#737373',
              }}
            >
              <LogIn className="w-4 h-4" />
              登录
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setMsg(''); }}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
              style={mode === 'register' ? {
                background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
                color: '#000',
              } : {
                color: '#737373',
              }}
            >
              <UserPlus className="w-4 h-4" />
              注册
            </button>
          </div>

          {/* 表单 */}
          <div className="space-y-4 mb-6">
            {/* 邮箱 */}
            <div className="relative">
              <div 
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: `${GOLD}99` }}
              >
                <Mail className="w-5 h-5" />
              </div>
              <Input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                onKeyPress={handleKeyPress}
                placeholder="邮箱地址"
                className="pl-12 py-4 text-stone-100 placeholder:text-stone-600 rounded-xl"
                style={{ 
                  backgroundColor: 'rgba(38,38,38,0.6)', 
                  border: `1px solid ${GOLD}33`,
                  height: '52px',
                }}
              />
            </div>

            {/* 密码 */}
            <div className="relative">
              <div 
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: `${GOLD}99` }}
              >
                <Lock className="w-5 h-5" />
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={mode === 'register' ? '密码（至少6位）' : '密码'}
                className="pl-12 pr-12 py-4 text-stone-100 placeholder:text-stone-600 rounded-xl"
                style={{ 
                  backgroundColor: 'rgba(38,38,38,0.6)', 
                  border: `1px solid ${GOLD}33`,
                  height: '52px',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 错误提示 */}
          {msg && (
            <div 
              className="mb-6 p-3 rounded-xl text-sm text-red-300"
              style={{ backgroundColor: 'rgba(127,29,29,0.3)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              {msg}
            </div>
          )}

          {/* 提交按钮 */}
          <Button 
            onClick={submit} 
            disabled={loading || !email || !password} 
            className="w-full font-bold py-4 rounded-xl text-lg shadow-lg disabled:opacity-50"
            style={{
              ...btnStyle,
              boxShadow: `0 10px 40px ${GOLD}33`,
              height: '52px',
            }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                处理中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {mode === 'login' ? '登录' : '注册'}
              </span>
            )}
          </Button>

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
