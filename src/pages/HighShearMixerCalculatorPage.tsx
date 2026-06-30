import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import EditableNumberInput from '../components/EditableNumberInput';
import ProjectNameInput from '../components/ProjectNameInput';
import type { CalculatorItem } from '../data/items';
import {
  HIGH_SHEAR_MIXER_ITEMS,
  type DimField,
} from '../data/highShearMixerItems';
import {
  type HsmLineItem,
  DEFAULT_LABOUR_PERCENT,
  DEFAULT_MISC_COST,
  DEFAULT_MOTOR_COST,
  DEFAULT_PROFIT_PERCENT,
  DEFAULT_ROTOR_COST,
  buildDefaultState,
  calcGrandTotal,
  calculateHsmLineItems,
  dimensionsFromVariant,
  formatCurrency,
  formatNum,
  isDimEditable,
} from '../lib/highShearMixerCalculations';

interface Props {
  item: CalculatorItem;
}

export default function HighShearMixerCalculatorPage({ item }: Props) {
  const [itemStates, setItemStates] = useState(() => buildDefaultState());
  const [labourPercent, setLabourPercent] = useState(DEFAULT_LABOUR_PERCENT);
  const [motorCost, setMotorCost] = useState(DEFAULT_MOTOR_COST);
  const [rotorCost, setRotorCost] = useState(DEFAULT_ROTOR_COST);
  const [miscCost, setMiscCost] = useState(DEFAULT_MISC_COST);
  const [profitPercent, setProfitPercent] = useState(DEFAULT_PROFIT_PERCENT);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [projectName, setProjectName] = useState('');

  const lineItems = useMemo(
    () => calculateHsmLineItems(itemStates),
    [itemStates],
  );

  const totalWeight = lineItems.reduce((sum, row) => sum + row.result, 0);
  const totalMaterialAmount = lineItems.reduce((sum, row) => sum + row.totalAmount, 0);
  const labourCost = totalMaterialAmount * (labourPercent / 100);
  const profitCost = totalMaterialAmount * (profitPercent / 100);
  const grandTotal = calcGrandTotal(
    totalMaterialAmount,
    labourCost,
    motorCost,
    rotorCost,
    miscCost,
    profitCost,
  );

  const updateVariant = (itemId: string, variantId: string) => {
    const def = HIGH_SHEAR_MIXER_ITEMS.find((i) => i.id === itemId);
    if (!def) return;
    const variant = def.variants.find((v) => v.id === variantId);
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
    row: HsmLineItem,
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
        <EditableNumberInput
          className="param-input"
          value={display}
          onChange={(v) => updateDim(row.id, field, v)}
        />
      );
    }
    return <span className="dim-value">{formatNum(display)}</span>;
  };

  const renderSizeCell = (row: HsmLineItem) => {
    if (row.hasVariantChoice) {
      const def = HIGH_SHEAR_MIXER_ITEMS.find((i) => i.id === row.id)!;
      return (
        <select
          className="variant-select"
          value={itemStates[row.id].variantId}
          onChange={(e) => updateVariant(row.id, e.target.value)}
        >
          {def.variants.map((v) => (
            <option key={v.id} value={v.id}>{v.label}</option>
          ))}
        </select>
      );
    }
    if (row.allFieldsEditable) {
      return <span className="param-empty size-dash">—</span>;
    }
    return <span className="dim-value">{row.variantLabel}</span>;
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const { generateHighShearMixerPdf } = await import('../lib/generateHighShearMixerPdf');
      await generateHighShearMixerPdf({
        itemTitle: item.title,
        projectName,
        lineItems,
        totalWeight,
        totalMaterialAmount,
        labourPercent,
        labourCost,
        motorCost,
        rotorCost,
        miscCost,
        profitPercent,
        profitCost,
        grandTotal,
      });
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="app calc-page high-shear-mixer-page">
      <header className="page-header">
        <Link to="/" className="back-link">← Back</Link>
        <div className="calc-page-title-row">
          <div>
            <h1>{item.title}</h1>
            <p className="subtitle">Calculation Logic Development Sheet — High Shear Mixer</p>
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
        <ProjectNameInput value={projectName} onChange={setProjectName} />
      </section>

      <section className="panel calc-table-panel">
        <div className="calc-table-wrap">
          <table className="calc-table high-shear-mixer-table">
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
                    <EditableNumberInput
                      className="rate-input"
                      value={row.rate}
                      onChange={(v) => updateRate(row.id, v)}
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
                <td className="item-name"><strong>Total Material Cost</strong></td>
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
          <SummaryRow label="Total Material Cost" value={totalMaterialAmount} />
          <SummaryLabour percent={labourPercent} onPercentChange={setLabourPercent} value={labourCost} />
          <SummaryEditable label="Motor" value={motorCost} onChange={setMotorCost} />
          <SummaryEditable label="Rotor" value={rotorCost} onChange={setRotorCost} />
          <SummaryEditable label="Miscellaneous" value={miscCost} onChange={setMiscCost} />
          <SummaryProfit
            percent={profitPercent}
            onPercentChange={setProfitPercent}
            value={profitCost}
          />
          <div className="summary-row grand-total">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
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
          <EditableNumberInput
            className="labour-percent-input"
            value={percent}
            min={0}
            max={100}
            step={1}
            onChange={(v) => onPercentChange(v)}
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
          <EditableNumberInput
            className="profit-percent-input"
            value={percent}
            min={0}
            max={100}
            step={0.5}
            onChange={(v) => onPercentChange(v)}
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
      <EditableNumberInput
        className="summary-input"
        value={value}
        onChange={(v) => onChange(v)}
      />
    </div>
  );
}
