import { Card } from "./ui/card";

const GOLD = "#d4af37";
const GOLD_LIGHT = "#f5d061";

interface PalaceCardProps {
  title: string;
  element: string;
  shichen: string;
  animal: string;
  wuxing: string;
  relation?: string;
  labelSelf?: string;
  index?: number;
}

export function PalaceCard({ title, element, shichen, animal, wuxing, relation, labelSelf, index = 0 }: PalaceCardProps) {
  const showLabel = Boolean(labelSelf);
  
  const cardStyle: React.CSSProperties = showLabel
    ? {
        background: `linear-gradient(to bottom right, ${GOLD}33, ${GOLD}0d)`,
        border: `2px solid ${GOLD}99`,
        boxShadow: `0 10px 40px ${GOLD}33`,
      }
    : {
        backgroundColor: 'rgba(23, 23, 23, 0.6)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${GOLD}33`,
      };

  const cornerStyle: React.CSSProperties = {
    borderColor: `${GOLD}66`,
  };

  return (
    <Card 
      className="relative overflow-hidden transition-all duration-500 p-6 rounded-xl text-center group hover:shadow-lg"
      style={cardStyle}
    >
      {/* 角落装饰 */}
      <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 rounded-tl-lg" style={cornerStyle} />
      <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 rounded-tr-lg" style={cornerStyle} />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 rounded-bl-lg" style={cornerStyle} />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 rounded-br-lg" style={cornerStyle} />
      
      {/* 悬停时的光效 */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(to bottom right, ${GOLD}00, ${GOLD}0d, ${GOLD}00)` }}
      />
      
      {/* 宫位标题 */}
      <h4 
        className="text-xl font-bold tracking-wider mb-4 transition-colors duration-300"
        style={{ 
          color: showLabel ? GOLD : '#f5f5f5',
          textShadow: showLabel ? `0 0 10px ${GOLD}66, 0 0 20px ${GOLD}4d` : 'none'
        }}
      >
        {title}
      </h4>
      
      {/* 五行元素 */}
      <div 
        className="text-base mb-2 transition-colors"
        style={{ color: showLabel ? `${GOLD}e6` : '#a3a3a3' }}
      >
        <span className="font-medium">{element}</span>
      </div>
      
      {/* 时辰 */}
      <div 
        className="text-base mb-2 transition-colors"
        style={{ color: showLabel ? `${GOLD}cc` : '#737373' }}
      >
        {shichen}
      </div>
      
      {/* 神兽 */}
      <div 
        className="text-base mb-2 transition-colors"
        style={{ color: showLabel ? `${GOLD}cc` : '#737373' }}
      >
        {animal}
      </div>

      {/* 关系显示 */}
      {relation && (
        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${GOLD}33` }}>
          <span 
            className="text-sm font-medium"
            style={{ color: showLabel ? GOLD : '#a3a3a3' }}
          >
            {relation}
          </span>
        </div>
      )}

      {/* 自身标签 */}
      {showLabel && (
        <div className="flex items-center justify-center mt-4">
          <span 
            className="inline-flex items-center justify-center rounded-full px-4 py-1.5 text-sm font-bold tracking-wide text-black shadow-lg"
            style={{ 
              background: `linear-gradient(to right, ${GOLD}, ${GOLD_LIGHT})`,
              boxShadow: `0 4px 14px ${GOLD}4d`
            }}
          >
            {labelSelf}
          </span>
        </div>
      )}
      
      {/* 自身宫位的特殊发光边框动画 */}
      {showLabel && (
        <div className="absolute inset-0 rounded-xl pointer-events-none animate-pulse" style={{ border: `2px solid ${GOLD}99` }}></div>
      )}
    </Card>
  );
}
