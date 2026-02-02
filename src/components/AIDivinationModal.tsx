/**
 * AI 解卦弹窗组件 - 独立的全屏对话界面
 */

import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Sparkles, Send, Copy, FileText, Ticket, History, Zap } from 'lucide-react';
import { PLAN_CONFIG, type UserQuota } from '../services/quota';

const GOLD = "#d4af37";
const GOLD_LIGHT = "#f5d061";

type ChatMsg = { id: string; role: 'user' | 'assistant'; content: string; createdAt: number };

interface AIDivinationModalProps {
  open: boolean;
  onClose: () => void;
  // AI 相关状态
  question: string;
  setQuestion: (q: string) => void;
  chatMessages: ChatMsg[];
  isAiLoading: boolean;
  aiResponse: string;
  showRawAiResponse: boolean;
  setShowRawAiResponse: (v: boolean) => void;
  // 操作
  onSubmit: () => void;
  onCopy: () => void;
  // 额度
  userQuota: UserQuota;
  isLoggedIn: boolean;
  // 其他弹窗
  onOpenPricing: () => void;
  onOpenRedeem: () => void;
  onOpenHistory: () => void;
  // 语言
  language: 'zh' | 'en';
  t: any;
}

export function AIDivinationModal({
  open,
  onClose,
  question,
  setQuestion,
  chatMessages,
  isAiLoading,
  aiResponse,
  showRawAiResponse,
  setShowRawAiResponse,
  onSubmit,
  onCopy,
  userQuota,
  isLoggedIn,
  onOpenPricing,
  onOpenRedeem,
  onOpenHistory,
  language,
  t,
}: AIDivinationModalProps) {
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chatMessages.length, isAiLoading]);

  const btnStyle = {
    background: `linear-gradient(to right, ${GOLD}, ${GOLD_LIGHT})`,
    color: '#000',
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] p-0 overflow-hidden flex flex-col"
        style={{
          backgroundColor: '#0a0a0a',
          border: `1px solid ${GOLD}4d`,
        }}
      >
        {/* 顶部栏 */}
        <div 
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${GOLD}33` }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(to bottom right, ${GOLD}, ${GOLD_LIGHT})` }}
            >
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-100">{t.ai.title}</h2>
              <p className="text-xs text-stone-500">基于排盘结果的 AI 智能解读</p>
            </div>
          </div>
          
{/* 关闭按钮由 DialogContent 提供 */}
        </div>

        {/* 额度和操作栏 */}
        <div 
          className="flex items-center justify-between gap-3 px-6 py-3 flex-wrap shrink-0"
          style={{ backgroundColor: 'rgba(23,23,23,0.6)' }}
        >
          {/* 额度显示 */}
          <div 
            className="px-4 py-2 rounded-lg flex items-center gap-2"
            style={{ backgroundColor: 'rgba(38,38,38,0.8)', border: `1px solid ${GOLD}33` }}
          >
            <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
            <span className="text-xs text-stone-500">{PLAN_CONFIG[userQuota.plan].name}</span>
            <span className="text-stone-200 font-medium text-sm">
              <span className="font-bold" style={{ color: GOLD }}>
                {userQuota.plan === 'whitelist' ? '∞' : userQuota.remaining}
              </span>
              /{userQuota.plan === 'whitelist' ? '∞' : userQuota.total}
            </span>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenRedeem}
              className="px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-1.5 text-stone-400 hover:text-stone-200"
              style={{ backgroundColor: 'rgba(64,64,64,0.3)', border: '1px solid rgba(64,64,64,0.5)' }}
            >
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">兑换码</span>
            </button>

            <button
              onClick={onOpenHistory}
              className="px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-1.5 text-stone-400 hover:text-stone-200"
              style={{ backgroundColor: 'rgba(64,64,64,0.3)', border: '1px solid rgba(64,64,64,0.5)' }}
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">历史</span>
            </button>

            {userQuota.plan === 'free' && (
              <button
                onClick={onOpenPricing}
                className="px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 text-black"
                style={btnStyle}
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">升级</span>
              </button>
            )}
          </div>
        </div>

        {/* 聊天区域 */}
        <div 
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-mystical"
        >
          {!chatMessages.length && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-pulse-gold"
                style={{ background: `linear-gradient(to bottom right, ${GOLD}33, ${GOLD}1a)`, border: `2px solid ${GOLD}66` }}
              >
                <Sparkles className="w-10 h-10" style={{ color: GOLD }} />
              </div>
              <h3 className="text-xl font-semibold text-stone-200 mb-2">开始 AI 解卦</h3>
              <p className="text-stone-500 max-w-md">
                {isLoggedIn 
                  ? '已登录：本月 10 次免费（白名单不计费）。' 
                  : '游客模式：每天最多 3 次（不保存历史）。'
                }
              </p>
              <p className="text-stone-600 text-sm mt-4">在下方输入你的问题，AI 将基于排盘结果为你解读</p>
            </div>
          )}
          
          {chatMessages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                  m.role === 'user' ? 'text-stone-100' : 'text-stone-200'
                }`}
                style={m.role === 'user' 
                  ? { backgroundColor: `${GOLD}33`, border: `1px solid ${GOLD}4d` } 
                  : { backgroundColor: 'rgba(38,38,38,0.8)', border: '1px solid rgba(64,64,64,0.5)' }
                }
              >
                {m.role === 'assistant' && !showRawAiResponse ? (
                  <div className="break-words" style={{ lineHeight: '1.9' }} dangerouslySetInnerHTML={{
                    __html: m.content
                      .replace(/\n{3,}/g, '\n\n')
                      .replace(/\n*(###\s+.*?)(?=\n|$)/g, `\n\n<h3 style="color:${GOLD};font-weight:bold;font-size:1.1rem;margin-top:1.5rem;margin-bottom:0.75rem">$1</h3>`)
                      .replace(/<h3 style="[^"]*">###\s+(.*?)<\/h3>/g, `<h3 style="color:${GOLD};font-weight:bold;font-size:1.1rem;margin-top:1.5rem;margin-bottom:0.75rem">$1</h3>`)
                      .replace(/\*\*\*\*(.*?)\*\*\*\*/g, '<strong style="color:#f87171;font-weight:bold">$1</strong>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#f5f5f5;font-weight:600">$1</strong>')
                      .replace(/^\* (.*?)$/gm, '<li style="margin-left:1.5rem;margin-top:0.5rem;list-style:disc">$1</li>')
                      .replace(/---/g, `<hr style="margin:1.5rem 0;border-color:${GOLD}33" />`)
                      .replace(/\n\n/g, '</p><p style="margin-bottom:0.75rem">')
                      .replace(/\n/g, '<br />')
                      .replace(/^/, '<p style="margin-bottom:0.75rem">')
                      .replace(/$/, '</p>')
                      .replace(/<p style="margin-bottom:0.75rem"><\/p>/g, ''),
                  }} />
                ) : (
                  <pre className="whitespace-pre-wrap break-words font-sans">{m.content}</pre>
                )}
              </div>
            </div>
          ))}
          
          {isAiLoading && (
            <div className="flex justify-start">
              <div 
                className="rounded-2xl px-5 py-4 flex items-center gap-3"
                style={{ backgroundColor: 'rgba(38,38,38,0.8)', border: '1px solid rgba(64,64,64,0.5)' }}
              >
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: GOLD, animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: GOLD, animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: GOLD, animationDelay: '300ms' }}></span>
                </div>
                <span className="text-sm" style={{ color: `${GOLD}cc` }}>AI 正在解读卦象...</span>
              </div>
            </div>
          )}
        </div>

        {/* 输入区域 */}
        <div 
          className="shrink-0 px-6 py-4"
          style={{ borderTop: `1px solid ${GOLD}33`, backgroundColor: 'rgba(23,23,23,0.8)' }}
        >
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                placeholder={t.ai.questionPlaceholder}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-stone-100 placeholder:text-stone-600 focus:outline-none resize-none leading-relaxed text-base"
                style={{ 
                  backgroundColor: 'rgba(38,38,38,0.6)', 
                  border: `1px solid ${GOLD}33`,
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit();
                  }
                }}
              />
              <p className="mt-2 text-xs text-stone-600">{t.ai.hourlyHint}</p>
            </div>
            <Button
              onClick={onSubmit}
              disabled={isAiLoading || !question}
              className="font-bold rounded-xl px-6 py-3 h-auto shadow-lg disabled:opacity-40"
              style={btnStyle}
            >
              {isAiLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                  {language === 'en' ? 'Sending' : '解读中'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  {language === 'en' ? 'Send' : '发送'}
                </span>
              )}
            </Button>
          </div>

          {/* 底部工具栏 */}
          {aiResponse && (
            <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowRawAiResponse(!showRawAiResponse)}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors text-stone-500 hover:text-stone-300 flex items-center gap-1.5"
                style={{ backgroundColor: 'rgba(64,64,64,0.3)' }}
              >
                <FileText className="w-3.5 h-3.5" />
                {showRawAiResponse ? (language === 'en' ? 'Formatted' : '格式化') : (language === 'en' ? 'Raw' : '原文')}
              </button>

              <button
                type="button"
                onClick={onCopy}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors text-stone-500 hover:text-stone-300 flex items-center gap-1.5"
                style={{ backgroundColor: 'rgba(64,64,64,0.3)' }}
              >
                <Copy className="w-3.5 h-3.5" />
                {language === 'en' ? 'Copy' : '复制'}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
