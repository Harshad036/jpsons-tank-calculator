interface ResultCardProps {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}

export default function ResultCard({ label, value, hint, accent }: ResultCardProps) {
  return (
    <div className={`result-card${accent ? ' accent' : ''}`}>
      <span className="result-label">{label}</span>
      <span className="result-value">{value}</span>
      {hint && <span className="result-hint">{hint}</span>}
    </div>
  );
}
