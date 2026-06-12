interface CalcInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  step?: number;
}

export default function CalcInput({
  id,
  label,
  value,
  onChange,
  unit,
  step = 1,
}: CalcInputProps) {
  return (
    <div className="calc-field">
      <label htmlFor={id}>{label}</label>
      <div className="calc-input-wrap">
        <input
          id={id}
          type="number"
          className="calc-input"
          value={value || ''}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
        {unit && <span className="calc-unit">{unit}</span>}
      </div>
    </div>
  );
}
