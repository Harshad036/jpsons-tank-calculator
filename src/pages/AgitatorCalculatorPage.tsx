import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { CalculatorItem } from '../data/items';
import {
  AGITATOR_TYPE_OPTIONS,
  type AgitatorType,
  type DimField,
  itemsForType,
  variantsForType,
} from '../data/agitatorItems';
import {
  type AgitatorLineItem,
  DEFAULT_GEARBOX_COST,
  DEFAULT_LABOUR_PERCENT,
  DEFAULT_MOTOR_COST,
  DEFAULT_PROFIT_PERCENT,
  DEFAULT_SEAL_COST,
  buildDefaultState,
  calcProfitBase,
  calculateAgitatorLineItems,
  dimensionsFromVariant,
  formatCurrency,
  formatNum,
  isDimEditable,
} from '../lib/agitatorCalculations';

interface Props {
  item: CalculatorItem;
}

export default function AgitatorCalculatorPage({ item }: Props) {
  const [agitatorType, setAgitatorType] = useState<AgitatorType>('SINGLE');
  const [itemStates, setItemStates] = useState(() => buildDefaultState('SINGLE'));
  const [labourPercent, setLabourPercent] = useState(DEFAULT_LABOUR_PERCENT);
  const [motorCost, setMotorCost] = useState(DEFAULT_MOTOR_COST);
  const [gearboxCost, setGearboxCost] = useState(DEFAULT_GEARBOX_COST);
  const [sealCost, setSealCost] = useState(DEFAULT_SEAL_COST);
  const [profitPercent, setProfitPercent] = useState(DEFAULT_PROFIT_PERCENT);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleTypeChange = (type: AgitatorType) => {
    setAgitatorType(type);
    setItemStates(buildDefaultState(type));
  };

  const lineItems = useMemo(
    () => calculateAgitatorLineItems(agitatorType, itemStates),
    [agitatorType, itemStates],
  );

  const totalWeight = lineItems.reduce((sum, row) => sum + row.result, 0);
  const totalMaterialAmount = lineItems.reduce((sum, row) => sum + row.totalAmount, 0);
  const labourCost = totalMaterialAmount * (labourPercent / 100);
  const profitBase = calcProfitBase(totalMaterialAmount, labourCost, motorCost, gearboxCost, sealCost);
  const profitCost = profitBase * (profitPercent / 100);
  const finalAmount = profitBase + profitCost;

  const updateVariant = (itemId: string, variantId: string) => {
    const def = itemsForType(agitatorType).find((i) => i.id === itemId);
    if (!def) return;
    const variant = variantsForType(def, agitatorType).find((v) => v.id === variantId);
    if (!variant) return;
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        variantId,
        dimensions: dimensionsFromVariant(variant),
      },
    }));
  };

  const updateDim = (itemId: string, field: DimField, value: number) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        dimensions: { ...prev[itemId].dimensions, [field]: value },
      },
    }));
  };

  const updateRate = (itemId: string, value: number) => {
    setItemStates((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], rate: value },
    }));
  };

  const renderDimCell = (
    row: AgitatorLineItem,
    field: DimField,
    value: number | undefined,
  ) => {
    const editable = isDimEditable(row.formula, row.editableFields, field, row.allFieldsEditable);
    if (value === undefined && !editable) {
      return <span className="param-empty">—</span>;
    }
    const display = value ?? 0;
    if (editable) {
      return (
        <input
          type="number"
          className="param-input"
          value={display}
          onChange={(e) => updateDim(row.id, field, parseFloat(e.target.value) || 0)}
        />
      );
    }
    return <span className="dim-value">{formatNum(display)}</span>;
  };

  const renderSizeCell = (row: AgitatorLineItem) => {
    if (row.allFieldsEditable) {
      return <span className="param-empty size-dash">—</span>;
    }
    if (row.hasVariantChoice) {
      const def = itemsForType(agitatorType).find((i) => i.id === row.id)!;
      const variants = variantsForType(def, agitatorType);
      return (
        <select
          className="variant-select"
          value={itemStates[row.id].variantId}
          onChange={(e) => updateVariant(row.id, e.target.value)}
        >
          {variants.map((v) => (
            <option key={v.id} value={v.id}>{v.label}</option>
          ))}
        </select>
      );
    }
    return <span className="dim-value">{row.variantLabel}</span>;
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const { generateAgitatorPdf } = await import('../lib/generateAgitatorPdf');
      await generateAgitatorPdf({
        itemTitle: item.title,
        agitatorType,
        lineItems,
        totalWeight,
        totalMaterialAmount,
        labourPercent,
        labourCost,
        motorCost,
        gearboxCost,
        sealCost,
        profitPercent,
        profitCost,
        finalAmount,
      });
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="app calc-page agitator-page">
      <header className="page-header">
        <Link to="/" className="back-link">← Back</Link>
        <div className="calc-page-title-row">
          <div>
            <h1>{item.title}</h1>
            <p className="subtitle">Calculation Logic Development Sheet — Agitator</p>
          </div>
          <button
            type="button"
            className="btn-download-pdf"
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
          >
            {pdfLoading ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </header>

      <section className="panel calc-inputs-panel">
        <div className="agitator-type-row">
          <label className="agitator-type-label" htmlFor="agitator-type">Type</label>
          <select
            id="agitator-type"
            className="agitator-type-select"
            value={agitatorType}
            onChange={(e) => handleTypeChange(e.target.value as AgitatorType)}
          >
            {AGITATOR_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </section>

      <section className="panel calc-table-panel">
        <div className="calc-table-wrap">
          <table className="calc-table agitator-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Size</th>
                <th>Ø</th>
                <th>L</th>
                <th>W</th>
                <th>THK</th>
                <th>Result</th>
                <th>Rate</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((row) => (
                  <tr key={row.id}>
                    <td className="item-name" data-label="Item">{row.name}</td>
                    <td className="variant-cell" data-label="Size">
                      {renderSizeCell(row)}
                    </td>
                    <td className="param-cell" data-label="Ø">
                      {renderDimCell(row, 'diameter', row.diameter)}
                    </td>
                    <td className="param-cell" data-label="L">
                      {renderDimCell(row, 'length', row.length)}
                    </td>
                    <td className="param-cell" data-label="W">
                      {renderDimCell(row, 'width', row.width)}
                    </td>
                    <td className="param-cell" data-label="THK">
                      {renderDimCell(row, 'thickness', row.thickness)}
                    </td>
                    <td className="num" data-label="Result">{formatNum(row.result)}</td>
                    <td className="rate-cell" data-label="Rate">
                      <input
                        type="number"
                        className="rate-input"
                        value={row.rate}
                        onChange={(e) => updateRate(row.id, parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="num" data-label="Total Amount">{formatCurrency(row.totalAmount)}</td>
                  </tr>
                ))}
              <tr className="total-row total-row-weight">
                <td className="item-name"><strong>Total Weight</strong></td>
                <td className="hide-mobile" colSpan={5} />
                <td className="num"><strong>{formatNum(totalWeight)}</strong></td>
                <td className="hide-mobile" />
                <td className="hide-mobile" />
              </tr>
              <tr className="total-row total-row-amount">
                <td className="item-name"><strong>Total Material Amount</strong></td>
                <td className="hide-mobile" colSpan={5} />
                <td className="hide-mobile" />
                <td className="hide-mobile" />
                <td className="num"><strong>{formatCurrency(totalMaterialAmount)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel summary-panel">
        <h2>Cost Summary</h2>
        <div className="summary-grid">
          <SummaryRow label="Total Material Rate" value={totalMaterialAmount} />
          <SummaryLabour percent={labourPercent} onPercentChange={setLabourPercent} value={labourCost} />
          <SummaryEditable label="Motor" value={motorCost} onChange={setMotorCost} />
          <SummaryEditable label="Gearbox" value={gearboxCost} onChange={setGearboxCost} />
          <SummaryEditable label="Seal" value={sealCost} onChange={setSealCost} />
          <SummaryProfit
            percent={profitPercent}
            onPercentChange={setProfitPercent}
            value={profitCost}
          />
          <div className="summary-row grand-total">
            <span>Final Amount</span>
            <span>{formatCurrency(finalAmount)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="summary-row">
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}

function SummaryLabour({
  percent,
  onPercentChange,
  value,
}: {
  percent: number;
  onPercentChange: (v: number) => void;
  value: number;
}) {
  return (
    <div className="summary-row editable labour-row">
      <span className="labour-label">
        Labour
        <span className="labour-percent-wrap">
          (
          <input
            type="number"
            className="labour-percent-input"
            value={percent}
            min={0}
            max={100}
            step={1}
            onChange={(e) => onPercentChange(parseFloat(e.target.value) || 0)}
          />
          %)
        </span>
      </span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}

function SummaryProfit({
  percent,
  onPercentChange,
  value,
}: {
  percent: number;
  onPercentChange: (v: number) => void;
  value: number;
}) {
  return (
    <div className="summary-row editable labour-row">
      <span className="labour-label">
        Profit
        <span className="labour-percent-wrap">
          (
          <input
            type="number"
            className="profit-percent-input"
            value={percent}
            min={0}
            max={100}
            step={0.5}
            onChange={(e) => onPercentChange(parseFloat(e.target.value) || 0)}
          />
          %)
        </span>
      </span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}

function SummaryEditable({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="summary-row editable">
      <span>{label}</span>
      <input
        type="number"
        className="summary-input"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      />
    </div>
  );
}
