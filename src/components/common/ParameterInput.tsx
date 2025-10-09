import { useId } from 'react';

interface ParameterInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
}

export const ParameterInput = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  helperText
}: ParameterInputProps) => {
  const inputId = useId();
  const descriptionId = `${inputId}-description`;

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex items-center gap-3">
        <input
          id={inputId}
          type="number"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          aria-describedby={helperText ? descriptionId : undefined}
          onChange={(event) => onChange(parseFloat(event.target.value) || 0)}
          className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-right font-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(parseFloat(event.target.value))}
          className="flex-1 accent-primary"
        />
        <span className="w-16 text-right text-sm font-semibold text-slate-600">{value.toFixed(1)}%</span>
      </div>
      {helperText && (
        <p id={descriptionId} className="text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  );
};
