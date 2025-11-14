import React, { useState } from "react";
import { PalaceCard } from "./components/PalaceCard";
import { UserManual } from "./components/UserManual";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { DEFAULT_API_KEY, DEFAULT_AI_MODEL } from "./config.local";
import { calculatePalace } from "./core.logic";
import { PalaceResult } from "./types";
import { generateDivinationPrompt, getCurrentDateTimeInfo } from "./prompts.config";

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

const HOURS = [
  { value: 1, label: "1 (子) 23:00-1:00" },
  { value: 2, label: "2 (丑) 1:00-3:00" },
  { value: 3, label: "3 (寅) 3:00-5:00" },
  { value: 4, label: "4 (卯) 5:00-7:00" },
  { value: 5, label: "5 (辰) 7:00-9:00" },
  { value: 6, label: "6 (巳) 9:00-11:00" },
  { value: 7, label: "7 (午) 11:00-13:00" },
  { value: 8, label: "8 (未) 13:00-15:00" },
  { value: 9, label: "9 (申) 15:00-17:00" },
  { value: 10, label: "10 (酉) 17:00-19:00" },
  { value: 11, label: "11 (戌) 19:00-21:00" },
  { value: 12, label: "12 (亥) 21:00-23:00" },
];

const GRID_ORDER = [1, 2, 3, 0, 5, 4];

export default function App() {
  const [x1, setX1] = useState("");
  const [x2, setX2] = useState("");
  const [result, setResult] = useState<PalaceResult[] | null>(null);
  const [error, setError] = useState("");
  
  // AI解卦相关状态
  const [aiModel, setAiModel] = useState<'gemini' | 'claude'>(DEFAULT_AI_MODEL);
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('ai_api_key') || DEFAULT_API_KEY;
  });
  const [question, setQuestion] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const handleCalculate = () => {
    if (!x1 || !x2) return;

    const x1Value = Number(x1);
    const x2Value = Number(x2);

    if (Number.isNaN(x1Value) || x1Value < 1 || x1Value > 30) {
      setError("X1 需要在 1-30 之间");
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

  // 调用Gemini API
  const callGeminiAPI = async (prompt: string): Promise<string> => {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      const errorMsg = data.error?.message || response.statusText || '未知错误';
      throw new Error(`Gemini API 错误: ${errorMsg}`);
    }

    return data.candidates[0]?.content?.parts[0]?.text || '无法获取回复';
  };

  // 调用Claude API
  const callClaudeAPI = async (prompt: string): Promise<string> => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      const errorMsg = data.error?.message || response.statusText || '未知错误';
      throw new Error(`Claude API 错误: ${errorMsg}`);
    }

    return data.content[0]?.text || '无法获取回复';
  };

  // AI解卦
  const handleAIDivination = async () => {
    if (!question.trim()) {
      alert('请输入您想问的问题！');
      return;
    }

    if (!result) {
      alert('请先完成排盘！');
      return;
    }

    setIsAiLoading(true);
    setAiResponse('');

    try {
      const selfPalace = result.find(p => p.labelSelf);
      if (!selfPalace) {
        throw new Error('未找到自身宫位');
      }

      // 获取当前日期和时辰
      const { date: currentDate, shichen: currentShichen } = getCurrentDateTimeInfo();

      // 格式化排盘结果
      const palaceList = result.map(p => {
        const relText = p.relation ? `【${p.relation}】` : p.labelSelf ? '【自身】' : '';
        return `* **${p.title}宫：** ${p.element}、${p.shichen}、${p.animal}、${p.wuxing} ${relText}`;
      });

      // 使用 prompts.config.ts 中的专业 prompt
      const prompt = generateDivinationPrompt(
        question,
        palaceList,
        { title: selfPalace.title, wuxing: selfPalace.wuxing },
        currentDate,
        currentShichen
      );

      const response = await callGeminiAPI(prompt);
      setAiResponse(response);
    } catch (error) {
      console.error('AI解卦错误:', error);
      setAiResponse(`解卦失败：${error instanceof Error ? error.message : '未知错误'}\n\n请检查网络连接是否正常。`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const isFormReady = Boolean(x1 && x2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Header */}
        <div className="flex justify-between items-center mb-8">
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
            <span className="text-stone-800 font-semibold">小六壬排盘</span>
          </div>
          <UserManual />
        </div>

        <header className="text-center mb-16">
          <h1 className="text-stone-800 tracking-wide">小六壬排盘</h1>
          <p className="text-stone-500 mt-4">输入 X1（1-30）和对应时辰，快速查看六宫落点、五行与神煞提示。</p>
        </header>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-stone-200/50 p-8 mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <Label htmlFor="x1" className="text-stone-700">
                  X1
                </Label>
                <Input
                  id="x1"
                  type="number"
                  min="1"
                  max="30"
                  value={x1}
                  onChange={(event) => setX1(event.target.value)}
                  placeholder="1-30"
                  className="border-stone-300 focus:border-amber-600 focus:ring-amber-600/20"
                  aria-invalid={error ? "true" : "false"}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>

              <div className="space-y-3">
                <Label htmlFor="x2" className="text-stone-700">
                  时辰 (X2)
                </Label>
                <select
                  id="x2"
                  value={x2}
                  onChange={(event) => setX2(event.target.value)}
                  className="border border-stone-300 rounded-md px-3 py-2 w-full bg-white text-stone-700 focus:border-amber-600 focus:ring-amber-600/20"
                >
                  <option value="" disabled>
                    选择对应时辰
                  </option>
                  {HOURS.map((option) => (
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
                开始排盘
              </Button>
            </div>
          </div>
        </div>

        <div id="result-grid" className="grid grid-cols-3 gap-6">
          {result ? (
            result.map((palace, index) => (
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
            ))
          ) : (
            <div className="col-span-3 text-center py-20 text-stone-400">
              <p>输入完成后点击「开始排盘」查看六宫结果</p>
            </div>
          )}
        </div>

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
            <p className="mt-4 text-base text-stone-600 tracking-wide font-medium">继续向下，开启AI智能解卦</p>
          </div>
        )}

        {/* AI解卦区域 */}
        {result && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-center text-stone-800 mb-6">
              🔮 AI智能解卦
            </h3>

            {/* 问题输入区域 */}
            <div className="mb-8">
              <Label className="text-stone-700 mb-3 block font-semibold">您想问什么问题？</Label>
              <textarea
                placeholder={'请集中精神，一事一问。例如："今日财运如何？"、"我和TA的感情走向？"、"这份工作能成吗？"\n\n小六壬善断"当下"和"短期"吉凶，请把问题问得越具体越好。'}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                className="w-full px-6 py-5 border-2 border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none text-stone-700 leading-relaxed text-base shadow-sm"
              />
            </div>

            {/* 解卦按钮 */}
            <div className="flex justify-center mb-8">
              <Button
                onClick={handleAIDivination}
                disabled={isAiLoading || !question}
                style={{ 
                  backgroundColor: isAiLoading || !question ? '#e5e7eb' : '#FFFBEB',
                  color: '#000000',
                  border: '2px solid #f59e0b'
                }}
                className="hover:bg-amber-100 font-bold px-12 py-6 text-xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 rounded-xl"
              >
                {isAiLoading ? (
                  <span className="flex items-center gap-3">
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    正在解卦中...
                  </span>
                ) : '✨ 开始AI解卦'}
              </Button>
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
                  卦象已成，洞察天机中...
                </p>
                <p className="mt-2 text-sm text-stone-500">
                  AI大师正在为您解读卦象
                </p>
              </div>
            )}

            {/* 解卦结果显示 */}
            {aiResponse && !isAiLoading && (
              <div className="p-8 bg-gradient-to-br from-purple-50 to-amber-50 rounded-xl border border-purple-200/50 shadow-md">
                <h4 className="text-2xl font-bold text-purple-800 mb-6 flex items-center gap-2 border-b border-purple-200 pb-3">
                  📖 卦象解析
                </h4>
                <div className="max-w-none overflow-hidden">
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
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
