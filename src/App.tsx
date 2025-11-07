import { useState } from "react";
import { PalaceCard } from "./components/PalaceCard";
import { UserManual } from "./components/UserManual";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";
import { Globe } from "lucide-react";

const TITLES = ["大安", "流连", "速喜", "赤口", "小吉", "空亡"];
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

interface PalaceResult {
  title: string;
  element: string;
  shichen: string;
  animal: string;
  labelSelf?: string;
}

export default function App() {
  const [x1, setX1] = useState("");
  const [x2, setX2] = useState("");
  const [result, setResult] = useState<PalaceResult[] | null>(null);
  const [error, setError] = useState("");

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

    const x1PosIndex = (x1Value - 1) % 6;
    const x2PosIndex = (x1PosIndex + x2Value - 1) % 6;
    const selfShichenIndex = x2Value - 1;

    const palaces = TITLES.map((title, index) => {
      const elementIndex = (index - x1PosIndex + 6) % 6;
      const shichenOffset = index - x2PosIndex + 6;
      const palaceShichenIndex = (selfShichenIndex + shichenOffset * 2) % 12;
      const shichenBranch = SHICHEN_NAMES[palaceShichenIndex];

      return {
        title,
        element: ELEMENTS[elementIndex],
        shichen: `${shichenBranch}时`,
        animal: ANIMAL_MAP[shichenBranch],
        labelSelf: index === x2PosIndex ? "自身" : "",
      };
    });

    const orderedResult = GRID_ORDER.map((idx) => palaces[idx]);
    setResult(orderedResult);
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
            <a
              href="https://lexaverse.dev"
              className="ml-2 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-amber-600 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
              title="Back to LEXAVERSE"
            >
              <Globe className="h-4 w-4" />
            </a>
          </div>
          <UserManual />
        </div>

        <header className="text-center mb-16">
          <h1 className="text-stone-800 tracking-wide">小六壬排盘</h1>
          <p className="text-stone-500 mt-4">输入 X1（1-30）和对应时辰，快速查看六宫落点、五行与神兽提示。</p>
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
                labelSelf={palace.labelSelf}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-20 text-stone-400">
              <p>输入完成后点击「开始排盘」查看六宫结果</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
