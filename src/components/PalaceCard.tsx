import { Card } from "./ui/card";

interface PalaceCardProps {
  title: string;
  element: string;
  shichen: string;
  animal: string;
  labelSelf?: string;
}

export function PalaceCard({ title, element, shichen, animal, labelSelf }: PalaceCardProps) {
  const showLabel = Boolean(labelSelf);

  return (
    <Card className="palace-card bg-white/80 backdrop-blur-sm border-stone-200/50 hover:shadow-lg transition-all duration-300 p-6 rounded-xl text-center">
      <h4 className="text-stone-800 tracking-wide mb-4">{title}</h4>
      <p className="row-element text-stone-600 mb-2">{element}</p>
      <p className="row-shichen text-stone-600 mb-2">{shichen}</p>
      <p className="row-animal text-stone-600 mb-4">{animal}</p>

      {showLabel && (
        <div className="labels flex items-center justify-center">
          <span className="label-self inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-1 text-sm font-bold tracking-wide text-red-600">
            {labelSelf}
          </span>
        </div>
      )}
    </Card>
  );
}
