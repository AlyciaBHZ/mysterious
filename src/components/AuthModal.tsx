import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { login, register } from '../services/api';

export function AuthModal(props: { open: boolean; onClose: () => void; onAuthed: () => void }) {
  const { open, onClose, onAuthed } = props;
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>('');

  const submit = async () => {
    setLoading(true);
    setMsg('');
    try {
      const r = mode === 'login' ? await login(email, password) : await register(email, password);
      if (!r.ok) {
        setMsg(r.message || '失败');
        return;
      }
      onAuthed();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{mode === 'login' ? '登录' : '注册'}</DialogTitle>
          <DialogDescription>用于购买、同步额度、加载历史对话</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setMode('login')}
              className={mode === 'login' ? 'bg-stone-800 hover:bg-stone-900' : 'bg-stone-200 hover:bg-stone-300 text-stone-900'}
            >
              登录
            </Button>
            <Button
              type="button"
              onClick={() => setMode('register')}
              className={mode === 'register' ? 'bg-stone-800 hover:bg-stone-900' : 'bg-stone-200 hover:bg-stone-300 text-stone-900'}
            >
              注册
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="auth-email">邮箱</Label>
            <Input id="auth-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="auth-password">密码</Label>
            <Input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
            />
          </div>

          {msg && <div className="text-sm text-red-600">{msg}</div>}

          <Button onClick={submit} disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700">
            {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

