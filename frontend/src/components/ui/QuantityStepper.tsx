import { MinusIcon, PlusIcon } from "./Icons";

interface Props {
  value: number;
  min?: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function QuantityStepper({ value, min = 1, max, disabled, onChange }: Props) {
  const btn =
    "grid size-9 place-items-center rounded-full text-ink transition hover:bg-panel disabled:cursor-not-allowed disabled:opacity-30";
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-line bg-panel-2 p-1">
      <button type="button" className={btn} aria-label="Kamaytirish" disabled={disabled || value <= min} onClick={() => onChange(value - 1)}>
        <MinusIcon width={16} height={16} />
      </button>
      <span className="w-8 text-center font-mono text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} aria-label="Ko'paytirish" disabled={disabled || value >= max} onClick={() => onChange(value + 1)}>
        <PlusIcon width={16} height={16} />
      </button>
    </div>
  );
}
