import { useState } from 'react';
import { PalaceCard } from './components/PalaceCard';
import { UserManual } from './components/UserManual';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Button } from './components/ui/button';

interface Palace {
  name: string;
  element: string;
  time: string;
  guardian: string;
}

interface PalaceWithLabels extends Palace {
  labels: string[];
}

const palaces: Palace[] = [
  { name: '大安', element: '木', time: '戌时', guardian: '青龙' },
  { name: '流连', element: '水', time: '亥时', guardian: '玄武' },
  { name: '速喜', element: '火', time: '午时', guardian: '朱雀' },
  { name: '赤口', element: '金', time: '酉时', guardian: '白虎' },
  { name: '小吉', element: '木', time: '辰时', guardian: '六合' },
  { name: '空亡', element: '土', time: '未时', guardian: '腾蛇' },
];

const hours = [
  { value: 1, label: '1 (子) 23:00-1:00' },
  { value: 2, label: '2 (丑) 1:00-3:00' },
  { value: 3, label: '3 (寅) 3:00-5:00' },
  { value: 4, label: '4 (卯) 5:00-7:00' },
  { value: 5, label: '5 (辰) 7:00-9:00' },
  { value: 6, label: '6 (巳) 9:00-11:00' },
  { value: 7, label: '7 (午) 11:00-13:00' },
  { value: 8, label: '8 (未) 13:00-15:00' },
  { value: 9, label: '9 (申) 15:00-17:00' },
  { value: 10, label: '10 (酉) 17:00-19:00' },
  { value: 11, label: '11 (戌) 19:00-21:00' },
  { value: 12, label: '12 (亥) 21:00-23:00' },
];

export default function App() {
  const [day, setDay] = useState<string>('');
  const [hour, setHour] = useState<string>('');
  const [result, setResult] = useState<PalaceWithLabels[] | null>(null);

  const calculateDivination = () => {
    if (!day || !hour) return;

    const x1 = parseInt(day);
    const x2 = parseInt(hour);

    // 小六壬计算逻辑
    // 自身位置: (X1 - 1) % 6
    const selfPosition = (x1 - 1) % 6;
    
    // X1落点位置: (X1 + X2 - 2) % 6
    const x1Position = (x1 + x2 - 2) % 6;

    // 创建结果数组，按照指定的顺序排列
    const gridOrder = [1, 2, 3, 0, 5, 4]; // 对应 [流连, 速喜, 赤口, 大安, 空亡, 小吉]
    
    const resultsWithLabels: PalaceWithLabels[] = gridOrder.map((palaceIndex, gridIndex) => {
      const palace = palaces[palaceIndex];
      const labels: string[] = [];
      
      if (palaceIndex === selfPosition) {
        labels.push('自身');
      }
      if (palaceIndex === x1Position) {
        labels.push('x1落点');
      }
      
      return {
        ...palace,
        labels,
      };
    });

    setResult(resultsWithLabels);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* User Manual Button - Top Right */}
        <div className="flex justify-end mb-8">
          <UserManual />
        </div>

        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-stone-800 tracking-wide">小六壬排盘</h1>
        </header>

        {/* Input Area */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-stone-200/50 p-8 mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Day Input */}
              <div className="space-y-3">
                <Label htmlFor="day" className="text-stone-700">日 (X1)</Label>
                <Input
                  id="day"
                  type="number"
                  min="1"
                  max="30"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="1-30"
                  className="border-stone-300 focus:border-amber-600 focus:ring-amber-600/20"
                />
              </div>

              {/* Hour Select */}
              <div className="space-y-3">
                <Label htmlFor="hour" className="text-stone-700">时 (X2)</Label>
                <Select value={hour} onValueChange={setHour}>
                  <SelectTrigger className="border-stone-300 focus:border-amber-600 focus:ring-amber-600/20">
                    <SelectValue placeholder="选择时辰" />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.map((h) => (
                      <SelectItem key={h.value} value={h.value.toString()}>
                        {h.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <Button
                onClick={calculateDivination}
                disabled={!day || !hour}
                className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-6 shadow-lg shadow-amber-900/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                开始排盘
              </Button>
            </div>
          </div>
        </div>

        {/* Result Grid */}
        {result && (
          <div className="grid grid-cols-3 gap-6">
            {result.map((palace, index) => (
              <PalaceCard
                key={index}
                name={palace.name}
                element={palace.element}
                time={palace.time}
                guardian={palace.guardian}
                labels={palace.labels}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!result && (
          <div className="text-center py-20 text-stone-400">
            <p>请输入日期和时辰，开始排盘</p>
          </div>
        )}
      </div>
    </div>
  );
}
