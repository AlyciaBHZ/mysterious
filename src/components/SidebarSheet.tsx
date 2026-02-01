import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { getChat, listChats } from '../services/api';

export function SidebarSheet(props: {
  open: boolean;
  onClose: () => void;
  authedEmail: string | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onLoad: (payload: { question: string; answer: string }) => void;
}) {
  const { open, onClose, authedEmail, onOpenAuth, onLogout, onLoad } = props;
  const [items, setItems] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    if (!authedEmail) {
      setItems([]);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    listChats(30)
      .then((r) => {
        if (!r.ok) {
          setError(r.message || '加载失败');
          setItems([]);
          return;
        }
        setItems(r.items || []);
      })
      .finally(() => setLoading(false));
  }, [open, authedEmail]);

  const handleLoad = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const r = await getChat(id);
      if (!r.ok || !r.item) {
        setError(r.message || '加载失败');
        return;
      }
      onLoad({ question: r.item.question, answer: r.item.answer });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[90vw] sm:max-w-md">
        <SheetHeader>
          <SheetTitle>菜单</SheetTitle>
          <SheetDescription>账号、历史记录与使用方式</SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4 space-y-3">
          <div className="rounded-xl border border-stone-200 bg-white p-3">
            <div className="text-xs text-stone-500 mb-1">当前身份</div>
            <div className="font-semibold text-stone-800">
              {authedEmail ? authedEmail : '游客'}
            </div>
            <div className="text-xs text-stone-600 mt-1">
              {authedEmail ? '可保存/加载历史；每月免费次数按账户计算。' : '每天最多 3 次；不保存历史。'}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {!authedEmail ? (
                <Button onClick={onOpenAuth} className="bg-amber-600 hover:bg-amber-700">
                  登录/注册
                </Button>
              ) : (
                <Button onClick={onLogout} className="bg-stone-200 hover:bg-stone-300 text-stone-900">
                  退出登录
                </Button>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
            <div className="px-3 py-2 border-b border-stone-200 flex items-center justify-between">
              <div className="font-semibold text-stone-800">历史对话</div>
              {!authedEmail && (
                <button
                  type="button"
                  className="text-xs text-amber-700 font-semibold"
                  onClick={onOpenAuth}
                >
                  登录后可用
                </button>
              )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-3 space-y-2">
              {loading && <div className="text-sm text-stone-600">加载中...</div>}
              {error && <div className="text-sm text-red-600">{error}</div>}

              {authedEmail &&
                items.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => handleLoad(it.id)}
                    className="w-full text-left border border-stone-200 rounded-lg p-3 hover:bg-stone-50 transition-colors"
                  >
                    <div className="font-semibold text-stone-800 truncate">{it.title || '未命名'}</div>
                    <div className="text-xs text-stone-500">{it.createdAt}</div>
                    <div className="text-sm text-stone-700 mt-1 line-clamp-2">{it.question}</div>
                  </button>
                ))}

              {authedEmail && !loading && items.length === 0 && !error && (
                <div className="text-sm text-stone-600">暂无历史记录</div>
              )}

              {!authedEmail && (
                <div className="text-sm text-stone-600">
                  游客模式不保存历史。登录后可在这里加载之前的对话并继续使用。
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

