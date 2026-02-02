import React, { useMemo, useRef, useState, useEffect } from "react";
import { PalaceCard } from "./components/PalaceCard";
import { UserManual } from "./components/UserManual";
import { PricingModal } from "./components/PricingModal";
import { RedeemCodeModal } from "./components/RedeemCodeModal";
import { AuthModal } from "./components/AuthModal";
import { SidebarSheet } from "./components/SidebarSheet";
import { AIDivinationModal } from "./components/AIDivinationModal";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { calculatePalace } from "./core.logic";
import { PalaceResult } from "./types";
import { generateDivinationPrompt, getCurrentDateTimeInfo } from "./prompts.config";
import { getTranslation, type Language } from "./i18n/translations";
import { callGeminiAPI as callGeminiAPIService, confirmCheckout, createCheckout, getQuota, getUserStatus, me } from "./services/api";
import { QuotaManager, type UserQuota } from "./services/quota";
import { Menu, Globe, User, Sparkles, MessageCircle } from "lucide-react";

// 主题颜色常量
const GOLD = "#d4af37";
const GOLD_LIGHT = "#f5d061";

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

const GRID_ORDER = [1, 2, 3, 0, 5, 4];

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('preferred_language') as Language) || 'zh';
  });
  const t = getTranslation(language);

  const [x1, setX1] = useState("");
  const [x2, setX2] = useState("");
  const [result, setResult] = useState<PalaceResult[] | null>(null);
  const [error, setError] = useState("");
  
  // AI 解卦相关状态
  const [showAIModal, setShowAIModal] = useState(false);
  const [question, setQuestion] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [showRawAiResponse, setShowRawAiResponse] = useState<boolean>(false);

  type ChatMsg = { id: string; role: 'user' | 'assistant'; content: string; createdAt: number };
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [notice, setNotice] = useState<{ type: 'info' | 'success' | 'error'; text: string } | null>(null);

  const showNotice = (type: 'info' | 'success' | 'error', text: string) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 4000);
  };

  const [userQuota, setUserQuota] = useState<UserQuota>(QuotaManager.getQuota());
  const [showPricing, setShowPricing] = useState(false);
  const [showRedeemCode, setShowRedeemCode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authedUser, setAuthedUser] = useState<{ email?: string; phone?: string } | null>(null);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  const isLoggedIn = useMemo(() => {
    const t = localStorage.getItem('session_token');
    return Boolean(t);
  }, [authedUser]);
  
  // 显示用户标识（优先显示手机号）
  const userDisplay = authedUser?.phone 
    ? authedUser.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    : authedUser?.email || null;

  useEffect(() => {
    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken) {
      const q = QuotaManager.getQuota();
      QuotaManager.setQuotaFromServer({
        plan: 'guest',
        total: 3,
        remaining: Math.min(Number(q.remaining || 0), 3) || 3,
      });
    }
    setUserQuota(QuotaManager.getQuota());

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
      }).catch(() => {});
    }

    me().then((r) => {
      if (r.ok && r.user) setAuthedUser(r.user);
    }).catch(() => {});

    getQuota().then((q) => {
      if (q.ok && q.plan && typeof q.total === 'number' && typeof q.remaining === 'number') {
        QuotaManager.setQuotaFromServer({ plan: q.plan, total: q.total, remaining: q.remaining });
        setUserQuota(QuotaManager.getQuota());
      }
    }).catch(() => {});

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
            showNotice('success', `支付成功，已到账 ${r.added ?? 0} 次额度`);
          } else {
            showNotice('error', r.message || '支付确认失败');
          }
        }).catch(() => {
          showNotice('error', '支付确认失败');
        });
      }
    } catch {}
  }, []);

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
    const orderedResult = calculatePalace(x1Value, x2Value, TITLES, ELEMENTS, SHICHEN_NAMES, ANIMAL_MAP, GRID_ORDER);
    setResult(orderedResult);
  };

  const refreshQuota = () => {
    setUserQuota(QuotaManager.getQuota());
  };

  // AI 解卦
  const handleAIDivination = async () => {
    if (!question.trim()) {
      showNotice('error', t.ai.alertNoQuestion);
      return;
    }

    if (!result) {
      showNotice('error', t.ai.alertNoResult);
      return;
    }

    const currentQuota = QuotaManager.getQuota();
    if (currentQuota.remaining <= 0) {
      if (currentQuota.plan === 'guest') {
        showNotice('info', '游客额度已用完（每天 3 次）。登录后可获得每月 10 次免费并保存历史。');
        setShowAuth(true);
      } else {
        showNotice('info', '本期额度已用完。购买套餐可继续使用（白名单不计费）。');
        setShowPricing(true);
      }
      return;
    }

    setIsAiLoading(true);
    setAiResponse('');

    try {
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

      const { date: currentDate, shichen: currentShichen } = getCurrentDateTimeInfo(language);

      const palaceList = result.map(p => {
        const relationKey = p.relation as keyof typeof t.relations | undefined;
        const relText = relationKey ? `【${t.relations[relationKey]}】` : 
                       p.labelSelf ? `【${t.relations.自身}】` : '';
        const palaceKey = p.title as keyof typeof t.palaces;
        const elementKey = p.element as keyof typeof t.elements;
        const animalKey = p.animal as keyof typeof t.animals;
        
        return `* **${t.palaces[palaceKey]}：** ${t.elements[elementKey]}、${p.shichen}、${t.animals[animalKey]}、${p.wuxing} ${relText}`;
      });

      const prompt = generateDivinationPrompt(question, palaceList, { title: selfPalace.title, wuxing: selfPalace.wuxing }, currentDate, currentShichen, language);

      const userToken = localStorage.getItem('user_token') || 'free';
      const data = await callGeminiAPIService(prompt, userToken);

      QuotaManager.setQuotaFromServer({
        plan: data.plan,
        total: typeof data.total === 'number' ? data.total : data.plan === 'free' ? 10 : data.plan === 'guest' ? 3 : userQuota.total,
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
      showNotice('error', error instanceof Error ? error.message : '未知错误');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopyAiResponse = async () => {
    try {
      if (!aiResponse) return;
      await navigator.clipboard.writeText(aiResponse);
      showNotice('success', language === 'en' ? 'Copied.' : '已复制到剪贴板');
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = aiResponse;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotice('success', language === 'en' ? 'Copied.' : '已复制到剪贴板');
      } catch {
        showNotice('error', language === 'en' ? 'Copy failed.' : '复制失败，请手动复制');
      }
    }
  };

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
      showNotice('error', r.message || '下单失败');
      return;
    }
    window.location.href = r.url;
  };

  const handleRedeemSuccess = () => {
    refreshQuota();
  };

  const isFormReady = Boolean(x1 && x2);

  // 打开 AI 解卦
  const openAIDivination = () => {
    if (!result) {
      showNotice('error', t.ai.alertNoResult);
      return;
    }
    setShowAIModal(true);
  };

  // 样式常量
  const btnStyle = {
    background: `linear-gradient(to right, ${GOLD}, ${GOLD_LIGHT})`,
    color: '#000',
  };

  return (
    <div className="min-h-screen bg-mystical py-12 px-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: `${GOLD}08` }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: `${GOLD}05` }} />
      </div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        {/* 全局提示 */}
        {notice && (
          <div 
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg"
            style={{
              backgroundColor: notice.type === 'success' ? 'rgba(20,83,45,0.9)' : notice.type === 'error' ? 'rgba(127,29,29,0.9)' : 'rgba(23,23,23,0.95)',
              color: notice.type === 'success' ? '#86efac' : notice.type === 'error' ? '#fca5a5' : GOLD,
              border: `1px solid ${notice.type === 'success' ? 'rgba(34,197,94,0.3)' : notice.type === 'error' ? 'rgba(239,68,68,0.3)' : `${GOLD}4d`}`,
            }}
          >
            {notice.text}
          </div>
        )}

        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-wider" style={{ color: GOLD }}>MYSTERIOUS</span>
            <span className="text-stone-600">/</span>
            <span className="text-stone-200 font-medium">{t.nav.title}</span>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2.5 rounded-lg bg-stone-800/80 transition-all duration-300 text-stone-300 hover:text-amber-500"
              style={{ border: `1px solid ${GOLD}33` }}
              title="菜单"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={toggleLanguage}
              className="p-2.5 rounded-lg bg-stone-800/80 transition-all duration-300 text-stone-300 hover:text-amber-500 flex items-center gap-2"
              style={{ border: `1px solid ${GOLD}33` }}
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">{language === 'zh' ? 'EN' : '中文'}</span>
            </button>

            <button
              onClick={() => setShowAuth(true)}
              className="p-2.5 rounded-lg bg-stone-800/80 transition-all duration-300 text-stone-300 hover:text-amber-500 flex items-center gap-2"
              style={{ border: `1px solid ${GOLD}33` }}
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">{userDisplay || '登录'}</span>
            </button>
            
            {language === 'zh' && <UserManual />}
          </div>
        </div>

        <header className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-100 tracking-wide text-glow-gold">{t.nav.title}</h1>
          <p className="text-stone-400 mt-4 text-lg">{t.nav.subtitle}</p>
        </header>

        {/* 输入表单卡片 */}
        <div 
          className="glass-dark rounded-2xl p-8 mb-16 transition-all duration-500"
          style={{ border: `1px solid ${GOLD}33` }}
        >
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <Label htmlFor="x1" className="text-stone-300 font-medium">
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
                  style={{ backgroundColor: 'rgba(23,23,23,0.6)', borderColor: `${GOLD}33` }}
                  className="text-stone-100 placeholder:text-stone-600"
                />
                {error && <p className="text-sm text-red-400">{error}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="x2" className="text-stone-300 font-medium">
                  {t.form.x2Label}
                </Label>
                <select
                  id="x2"
                  value={x2}
                  onChange={(event) => setX2(event.target.value)}
                  className="rounded-lg px-3 py-2 w-full text-stone-100 focus:outline-none transition-colors"
                  style={{ backgroundColor: 'rgba(23,23,23,0.6)', border: `1px solid ${GOLD}33` }}
                >
                  <option value="" disabled style={{ backgroundColor: '#171717' }}>
                    {t.form.x2Placeholder}
                  </option>
                  {t.hours.map((option) => (
                    <option key={option.value} value={option.value} style={{ backgroundColor: '#171717' }}>
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
                className="font-bold px-12 py-6 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                style={btnStyle}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                {t.form.calculateButton}
              </Button>
            </div>
          </div>
        </div>

        {result ? (
          <>
            {/* 排盘结果标题 */}
            <div className="mb-6 text-center">
              <h2 
                className="text-xl font-bold tracking-wider"
                style={{ color: GOLD }}
              >
                六宫排盘结果
              </h2>
              <div 
                className="w-24 h-0.5 mx-auto mt-2 rounded-full"
                style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }}
              />
            </div>

            {/* 排盘结果 */}
            <div id="result-grid">
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
                  index={index}
                />
              ))}
            </div>

            {/* 分隔线 */}
            <div className="my-12 flex items-center justify-center gap-4">
              <div 
                className="flex-1 h-px"
                style={{ background: `linear-gradient(to right, transparent, ${GOLD}33)` }}
              />
              <Sparkles className="w-5 h-5" style={{ color: `${GOLD}66` }} />
              <div 
                className="flex-1 h-px"
                style={{ background: `linear-gradient(to left, transparent, ${GOLD}33)` }}
              />
            </div>

            {/* AI 解卦按钮 */}
            <div className="flex justify-center">
              <button
                onClick={openAIDivination}
                className="group relative px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 flex items-center gap-3 overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${GOLD}1a 0%, ${GOLD}33 50%, ${GOLD}1a 100%)`,
                  border: `2px solid ${GOLD}66`,
                  color: GOLD,
                  boxShadow: `0 0 30px ${GOLD}33`,
                }}
              >
                {/* 动态光效背景 */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ 
                    background: `linear-gradient(135deg, ${GOLD}33 0%, ${GOLD}4d 50%, ${GOLD}33 100%)`,
                  }}
                />
                
                {/* 脉冲光环 */}
                <div 
                  className="absolute inset-0 rounded-2xl animate-pulse-gold"
                  style={{ border: `2px solid ${GOLD}4d` }}
                />
                
                <div className="relative flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(to bottom right, ${GOLD}, ${GOLD_LIGHT})`,
                    }}
                  >
                    <MessageCircle className="w-5 h-5 text-black" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold tracking-wide">{t.ai.title}</div>
                    <div className="text-xs opacity-70 font-normal">点击开启 AI 智能解读</div>
                  </div>
                  <Sparkles className="w-5 h-5 ml-2 animate-pulse" />
                </div>
              </button>
            </div>

            {/* 底部留白 */}
            <div className="h-16"></div>
          </>
        ) : (
          <div className="text-center py-24">
            <div 
              className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${GOLD}1a, ${GOLD}0d)`,
                border: `1px solid ${GOLD}33`,
              }}
            >
              <Sparkles className="w-8 h-8" style={{ color: `${GOLD}66` }} />
            </div>
            <p className="text-stone-500 text-lg max-w-md mx-auto">{t.form.emptyResult}</p>
          </div>
        )}

        {/* AI 解卦弹窗 */}
        <AIDivinationModal
          open={showAIModal}
          onClose={() => setShowAIModal(false)}
          question={question}
          setQuestion={setQuestion}
          chatMessages={chatMessages}
          isAiLoading={isAiLoading}
          aiResponse={aiResponse}
          showRawAiResponse={showRawAiResponse}
          setShowRawAiResponse={setShowRawAiResponse}
          onSubmit={handleAIDivination}
          onCopy={handleCopyAiResponse}
          userQuota={userQuota}
          isLoggedIn={isLoggedIn}
          onOpenPricing={() => { setShowAIModal(false); setShowPricing(true); }}
          onOpenRedeem={() => { setShowAIModal(false); setShowRedeemCode(true); }}
          onOpenHistory={() => { setShowAIModal(false); setShowSidebar(true); }}
          language={language}
          t={t}
        />

        {/* 付费功能弹窗 */}
        <PricingModal
          open={showPricing}
          onClose={() => setShowPricing(false)}
          onSelectPlan={handleSelectPlan}
          onOpenRedeem={() => {
            setShowPricing(false);
            setShowRedeemCode(true);
          }}
        />

        <RedeemCodeModal
          open={showRedeemCode}
          onClose={() => setShowRedeemCode(false)}
          onSuccess={handleRedeemSuccess}
        />

        <SidebarSheet
          open={showSidebar}
          onClose={() => setShowSidebar(false)}
          authedUser={userDisplay}
          onOpenAuth={() => setShowAuth(true)}
          onLogout={() => {
            localStorage.removeItem('session_token');
            localStorage.removeItem('user_token');
            setAuthedUser(null);
            localStorage.setItem('guest_mode', '1');
            QuotaManager.setQuotaFromServer({ plan: 'guest', total: 3, remaining: 3 });
            setUserQuota(QuotaManager.getQuota());
          }}
          onLoad={({ question, answer }) => {
            setQuestion(question);
            setAiResponse(answer);
            setChatMessages([
              { id: `u-${Date.now()}-h`, role: 'user', content: question, createdAt: Date.now() },
              { id: `a-${Date.now()}-h`, role: 'assistant', content: answer, createdAt: Date.now() },
            ]);
            setShowRawAiResponse(false);
            setShowAIModal(true);
          }}
        />

        <AuthModal
          open={showAuth}
          onClose={() => setShowAuth(false)}
          onAuthed={() => {
            me().then((r) => {
              if (r.ok && r.user) setAuthedUser(r.user);
            }).catch(() => {});
            getQuota().then((q) => {
              if (q.ok && q.plan && typeof q.total === 'number' && typeof q.remaining === 'number') {
                QuotaManager.setQuotaFromServer({ plan: q.plan, total: q.total, remaining: q.remaining });
                setUserQuota(QuotaManager.getQuota());
              }
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
