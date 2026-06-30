import { type InputHTMLAttributes, useState } from 'react';

interface EditableNumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number;
  onChange: (value: number) => void;
}

export default function EditableNumberInput({
  value,
  onChange,
  onFocus,
  onBlur,
  ...props
}: EditableNumberInputProps) {
  const [text, setText] = useState<string | null>(null);

  const display = text !== null ? text : String(value);

  return (
    <input
      {...props}
      type="number"
      value={display}
      onFocus={(e) => {
        setText(value === 0 ? '' : String(value));
        requestAnimationFrame(() => e.currentTarget.select());
        onFocus?.(e);
      }}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        if (raw === '' || raw === '-') {
          onChange(0);
          return;
        }
        const parsed = parseFloat(raw);
        if (!Number.isNaN(parsed)) {
          onChange(parsed);
        }
      }}
      onBlur={(e) => {
        const raw = text ?? String(value);
        if (raw === '' || raw === '-') {
          onChange(0);
        } else {
          const parsed = parseFloat(raw);
          onChange(Number.isNaN(parsed) ? 0 : parsed);
        }
        setText(null);
        onBlur?.(e);
      }}
    />
  );
}
