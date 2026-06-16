import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CalcInput from '../components/CalcInput';
import type { CalculatorItem } from '../data/items';
import { lookupByCapacity } from '../data/tankLookup';
import {
  type JacketedEditableParams,
  DEFAULT_JACKETED_PARAMS,
  DEFAULT_JACKETED_RATES,
  calcJacketedTankVolume,
  calculateJacketedLineItems,
  formatCurrency,
  formatNum,
  legFromLookup,
  syncThicknessLinkedH,
} from '../lib/jacketedTankCalculations';

interface Props {
  item: CalculatorItem;
}

export default function JacketedCalculatorPage({ item }: Props) {
  const [ltr, setLtr] = useState(100);
  const [diameter, setDiameter] = useState(550);
  const [height, setHeight] = useState(550);
  const [thickness, setThickness] = useState(3);
  const [params, setParams] = useState<JacketedEditableParams>({ ...DEFAULT_JACKETED_PARAMS });
  const [rates, setRates] = useState<Record<string, number>>({ ...DEFAULT_JACKETED_RATES });
  const [labourPercent, setLabourPercent] = useState(75);
  const [agitatorCost, setAgitatorCost] = useState(35000);
  const [panelCost, setPanelCost] = useState(25000);
  const [miscCost, setMiscCost] = useState(10000);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const row = lookupByCapacity(ltr);
    if (row) {
      setDiameter(row.diameter);
      setHeight(row.height);
      setParams((prev) => ({ ...prev, leg: legFromLookup(row) }));
    }
  }, [ltr]);

  const lineItems = useMemo(
    () => calculateJacketedLineItems({ diameter, height, thickness, params }, rates),
    [diameter, height, thickness, params, rates],
  );

  const totalWeight = lineItems.reduce((sum, row) => sum + row.result, 0);
  const totalMaterialAmount = lineItems.reduce((sum, row) => sum + row.totalAmount, 0);
  const labourCost = totalMaterialAmount * (labourPercent / 100);
  const grandTotal = totalMaterialAmount + labourCost + agitatorCost + panelCost + miscCost;
  const tankVolume = calcJacketedTankVolume(diameter, height);

  const updateRate = (id: string, value: number) => {
    setRates((prev) => ({ ...prev, [id]: value }));
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const { generateJacketedPdf } = await import('../lib/generateJacketedPdf');
      await generateJacketedPdf({
        itemTitle: item.title,
        ltr,
        diameter,
        height,
        thickness,
        lineItems,
        totalWeight,
        totalMaterialAmount,
        labourPercent,
        labourCost,
        agitatorCost,
        panelCost,
        miscCost,
        grandTotal,
        tankVolume,
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleThicknessChange = (v: number) => {
    setThickness(v);
    setParams((prev) => syncThicknessLinkedH(prev, v));
  };

  const updateShellH = (v: number) => {
    setParams((prev) => ({ ...prev, shellH: v }));
  };

  const updateFlatDishConeH = (v: number) => {
    setParams((prev) => ({ ...prev, flatDishConeH: v }));
  };

  const updateTopThickness = (v: number) => {
    setParams((prev) => ({ ...prev, topThickness: v }));
  };

  const updateJacketShellH = (v: number) => {
    setParams((prev) => ({ ...prev, jacketShellH: v }));
  };

  const updateJacketDishH = (v: number) => {
    setParams((prev) => ({ ...prev, jacketDishH: v }));
  };

  const updateTopRing = (field: 'l' | 'h', v: number) => {
    setParams((prev) => ({ ...prev, topRing: { ...prev.topRing, [field]: v } }));
  };

  const updateJacketRing = (field: 'l' | 'h', v: number) => {
    setParams((prev) => ({ ...prev, jacketRing: { ...prev.jacketRing, [field]: v } }));
  };

  const updateInsulationShellH = (v: number) => {
    setParams((prev) => ({ ...prev, insulationShell: { h: v } }));
  };

  const updateInsulationRing = (field: 'l' | 'h', v: number) => {
    setParams((prev) => ({ ...prev, insulationRing: { ...prev.insulationRing, [field]: v } }));
  };

  const updateLegPad = (field: 'l' | 'w' | 'h', v: number) => {
    setParams((prev) => ({ ...prev, legPad: { ...prev.legPad, [field]: v } }));
  };

  const updateBasePlate = (field: 'l' | 'w' | 'h', v: number) => {
    setParams((prev) => ({ ...prev, basePlate: { ...prev.basePlate, [field]: v } }));
  };

  const updateLeg = (field: 'l' | 'w' | 'h', v: number) => {
    setParams((prev) => ({ ...prev, leg: { ...prev.leg, [field]: v } }));
  };

  const renderDimCell = (
    row: typeof lineItems[0],
    dim: 'l' | 'w' | 'h',
    value: number,
    onChange?: (v: number) => void,
  ) => {
    const editable =
      dim === 'l' ? row.editableL : dim === 'w' ? row.editableW : row.editableH;
    if (editable && onChange) {
      return (
        <input
          type="number"
          className="param-input"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
      );
    }
    return <span className="dim-value">{formatNum(value, dim === 'w' && value > 1000 ? 0 : 2)}</span>;
  };

  const getDimHandlers = (row: typeof lineItems[0]) => {
    switch (row.id) {
      case 'shell':
        return { h: updateShellH };
      case 'flatDishCone':
        return { h: updateFlatDishConeH };
      case 'top':
        return { h: updateTopThickness };
      case 'topRing':
        return { l: (v: number) => updateTopRing('l', v), h: (v: number) => updateTopRing('h', v) };
      case 'jacketShell':
        return { h: updateJacketShellH };
      case 'jacketDish':
        return { h: updateJacketDishH };
      case 'jacketRing':
        return { l: (v: number) => updateJacketRing('l', v), h: (v: number) => updateJacketRing('h', v) };
      case 'insulationShell':
        return { h: updateInsulationShellH };
      case 'insulationRing':
        return { l: (v: number) => updateInsulationRing('l', v), h: (v: number) => updateInsulationRing('h', v) };
      case 'legPad':
        return {
          l: (v: number) => updateLegPad('l', v),
          w: (v: number) => updateLegPad('w', v),
          h: (v: number) => updateLegPad('h', v),
        };
      case 'basePlate':
        return {
          l: (v: number) => updateBasePlate('l', v),
          w: (v: number) => updateBasePlate('w', v),
          h: (v: number) => updateBasePlate('h', v),
        };
      case 'leg':
        return {
          l: (v: number) => updateLeg('l', v),
          w: (v: number) => updateLeg('w', v),
          h: (v: number) => updateLeg('h', v),
        };
      default:
        return {};
    }
  };

  return (
    <div className="app calc-page jacketed-page">
      <header className="page-header">
        <Link to="/" className="back-link">← Back</Link>
        <div className="calc-page-title-row">
          <div>
            <h1>{item.title}</h1>
            <p className="subtitle">Calculation Logic Development Sheet</p>
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
        <div className="calc-inputs-grid">
          <CalcInput id="ltr" label="LTR" value={ltr} onChange={setLtr} unit="L" />
          <CalcInput id="diameter" label="Ø" value={diameter} onChange={setDiameter} unit="mm" />
          <CalcInput id="height" label="H" value={height} onChange={setHeight} unit="mm" />
          <CalcInput id="thickness" label="THK" value={thickness} onChange={handleThicknessChange} unit="mm" step={0.5} />
        </div>
      </section>

      <section className="panel calc-table-panel">
        <p className="table-scroll-hint">Swipe horizontally to view full table</p>
        <div className="calc-table-wrap">
          <table className="calc-table jacketed-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>L</th>
                <th>W</th>
                <th>H</th>
                <th>Result</th>
                <th>Rate</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((row) => {
                const handlers = getDimHandlers(row);

                return (
                  <tr key={row.id}>
                    <td className="item-name" data-label="Item">{row.name}</td>
                    <td className="param-cell" data-label="L">
                      {renderDimCell(row, 'l', row.l, handlers.l)}
                    </td>
                    <td className="param-cell" data-label="W">
                      {renderDimCell(row, 'w', row.w, handlers.w)}
                    </td>
                    <td className="param-cell" data-label="H">
                      {renderDimCell(row, 'h', row.h, handlers.h)}
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
                );
              })}
              <tr className="total-row total-row-weight">
                <td className="item-name"><strong>Total Weight</strong></td>
                <td className="hide-mobile" colSpan={3} />
                <td className="num"><strong>{formatNum(totalWeight)}</strong></td>
                <td className="hide-mobile" />
                <td className="hide-mobile" />
              </tr>
              <tr className="total-row total-row-amount">
                <td className="item-name"><strong>Total Material Amount</strong></td>
                <td className="hide-mobile" colSpan={3} />
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
          <SummaryEditable label="Agitator Cost" value={agitatorCost} onChange={setAgitatorCost} />
          <SummaryEditable label="Panel Cost" value={panelCost} onChange={setPanelCost} />
          <SummaryEditable label="Micelinious Cost" value={miscCost} onChange={setMiscCost} />
          <div className="summary-row grand-total">
            <span>Grand Total</span>
            <span>{formatCurrency(grandTotal)}</span>
          </div>
          <div className="summary-row tank-volume">
            <span>Tank Volume (LTR)</span>
            <span>{formatNum(tankVolume)} L</span>
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
        Labour Cost
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
