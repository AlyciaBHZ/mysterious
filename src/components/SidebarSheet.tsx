/**
 * 侧边栏 - 账号与历史记录
 */

import React, { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Button } from './ui/button';
import { getChat, listChats } from '../services/api';
import { User, LogIn, LogOut, History, MessageSquare, Calendar, Sparkles } from 'lucide-react';

const GOLD = "#d4af37";
const GOLD_LIGHT = "#f5d061";

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

  const btnStyle = {
    background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
    color: '#000',
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent 
        side="left" 
        className="w-[90vw] sm:max-w-sm p-0 flex flex-col"
        style={{ 
          backgroundColor: '#0a0a0a', 
          borderRight: `1px solid ${GOLD}33`,
        }}
      >
        {/* 顶部装饰 */}
        <div 
          className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% -30%, ${GOLD}20 0%, transparent 70%)`,
          }}
        />

        <SheetHeader className="relative p-6 pb-4">
          <SheetTitle className="text-xl font-bold flex items-center gap-2" style={{ color: GOLD }}>
            <User className="w-5 h-5" />
            账户
          </SheetTitle>
          <SheetDescription className="text-stone-500">
            管理账号与查看历史
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col px-4 pb-4">
          {/* 用户信息卡片 */}
          <div 
            className="rounded-xl p-4 mb-4"
            style={{ 
              background: 'linear-gradient(135deg, rgba(38,38,38,0.8) 0%, rgba(23,23,23,0.8) 100%)',
              border: `1px solid ${GOLD}33`,
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ 
                  background: authedEmail 
                    ? `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`
                    : 'rgba(64,64,64,0.5)',
                }}
              >
                <User className={`w-6 h-6 ${authedEmail ? 'text-black' : 'text-stone-500'}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-stone-500 mb-0.5">当前身份</div>
                <div className="font-semibold text-stone-100 truncate">
                  {authedEmail ? authedEmail : '游客'}
                </div>
              </div>
            </div>

            {!authedEmail ? (
              <Button 
                onClick={onOpenAuth} 
                className="w-full font-bold rounded-lg"
                style={btnStyle}
              >
                <LogIn className="w-4 h-4 mr-2" />
                登录 / 注册
              </Button>
            ) : (
              <Button 
                onClick={onLogout} 
                className="w-full rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(64,64,64,0.5)', 
                  border: '1px solid #404040',
                  color: '#a3a3a3',
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                退出登录
              </Button>
            )}
          </div>

          {/* 历史记录 */}
          <div 
            className="flex-1 rounded-xl overflow-hidden flex flex-col"
            style={{ 
              backgroundColor: 'rgba(23,23,23,0.6)',
              border: `1px solid ${GOLD}1a`,
            }}
          >
            {/* 标题栏 */}
            <div 
              className="px-4 py-3 flex items-center justify-between shrink-0"
              style={{ borderBottom: `1px solid ${GOLD}1a` }}
            >
              <div className="font-semibold text-stone-200 flex items-center gap-2 text-sm">
                <History className="w-4 h-4" style={{ color: GOLD }} />
                历史记录
              </div>
              {!authedEmail && (
                <span className="text-xs text-stone-600">登录后可用</span>
              )}
            </div>

            {/* 列表 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-mystical">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <span 
                    className="w-6 h-6 border-2 border-stone-700 rounded-full animate-spin"
                    style={{ borderTopColor: GOLD }}
                  />
                </div>
              )}
              
              {error && (
                <div 
                  className="text-sm rounded-lg p-3"
                  style={{ backgroundColor: 'rgba(127,29,29,0.2)', color: '#fca5a5' }}
                >
                  {error}
                </div>
              )}

              {authedEmail && items.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => handleLoad(it.id)}
                  className="w-full text-left rounded-lg p-3 transition-all duration-200 group"
                  style={{ 
                    backgroundColor: 'rgba(38,38,38,0.4)',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${GOLD}4d`;
                    e.currentTarget.style.backgroundColor = 'rgba(38,38,38,0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.backgroundColor = 'rgba(38,38,38,0.4)';
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-500 transition-colors" />
                    <span className="font-medium text-stone-200 text-sm truncate group-hover:text-amber-500 transition-colors">
                      {it.title || '未命名'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-stone-600 mb-1.5">
                    <Calendar className="w-3 h-3" />
                    {it.createdAt}
                  </div>
                  <div className="text-xs text-stone-500 line-clamp-2">{it.question}</div>
                </button>
              ))}

              {authedEmail && !loading && items.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <History className="w-10 h-10 text-stone-700 mb-3" />
                  <p className="text-stone-600 text-sm">暂无历史记录</p>
                </div>
              )}

              {!authedEmail && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'rgba(64,64,64,0.3)' }}
                  >
                    <Sparkles className="w-7 h-7 text-stone-600" />
                  </div>
                  <p className="text-stone-500 text-sm mb-1">登录后可保存历史</p>
                  <p className="text-stone-600 text-xs">随时查看之前的解卦记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
