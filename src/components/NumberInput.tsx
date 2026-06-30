import EditableNumberInput from './EditableNumberInput';

interface NumberInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
}

export default function NumberInput({
  id,
  label,
  value,
  onChange,
  unit,
  min = 0,
  max,
  step = 1,
}: NumberInputProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <EditableNumberInput
          id={id}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
        />
        <span className="unit">{unit}</span>
      </div>
    </div>
  );
}
