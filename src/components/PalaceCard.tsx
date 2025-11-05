import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface PalaceCardProps {
  name: string;
  element: string;
  time: string;
  guardian: string;
  labels: string[];
}

export function PalaceCard({ name, element, time, guardian, labels }: PalaceCardProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-stone-200/50 hover:shadow-lg transition-all duration-300 p-6 rounded-xl">
      <div className="flex flex-col h-full">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-stone-800 tracking-wide">{name}</h2>
        </div>

        {/* Details */}
        <div className="flex-1 space-y-3 mb-6">
          <div className="text-center">
            <p className="text-stone-500">{element}</p>
          </div>
          <div className="text-center">
            <p className="text-stone-500">{time}</p>
          </div>
          <div className="text-center">
            <p className="text-stone-500">{guardian}</p>
          </div>
        </div>

        {/* Labels */}
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center pt-4 border-t border-stone-200/50">
            {labels.map((label, index) => (
              <Badge
                key={index}
                variant={label === '自身' ? 'default' : 'secondary'}
                className={
                  label === '自身'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 shadow-md shadow-amber-900/20'
                    : 'bg-stone-200 text-stone-600 hover:bg-stone-300 px-3 py-1'
                }
              >
                {label}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
