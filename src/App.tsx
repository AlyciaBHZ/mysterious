import { useState } from "react";
import { PalaceCard } from "./components/PalaceCard";
import { UserManual } from "./components/UserManual";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";

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

// 时辰对应五行
const WUXING_MAP: Record<string, string> = {
  子: "水",
  亥: "水",
  寅: "木",
  卯: "木",
  巳: "火",
  午: "火",
  申: "金",
  酉: "金",
  丑: "土",
  辰: "土",
  未: "土",
  戌: "土",
};

// 兄弟宫规则（当自身不是土时）
const XIONGDI_MAP: Record<string, string> = {
  子: "辰",
  午: "戌",
  卯: "未",
  酉: "丑",
  寅: "辰",
  申: "戌",
  巳: "未",
  亥: "丑",
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
  wuxing: string;
  shichenBranch: string;
  relation?: string;
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

    const palaces: PalaceResult[] = TITLES.map((title, index) => {
      const elementIndex = (index - x1PosIndex + 6) % 6;
      const shichenOffset = index - x2PosIndex + 6;
      const palaceShichenIndex = (selfShichenIndex + shichenOffset * 2) % 12;
      const shichenBranch = SHICHEN_NAMES[palaceShichenIndex];

      return {
        title,
        element: ELEMENTS[elementIndex],
        shichen: `${shichenBranch}时`,
        animal: ANIMAL_MAP[shichenBranch],
        wuxing: WUXING_MAP[shichenBranch],
        shichenBranch, // 保存时辰地支用于关系计算
        labelSelf: index === x2PosIndex ? "自身" : "",
        relation: undefined,
      };
    });

    // 计算宫位关系
    const selfPalace = palaces[x2PosIndex];
    const selfWuxing = selfPalace.wuxing;
    const selfShichen = selfPalace.shichenBranch;

    // 五行生克关系
    const shengKeMap: Record<string, { parent: string; child: string; wife: string; ghost: string }> = {
      木: { parent: "水", child: "火", wife: "土", ghost: "金" },
      火: { parent: "木", child: "土", wife: "金", ghost: "水" },
      土: { parent: "火", child: "金", wife: "水", ghost: "木" },
      金: { parent: "土", child: "水", wife: "木", ghost: "火" },
      水: { parent: "金", child: "木", wife: "火", ghost: "土" },
    };

    const relations = shengKeMap[selfWuxing];
    const tuGongs = palaces.filter((p) => p.wuxing === "土" && p.shichenBranch !== selfShichen);

    // 第一步：确定兄弟宫（特殊规则）
    let xiongdiShichen: string | null = null;

    if (selfWuxing === "土") {
      // 自身是土，另一个土是兄弟
      if (tuGongs.length > 0) {
        xiongdiShichen = tuGongs[0].shichenBranch;
      }
    } else {
      // 自身不是土，兄弟宫按特殊规则确定
      xiongdiShichen = XIONGDI_MAP[selfShichen];
    }

    // 第二步：为每个宫位标注关系（按顺序，确保每个宫位只被标记一次）
    palaces.forEach((palace) => {
      if (palace.shichenBranch === selfShichen) {
        palace.relation = undefined; // 自身不显示关系文字
      } else if (palace.shichenBranch === xiongdiShichen) {
        palace.relation = "兄弟";
      } else if (palace.wuxing === relations.parent) {
        palace.relation = "父母";
      } else if (palace.wuxing === relations.child) {
        palace.relation = "子孙";
      } else if (palace.wuxing === relations.wife) {
        palace.relation = "妻财";
      } else if (palace.wuxing === relations.ghost) {
        palace.relation = "官鬼";
      }
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
      </div>
    </div>
  );
}
