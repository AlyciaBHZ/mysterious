import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { getChat, listChats } from '../services/api';

export function ChatHistoryModal(props: {
  open: boolean;
  onClose: () => void;
  onLoad: (payload: { question: string; answer: string }) => void;
}) {
  const { open, onClose, onLoad } = props;
  const [items, setItems] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');
    listChats(20)
      .then((r) => {
        if (!r.ok) {
          setError(r.message || '加载失败');
          setItems([]);
          return;
        }
        setItems(r.items || []);
      })
      .finally(() => setLoading(false));
  }, [open]);

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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">历史对话</DialogTitle>
          <DialogDescription>登录后可加载之前的提问与解卦结果</DialogDescription>
        </DialogHeader>

        {loading && <div className="text-sm text-stone-600">加载中...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="max-h-[60vh] overflow-y-auto space-y-2">
          {items.map((it) => (
            <div
              key={it.id}
              className="border border-stone-200 rounded-lg p-3 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-semibold text-stone-800 truncate">{it.title || '未命名'}</div>
                <div className="text-xs text-stone-500">{it.createdAt}</div>
                <div className="text-sm text-stone-700 mt-1 line-clamp-2">{it.question}</div>
              </div>
              <Button onClick={() => handleLoad(it.id)} className="shrink-0 bg-stone-700 hover:bg-stone-800">
                加载
              </Button>
            </div>
          ))}

          {!loading && items.length === 0 && !error && (
            <div className="text-sm text-stone-600">暂无历史记录</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

