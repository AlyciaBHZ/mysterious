import { HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

export function UserManual() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full border-stone-300 bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:border-amber-600 transition-all"
        >
          <HelpCircle className="h-5 w-5 text-stone-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-stone-200">
        <DialogHeader>
          <DialogTitle className="text-stone-800">小六壬排盘使用手册</DialogTitle>
          <DialogDescription className="text-stone-600">
            了解如何使用小六壬进行占卜推算
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6 text-stone-700">
            {/* 简介 */}
            <section>
              <h3 className="text-stone-800 mb-3">什么是小六壬？</h3>
              <p className="text-stone-600 leading-relaxed">
                小六壬是中国传统占卜术之一，以简便实用著称。通过日期和时辰的组合，推算出六个宫位的变化，从而预测事物的吉凶祸福。
              </p>
            </section>

            {/* 使用步骤 */}
            <section>
              <h3 className="text-stone-800 mb-3">使用步骤</h3>
              <div className="space-y-4">
                <div className="bg-stone-50 rounded-lg p-4">
                  <p className="text-stone-800 mb-2">1. 输入日期 (X1)</p>
                  <p className="text-stone-600">
                    输入农历日期，范围为 1-30。例如：农历初八，输入 8。
                  </p>
                </div>
                <div className="bg-stone-50 rounded-lg p-4">
                  <p className="text-stone-800 mb-2">2. 选择时辰 (X2)</p>
                  <p className="text-stone-600">
                    从下拉菜单中选择当前时辰。时辰以地支表示，每个时辰对应两小时。
                  </p>
                </div>
                <div className="bg-stone-50 rounded-lg p-4">
                  <p className="text-stone-800 mb-2">3. 开始排盘</p>
                  <p className="text-stone-600">
                    点击"开始排盘"按钮，系统将自动计算并显示结果。
                  </p>
                </div>
              </div>
            </section>

            {/* 六宫解释 */}
            <section>
              <h3 className="text-stone-800 mb-3">六宫含义</h3>
              <div className="grid gap-3">
                <div className="border-l-4 border-amber-600 pl-4">
                  <p className="text-stone-800">大安 - 吉</p>
                  <p className="text-stone-600">事事如意，平安顺利</p>
                </div>
                <div className="border-l-4 border-stone-400 pl-4">
                  <p className="text-stone-800">流连 - 平</p>
                  <p className="text-stone-600">事有反复，迁延不决</p>
                </div>
                <div className="border-l-4 border-stone-400 pl-4">
                  <p className="text-stone-800">速喜 - 吉</p>
                  <p className="text-stone-600">喜事将至，快速如意</p>
                </div>
                <div className="border-l-4 border-stone-400 pl-4">
                  <p className="text-stone-800">赤口 - 凶</p>
                  <p className="text-stone-600">口舌是非，需防小人</p>
                </div>
                <div className="border-l-4 border-stone-400 pl-4">
                  <p className="text-stone-800">小吉 - 吉</p>
                  <p className="text-stone-600">小有喜庆，渐入佳境</p>
                </div>
                <div className="border-l-4 border-stone-400 pl-4">
                  <p className="text-stone-800">空亡 - 凶</p>
                  <p className="text-stone-600">诸事不利，宜静不宜动</p>
                </div>
              </div>
            </section>

            {/* 标签说明 */}
            <section>
              <h3 className="text-stone-800 mb-3">标签说明</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-600 text-white px-3 py-1 rounded-full">自身</div>
                  <p className="text-stone-600">表示当前事态或问卦者的状态</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-stone-200 text-stone-600 px-3 py-1 rounded-full">x1落点</div>
                  <p className="text-stone-600">表示事物的最终发展趋势</p>
                </div>
              </div>
            </section>

            {/* 注意事项 */}
            <section>
              <h3 className="text-stone-800 mb-3">注意事项</h3>
              <ul className="space-y-2 text-stone-600">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>占卜时需心诚意正，专注于所问之事</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>同一件事不宜反复占问</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>结果仅供参考，切勿过分迷信</span>
                </li>
              </ul>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
