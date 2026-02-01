import React, { useMemo, useRef, useState, useEffect } from "react";
import { PalaceCard } from "./components/PalaceCard";
import { UserManual } from "./components/UserManual";
import { PricingModal } from "./components/PricingModal";
import { RedeemCodeModal } from "./components/RedeemCodeModal";
import { AuthModal } from "./components/AuthModal";
import { SidebarSheet } from "./components/SidebarSheet";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { calculatePalace } from "./core.logic";
import { PalaceResult } from "./types";
import { generateDivinationPrompt, getCurrentDateTimeInfo } from "./prompts.config";
import { getTranslation, type Language } from "./i18n/translations";
import { callGeminiAPI as callGeminiAPIService, confirmCheckout, createCheckout, getQuota, getUserStatus, me } from "./services/api";
import { QuotaManager, PLAN_CONFIG, type UserQuota } from "./services/quota";

const TITLES = ["大安", "留连", "速喜", "赤口", "小吉", "空亡"];
const ELEMENTS = ["木", "火", "土", "金", "水", "天空"];
const SHICHEN_NAMES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const ANIMAL_MAP: Record<string, string> = {
  子: "玄武",
  丑: "勾陈",
  寅: "青龙",
  卯: "青龙",
  辰: "勾陈",
  巳: "朱雀",
  午: "朱雀",
  未: "腾蛇",
  申: "白虎",
  酉: "白虎",
  戌: "腾蛇",
  亥: "玄武",
};

// 核心数据映射已移至 core.logic.ts（私有文件）

const GRID_ORDER = [1, 2, 3, 0, 5, 4];

export default function App() {
  // 语言状态
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('preferred_language') as Language) || 'zh';
  });
  const t = getTranslation(language);

  const [x1, setX1] = useState("");
  const [x2, setX2] = useState("");
  const [result, setResult] = useState<PalaceResult[] | null>(null);
  const [error, setError] = useState("");
  
  // AI解卦相关状态
  const [question, setQuestion] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [showRawAiResponse, setShowRawAiResponse] = useState<boolean>(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  type ChatMsg = { id: string; role: 'user' | 'assistant'; content: string; createdAt: number };
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);

  const isLoggedIn = useMemo(() => {
    const t = localStorage.getItem('session_token');
    return Boolean(t);
  }, [authedEmail]);

  // 付费功能状态
  const [userQuota, setUserQuota] = useState<UserQuota>(QuotaManager.getQuota());
  const [showPricing, setShowPricing] = useState(false);
  const [showRedeemCode, setShowRedeemCode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authedEmail, setAuthedEmail] = useState<string | null>(null);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  // 加载时更新额度
  useEffect(() => {
    setUserQuota(QuotaManager.getQuota());

    // 如果存在付费 token，则向服务端同步一次真实剩余次数
    const userToken = localStorage.getItem('user_token') || 'free';
    if (userToken && userToken !== 'free') {
      getUserStatus().then((status: unknown) => {
        if (status && typeof status === 'object' && 'ok' in status && (status as any).ok && 'plan' in status) {
          QuotaManager.setQuotaFromServer({
            plan: (status as any).plan,
            total: Number((status as any).total || 0),
            remaining: Number((status as any).remaining || 0),
            activatedAt: (status as any).activatedAt || null,
          });
          setUserQuota(QuotaManager.getQuota());
        }
      }).catch(() => {
        // ignore
      });
    }

    // Load current user (for showing login state)
    me().then((r) => {
      if (r.ok && r.user?.email) setAuthedEmail(r.user.email);
    }).catch(() => {});

    // Promotion: sync monthly quota for logged-in users
    getQuota().then((q) => {
      if (q.ok && q.plan && typeof q.total === 'number' && typeof q.remaining === 'number') {
        QuotaManager.setQuotaFromServer({ plan: q.plan, total: q.total, remaining: q.remaining });
        setUserQuota(QuotaManager.getQuota());
      }
    }).catch(() => {});

    // Handle payment confirmation after redirect
    try {
      const params = new URLSearchParams(window.location.search);
      const pay = params.get('pay');
      const sessionId = params.get('session_id');
      if (pay === 'success' && sessionId) {
        confirmCheckout(sessionId).then((r) => {
          if (r.ok && r.plan && typeof r.total === 'number' && typeof r.remaining === 'number') {
            QuotaManager.setQuotaFromServer({
              plan: r.plan,
              total: r.total,
              remaining: r.remaining,
            });
            setUserQuota(QuotaManager.getQuota());
            alert(`支付成功，已到账 ${r.added ?? 0} 次额度`);
          } else {
            alert(r.message || '支付确认失败');
          }
        }).catch(() => {
          alert('支付确认失败');
        });
      }
    } catch {
      // ignore
    }
  }, []);

  // 切换语言
  const toggleLanguage = () => {
    const newLang: Language = language === 'zh' ? 'en' : 'zh';
    setLanguage(newLang);
    localStorage.setItem('preferred_language', newLang);
  };

  const handleCalculate = () => {
    if (!x1 || !x2) return;

    const x1Value = Number(x1);
    const x2Value = Number(x2);

    if (Number.isNaN(x1Value) || x1Value < 1 || x1Value > 30) {
      setError(t.form.errorX1Range);
      setResult(null);
      return;
    }

    setError("");

    // 调用核心排盘算法（来自 core.logic.ts）
    const orderedResult = calculatePalace(
      x1Value,
      x2Value,
      TITLES,
      ELEMENTS,
      SHICHEN_NAMES,
      ANIMAL_MAP,
      GRID_ORDER
    );

    setResult(orderedResult);
  };

  // 生成排盘描述文本
  const generatePalaceDescription = (): string => {
    if (!result) return '';
    
    const selfPalace = result.find(p => p.labelSelf);
    const descriptions = result.map(p => {
      const relText = p.relation ? `【${p.relation}】` : p.labelSelf ? '【自身】' : '';
      return `${p.title}宫：${p.element}、${p.shichen}、${p.animal}、${p.wuxing} ${relText}`;
    });
    
    return `当前排盘结果：\n${descriptions.join('\n')}\n\n自身宫位：${selfPalace?.title}宫（${selfPalace?.wuxing}）`;
  };

  // 刷新额度显示
  const refreshQuota = () => {
    setUserQuota(QuotaManager.getQuota());
  };

  // API调用已迁移到 services/api.ts（使用Vercel后端代理）

  // AI解卦
  const handleAIDivination = async () => {
    if (!question.trim()) {
      alert(t.ai.alertNoQuestion);
      return;
    }

    if (!result) {
      alert(t.ai.alertNoResult);
      return;
    }

    // ✅ 检查额度
    const currentQuota = QuotaManager.getQuota();
    if (currentQuota.remaining <= 0) {
      alert(
        currentQuota.plan === 'free'
          ? '今日免费额度已用完！\n\n升级套餐享受更多次数 →'
          : '您的解卦次数已用完！\n\n请购买新套餐继续使用 →'
      );
      setShowPricing(true);
      return;
    }

    setIsAiLoading(true);
    setAiResponse('');

    try {
      // Used by backend to persist chat history (best-effort)
      localStorage.setItem('mysterious_last_question', question.trim());
      localStorage.setItem('guest_mode', localStorage.getItem('session_token') ? '0' : (localStorage.getItem('guest_mode') || '1'));

      const userMsg: ChatMsg = {
        id: `u-${Date.now()}`,
        role: 'user',
        content: question.trim(),
        createdAt: Date.now(),
      };
      setChatMessages((prev) => [...prev, userMsg]);

      const selfPalace = result.find(p => p.labelSelf);
      if (!selfPalace) {
        throw new Error('未找到自身宫位');
      }

      // 获取当前日期和时辰
      const { date: currentDate, shichen: currentShichen } = getCurrentDateTimeInfo(language);

      // 格式化排盘结果（翻译宫位和关系名称）
      const palaceList = result.map(p => {
        const relationKey = p.relation as keyof typeof t.relations | undefined;
        const relText = relationKey ? `【${t.relations[relationKey]}】` : 
                       p.labelSelf ? `【${t.relations.自身}】` : '';
        const palaceKey = p.title as keyof typeof t.palaces;
        const elementKey = p.element as keyof typeof t.elements;
        const animalKey = p.animal as keyof typeof t.animals;
        
        return `* **${t.palaces[palaceKey]}：** ${t.elements[elementKey]}、${p.shichen}、${t.animals[animalKey]}、${p.wuxing} ${relText}`;
      });

      // 使用 prompts.config.ts 中的专业 prompt，传入语言参数
      const prompt = generateDivinationPrompt(
        question,
        palaceList,
        { title: selfPalace.title, wuxing: selfPalace.wuxing },
        currentDate,
        currentShichen,
        language
      );

      // 调用Vercel API（保护API Key）
      const userToken = localStorage.getItem('user_token') || 'free';
      const data = await callGeminiAPIService(prompt, userToken);

      // ✅ 以服务端返回为准刷新额度（避免前端本地“扣两次/不一致”）
      QuotaManager.setQuotaFromServer({
        plan: data.plan,
        total: typeof data.total === 'number' ? data.total : (data.plan === 'free' ? 3 : userQuota.total),
        remaining: data.remaining,
      });
      refreshQuota();

      setAiResponse(data.result);
      setShowRawAiResponse(false);

      const assistantMsg: ChatMsg = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: data.result,
        createdAt: Date.now(),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error('AI解卦错误:', error);
      setAiResponse(`${t.ai.errorPrefix}${error instanceof Error ? error.message : '未知错误'}${t.ai.errorSuffix}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    // Auto-scroll chat window to bottom
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [chatMessages.length, isAiLoading]);

  const handleCopyAiResponse = async () => {
    try {
      if (!aiResponse) return;
      await navigator.clipboard.writeText(aiResponse);
      alert(language === 'en' ? 'Copied.' : '已复制到剪贴板');
    } catch {
      try {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = aiResponse;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert(language === 'en' ? 'Copied.' : '已复制到剪贴板');
      } catch {
        alert(language === 'en' ? 'Copy failed.' : '复制失败，请手动复制');
      }
    }
  };

  // 处理套餐选择
  const handleSelectPlan = async (planId: string) => {
    setShowPricing(false);
    const session = localStorage.getItem('session_token');
    if (!session) {
      setPendingPlanId(planId);
      setShowAuth(true);
      return;
    }
    const r = await createCheckout(planId);
    if (!r.ok || !r.url) {
      alert(r.message || '下单失败');
      return;
    }
    window.location.href = r.url;
  };

  // 兑换成功后刷新
  const handleRedeemSuccess = () => {
    refreshQuota();
  };

  const isFormReady = Boolean(x1 && x2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-2 text-stone-600">
            <a 
              href="https://lexaverse.dev" 
              className="hover:text-amber-600 transition-colors font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              LEXAVERSE
            </a>
            <span className="text-stone-400">/</span>
            <span className="text-stone-800 font-semibold">{t.nav.title}</span>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* 语言切换按钮 */}
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 rounded-lg bg-white/80 border border-stone-300 hover:border-amber-500 transition-all duration-200 text-stone-700 font-medium flex items-center gap-2"
              title={language === 'zh' ? 'Switch to English' : '切换到中文'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              {language === 'zh' ? 'EN' : '中文'}
            </button>

            <button
              onClick={() => setShowAuth(true)}
              className="px-4 py-2 rounded-lg bg-white/80 border border-stone-300 hover:border-amber-500 transition-all duration-200 text-stone-700 font-medium"
              title={authedEmail ? authedEmail : '登录/注册'}
            >
              {authedEmail ? '已登录' : '登录'}
            </button>
            
            {language === 'zh' && <UserManual />}
          </div>
        </div>

        <header className="text-center mb-16">
          <h1 className="text-stone-800 tracking-wide">{t.nav.title}</h1>
          <p className="text-stone-500 mt-4">{t.nav.subtitle}</p>
        </header>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-stone-200/50 p-8 mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <Label htmlFor="x1" className="text-stone-700">
                  {t.form.x1Label}
                </Label>
                <Input
                  id="x1"
                  type="number"
                  min="1"
                  max="30"
                  value={x1}
                  onChange={(event) => setX1(event.target.value)}
                  placeholder={t.form.x1Placeholder}
                  className="border-stone-300 focus:border-amber-600 focus:ring-amber-600/20"
                  aria-invalid={error ? "true" : "false"}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="x2" className="text-stone-700">
                  {t.form.x2Label}
                </Label>
                <select
                  id="x2"
                  value={x2}
                  onChange={(event) => setX2(event.target.value)}
                  className="border border-stone-300 rounded-md px-3 py-2 w-full bg-white text-stone-700 focus:border-amber-600 focus:ring-amber-600/20"
                >
                  <option value="" disabled>
                    {t.form.x2Placeholder}
                  </option>
                  {t.hours.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                id="calculate-btn"
                onClick={handleCalculate}
                disabled={!isFormReady}
                className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-6 shadow-lg shadow-amber-900/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {t.form.calculateButton}
              </Button>
            </div>
          </div>
        </div>

        {result ? (
          <div id="result-grid" className="grid grid-cols-3 gap-6">
            {result.map((palace, index) => (
              <PalaceCard
                key={`${palace.title}-${index}`}
                title={palace.title}
                element={palace.element}
                shichen={palace.shichen}
                animal={palace.animal}
                wuxing={palace.wuxing}
                relation={palace.relation}
                labelSelf={palace.labelSelf}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-stone-500 text-lg max-w-4xl mx-auto">{t.form.emptyResult}</p>
          </div>
        )}

        {/* 中式分隔符 */}
        {result && (
          <div style={{ paddingTop: '36px', paddingBottom: '36px' }} className="flex flex-col items-center">
            {/* 装饰性分割线 */}
            <div className="w-full max-w-2xl relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t-2 border-gradient"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="bg-gradient-to-r from-amber-400 via-amber-600 to-amber-400 h-1 w-64 rounded-full opacity-60"></div>
              </div>
            </div>
            {/* 向下箭头 */}
            <div className="mt-8 animate-bounce">
              <svg className="w-10 h-10 text-amber-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
            <p className="mt-4 text-base text-stone-600 tracking-wide font-medium">{t.ai.dividerText}</p>
          </div>
        )}

        {/* AI解卦区域 */}
        {result && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-center text-stone-800 mb-6">
              {t.ai.title}
            </h3>

            {/* 额度显示和付费按钮 */}
            <div className="flex justify-center items-stretch gap-3 flex-wrap mb-8">
              {/* 侧滑菜单按钮（移动端优先） */}
              <button
                onClick={() => setShowSidebar(true)}
                className="px-4 py-3.5 rounded-2xl bg-white border-2 border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 text-stone-800 justify-center"
                title="菜单"
              >
                <span className="text-lg">☰</span>
                <span className="text-base font-semibold hidden sm:inline">菜单</span>
              </button>

              {/* 额度显示 */}
              <div className="px-6 py-3.5 rounded-2xl bg-white border-2 border-stone-200 flex items-center gap-3 shadow-sm hover:shadow-md transition-all duration-200 min-w-[180px]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <span className="text-2xl">💎</span>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="text-xs text-stone-500 font-medium mb-0.5">
                    {PLAN_CONFIG[userQuota.plan].name}
                  </div>
                  <div className="text-stone-800 font-bold text-base">
                    剩余 <span className="text-amber-600">{userQuota.remaining}</span>/{userQuota.total} 次
                  </div>
                </div>
              </div>

              {/* 兑换码按钮 */}
              <button
                onClick={() => setShowRedeemCode(true)}
                className="px-6 py-3.5 rounded-2xl bg-white border-2 border-stone-200 hover:border-purple-300 hover:bg-purple-50 font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2.5 text-stone-800 min-w-[140px] justify-center"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <span className="text-lg">🎟️</span>
                </div>
                <span className="text-base">兑换码</span>
              </button>

              {/* 历史对话按钮（需要登录后才有内容） */}
              <button
                onClick={() => setShowSidebar(true)}
                className="px-6 py-3.5 rounded-2xl bg-white border-2 border-stone-200 hover:border-blue-300 hover:bg-blue-50 font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2.5 text-stone-800 min-w-[140px] justify-center"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <span className="text-lg">🗂️</span>
                </div>
                <span className="text-base">历史</span>
              </button>

              {/* 升级套餐按钮 */}
              {userQuota.plan === 'free' && (
                <button
                  onClick={() => setShowPricing(true)}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 font-bold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2.5 min-w-[160px] justify-center relative overflow-hidden"
                  style={{ color: '#000000' }}
                >
                  <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity"></div>
                  <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-lg">⚡</span>
                  </div>
                  <span className="text-base relative z-10">升级套餐</span>
                  <div className="absolute -right-1 -top-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                  <div className="absolute -right-1 -top-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </button>
              )}
            </div>

            {/* 问题输入区域 */}
            <div className="rounded-xl border border-stone-200 bg-white/70 shadow-sm overflow-hidden">
              {/* Chat window */}
              <div
                ref={chatScrollRef}
                className="max-h-[55vh] md:max-h-[60vh] overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-stone-50 to-white"
              >
                {!chatMessages.length && (
                  <div className="text-sm text-stone-600">
                    {isLoggedIn ? '已登录：本月 10 次免费（白名单不计费）。' : '游客模式：每天最多 3 次（不保存历史）。'}
                  </div>
                )}
                {chatMessages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[92%] md:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-amber-100 border border-amber-200 text-stone-900'
                          : 'bg-white border border-stone-200 text-stone-900'
                      }`}
                    >
                      {m.role === 'assistant' && !showRawAiResponse ? (
                        <div
                          className="break-words"
                          style={{ lineHeight: '1.8' }}
                          dangerouslySetInnerHTML={{
                            __html: m.content
                              .replace(/\n{3,}/g, '\n\n')
                              .replace(/\n*(###\s+.*?)(?=\n|$)/g, '\n\n<h3 class="text-base font-bold text-purple-900 mt-4 mb-2">$1</h3>')
                              .replace(/<h3 class="text-base font-bold text-purple-900 mt-4 mb-2">###\s+(.*?)<\/h3>/g, '<h3 class="text-base font-bold text-purple-900 mt-4 mb-2">$1</h3>')
                              .replace(/\*\*\*\*(.*?)\*\*\*\*/g, '<strong class="font-bold text-red-600">$1</strong>')
                              .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-stone-900">$1</strong>')
                              .replace(/^\* (.*?)$/gm, '<li class="ml-5 my-1 list-disc">$1</li>')
                              .replace(/---/g, '<hr class="my-4 border-purple-200" />')
                              .replace(/\n\n/g, '</p><p class="mb-2">')
                              .replace(/\n/g, '<br />')
                              .replace(/^/, '<p class="mb-2">')
                              .replace(/$/, '</p>')
                              .replace(/<p class="mb-2"><\/p>/g, ''),
                          }}
                        />
                      ) : (
                        <pre className="whitespace-pre-wrap break-words font-sans">{m.content}</pre>
                      )}
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="text-sm text-stone-500">AI 解卦中...</div>
                )}
              </div>

              {/* Composer */}
              <div className="p-3 border-t border-stone-200 bg-white">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label className="sr-only">{t.ai.questionLabel}</Label>
                    <textarea
                      placeholder={t.ai.questionPlaceholder}
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none text-stone-700 leading-relaxed text-base"
                    />
                    <p className="mt-2 text-xs text-stone-500">{t.ai.hourlyHint}</p>
                  </div>
                  <Button
                    onClick={handleAIDivination}
                    disabled={isAiLoading || !question}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl px-5 py-3"
                  >
                    {isAiLoading ? '发送中…' : (language === 'en' ? 'Send' : '发送')}
                  </Button>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowRawAiResponse((v) => !v)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 hover:bg-stone-200 transition-colors text-stone-800 font-semibold"
                  >
                    {showRawAiResponse ? (language === 'en' ? 'Formatted' : '格式化') : (language === 'en' ? 'Raw' : '原文')}
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyAiResponse}
                    className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 hover:bg-stone-200 transition-colors text-stone-800 font-semibold"
                  >
                    {language === 'en' ? 'Copy last' : '复制最后一条'}
                  </button>
                </div>
              </div>
            </div>

            {/* 太极图加载动画 */}
            {isAiLoading && (
              <div className="flex flex-col items-center justify-center py-12 mb-8">
                {/* 太极图SVG动画 */}
                <div className="relative w-24 h-24">
                  <svg className="animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    {/* 外圈 */}
                    <circle cx="50" cy="50" r="48" fill="none" stroke="#d97706" strokeWidth="2" opacity="0.3"/>
                    
                    {/* 太极阴阳 */}
                    <g>
                      {/* 阳（白色半圆） */}
                      <path d="M 50 2 A 48 48 0 0 1 50 98 A 24 24 0 0 1 50 50 A 24 24 0 0 0 50 2" fill="#ffffff" stroke="#000000" strokeWidth="1"/>
                      
                      {/* 阴（黑色半圆） */}
                      <path d="M 50 2 A 48 48 0 0 0 50 98 A 24 24 0 0 0 50 50 A 24 24 0 0 1 50 2" fill="#000000"/>
                      
                      {/* 阳中阴（黑点） */}
                      <circle cx="50" cy="26" r="6" fill="#000000"/>
                      
                      {/* 阴中阳（白点） */}
                      <circle cx="50" cy="74" r="6" fill="#ffffff"/>
                    </g>
                    
                    {/* 八卦符号环绕 */}
                    <g className="animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse', transformOrigin: 'center' }}>
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                        <text 
                          key={i}
                          x="50" 
                          y="12" 
                          fontSize="8" 
                          fill="#d97706" 
                          textAnchor="middle" 
                          transform={`rotate(${angle} 50 50)`}
                        >
                          ☰
                        </text>
                      ))}
                    </g>
                  </svg>
                </div>
                
                {/* 加载文案 */}
                <p className="mt-6 text-xl font-semibold text-stone-700 tracking-wide animate-pulse">
                  {t.ai.loadingText}
                </p>
                <p className="mt-2 text-sm text-stone-500">
                  {t.ai.loadingSubtext}
                </p>
              </div>
            )}

            {/* 解卦结果显示 */}
            {aiResponse && !isAiLoading && (
              <div className="p-8 bg-gradient-to-br from-purple-50 to-amber-50 rounded-xl border border-purple-200/50 shadow-md">
                <div className="flex items-start justify-between gap-4 border-b border-purple-200 pb-3 mb-6 flex-wrap">
                  <h4 className="text-2xl font-bold text-purple-800 flex items-center gap-2">
                    {t.ai.resultTitle}
                  </h4>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRawAiResponse((v) => !v)}
                      className="px-3 py-1.5 rounded-lg bg-white/70 border border-stone-200 hover:bg-white transition-colors text-sm font-semibold text-stone-800"
                    >
                      {showRawAiResponse ? (language === 'en' ? 'Formatted' : '格式化') : (language === 'en' ? 'Raw' : '原文')}
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyAiResponse}
                      className="px-3 py-1.5 rounded-lg bg-white/70 border border-stone-200 hover:bg-white transition-colors text-sm font-semibold text-stone-800"
                    >
                      {language === 'en' ? 'Copy' : '复制'}
                    </button>
                  </div>
                </div>

                <div className="max-w-none max-h-[70vh] overflow-y-auto overflow-x-hidden pr-2">
                  {showRawAiResponse ? (
                    <pre className="whitespace-pre-wrap break-words text-stone-800 font-sans text-sm leading-relaxed">
                      {aiResponse}
                    </pre>
                  ) : (
                    <div
                      className="break-words text-stone-800 font-sans text-base"
                      style={{
                        lineHeight: '1.8',
                      }}
                      dangerouslySetInnerHTML={{
                        __html: aiResponse
                          // 先清理多余的连续换行（3个及以上换行统一为2个）
                          .replace(/\n{3,}/g, '\n\n')
                          // 处理标题（标题前加空行，标题后不加空行）
                          .replace(/\n*(###\s+.*?)(?=\n|$)/g, '\n\n<h3 class="text-xl font-bold text-purple-900 mt-8 mb-2">$1</h3>')
                          // 移除标题开头的###标记
                          .replace(/<h3 class="text-xl font-bold text-purple-900 mt-8 mb-2">###\s+(.*?)<\/h3>/g, '<h3 class="text-xl font-bold text-purple-900 mt-8 mb-2">$1</h3>')
                          // 处理粗体（四星和双星）
                          .replace(/\*\*\*\*(.*?)\*\*\*\*/g, '<strong class="font-bold text-red-600">$1</strong>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-stone-900">$1</strong>')
                          // 处理列表
                          .replace(/^\* (.*?)$/gm, '<li class="ml-6 my-1 list-disc">$1</li>')
                          // 处理分隔线
                          .replace(/---/g, '<hr class="my-6 border-purple-200" />')
                          // 处理段落（双换行 = 段落间距）
                          .replace(/\n\n/g, '</p><p class="mb-3">')
                          // 处理单换行
                          .replace(/\n/g, '<br />')
                          // 包裹在段落标签中
                          .replace(/^/, '<p class="mb-3">')
                          .replace(/$/, '</p>')
                          // 清理可能的空段落
                          .replace(/<p class="mb-3"><\/p>/g, '')
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 付费功能弹窗 */}
        <PricingModal
          open={showPricing}
          onClose={() => setShowPricing(false)}
          onSelectPlan={handleSelectPlan}
        />

        <RedeemCodeModal
          open={showRedeemCode}
          onClose={() => setShowRedeemCode(false)}
          onSuccess={handleRedeemSuccess}
        />

        <SidebarSheet
          open={showSidebar}
          onClose={() => setShowSidebar(false)}
          authedEmail={authedEmail}
          onOpenAuth={() => setShowAuth(true)}
          onLogout={() => {
            localStorage.removeItem('session_token');
            setAuthedEmail(null);
            // keep guest_mode on
            localStorage.setItem('guest_mode', '1');
          }}
          onLoad={({ question, answer }) => {
            setQuestion(question);
            setAiResponse(answer);
            setChatMessages([
              { id: `u-${Date.now()}-h`, role: 'user', content: question, createdAt: Date.now() },
              { id: `a-${Date.now()}-h`, role: 'assistant', content: answer, createdAt: Date.now() },
            ]);
            setShowRawAiResponse(false);
          }}
        />

        <AuthModal
          open={showAuth}
          onClose={() => setShowAuth(false)}
          onAuthed={() => {
            me().then((r) => {
              if (r.ok && r.user?.email) setAuthedEmail(r.user.email);
            }).catch(() => {});
            if (pendingPlanId) {
              const planId = pendingPlanId;
              setPendingPlanId(null);
              handleSelectPlan(planId);
            }
          }}
        />
      </div>
    </div>
  );
}
