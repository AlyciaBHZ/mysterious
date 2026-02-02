import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { getChat, listChats } from '../services/api';
import { History, Calendar, Download } from 'lucide-react';

const GOLD = "#d4af37";
const GOLD_LIGHT = "#f5d061";

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

  const btnStyle = {
    background: `linear-gradient(to right, ${GOLD}, ${GOLD_LIGHT})`,
    color: '#000',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-2xl backdrop-blur-xl text-stone-100"
        style={{ backgroundColor: 'rgba(23,23,23,0.95)', border: `1px solid ${GOLD}4d` }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2" style={{ color: GOLD }}>
            <History className="w-5 h-5" />
            历史对话
          </DialogTitle>
          <DialogDescription className="text-stone-400">
            登录后可加载之前的提问与解卦结果
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="text-sm text-stone-500 flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-stone-600 rounded-full animate-spin" style={{ borderTopColor: GOLD }}></span>
            加载中...
          </div>
        )}
        {error && (
          <div 
            className="text-sm rounded-lg px-3 py-2"
            style={{ backgroundColor: 'rgba(127,29,29,0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5' }}
          >
            {error}
          </div>
        )}

        <div className="max-h-[60vh] overflow-y-auto space-y-2 scrollbar-mystical">
          {items.map((it) => (
            <div
              key={it.id}
              className="rounded-lg p-4 flex items-start justify-between gap-3 transition-all duration-200 hover:shadow-lg"
              style={{ border: `1px solid ${GOLD}33`, backgroundColor: 'rgba(38,38,38,0.5)' }}
            >
              <div className="min-w-0">
                <div className="font-semibold text-stone-100 truncate">{it.title || '未命名'}</div>
                <div className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                  <Calendar className="w-3 h-3" />
                  {it.createdAt}
                </div>
                <div className="text-sm text-stone-400 mt-2 line-clamp-2">{it.question}</div>
              </div>
              <Button 
                onClick={() => handleLoad(it.id)} 
                className="shrink-0 font-bold"
                style={btnStyle}
              >
                <Download className="w-4 h-4 mr-1" />
                加载
              </Button>
            </div>
          ))}

          {!loading && items.length === 0 && !error && (
            <div className="text-sm text-stone-500 text-center py-8">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              暂无历史记录
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
