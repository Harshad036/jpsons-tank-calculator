import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import CalcInput from '../components/CalcInput';
import { getItemById } from '../data/items';
import { lookupByCapacity } from '../data/tankLookup';
import {
  type ComponentParams,
  type LegParams,
  DEFAULT_BASE_PLATE,
  DEFAULT_LEG,
  DEFAULT_LEG_PAD,
  DEFAULT_RATES,
  DEFAULT_TOP_RING,
  calcTankVolume,
  calculateLineItems,
  formatCurrency,
  formatNum,
  legFromLookup,
} from '../lib/mixingTankCalculations';

export default function CalculatorPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const item = itemId ? getItemById(itemId) : undefined;

  const [ltr, setLtr] = useState(100);
  const [diameter, setDiameter] = useState(550);
  const [height, setHeight] = useState(550);
  const [thickness, setThickness] = useState(3);
  const [topThickness, setTopThickness] = useState(3);
  const [topRing, setTopRing] = useState<ComponentParams>({ ...DEFAULT_TOP_RING });
  const [legPad, setLegPad] = useState<ComponentParams>({ ...DEFAULT_LEG_PAD });
  const [basePlate, setBasePlate] = useState<ComponentParams>({ ...DEFAULT_BASE_PLATE });
  const [leg, setLeg] = useState<LegParams>({ ...DEFAULT_LEG });
  const [rates, setRates] = useState<Record<string, number>>({ ...DEFAULT_RATES });
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
      setLeg(legFromLookup(row));
    }
  }, [ltr]);

  const lineItems = useMemo(
    () =>
      calculateLineItems(
        { diameter, height, thickness, topThickness, topRing, legPad, basePlate, leg },
        rates,
      ),
    [diameter, height, thickness, topThickness, topRing, legPad, basePlate, leg, rates],
  );

  const totalWeight = useMemo(
    () => lineItems.reduce((sum, row) => sum + row.result, 0),
    [lineItems],
  );

  const totalMaterialAmount = useMemo(
    () => lineItems.reduce((sum, row) => sum + row.totalAmount, 0),
    [lineItems],
  );

  const labourCost = totalMaterialAmount * (labourPercent / 100);
  const grandTotal =
    totalMaterialAmount + labourCost + agitatorCost + panelCost + miscCost;
  const tankVolume = calcTankVolume(diameter, height);

  if (!item) {
    return <Navigate to="/" replace />;
  }

  const updateRate = (id: string, value: number) => {
    setRates((prev) => ({ ...prev, [id]: value }));
  };

  const updateComponentParam = (
    itemKey: 'topRing' | 'legPad' | 'basePlate',
    field: keyof ComponentParams,
    value: number,
  ) => {
    const setters = { topRing: setTopRing, legPad: setLegPad, basePlate: setBasePlate };
    setters[itemKey]((prev) => ({ ...prev, [field]: value }));
  };

  const updateLegParam = (field: keyof LegParams, value: number) => {
    setLeg((prev) => ({ ...prev, [field]: value }));
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const { generateCalculatorPdf } = await import('../lib/generateCalculatorPdf');
      await generateCalculatorPdf({
        itemTitle: item.title,
        ltr,
        diameter,
        height,
        thickness,
        topThickness,
        topRing,
        legPad,
        basePlate,
        leg,
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

  return (
    <div className="app calc-page">
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
        <h2>Tank Inputs</h2>
        <div className="calc-inputs-grid">
          <CalcInput id="ltr" label="LTR" value={ltr} onChange={setLtr} unit="L" />
          <CalcInput id="diameter" label="Ø" value={diameter} onChange={setDiameter} unit="mm" />
          <CalcInput id="height" label="H" value={height} onChange={setHeight} unit="mm" />
          <CalcInput id="thickness" label="THK" value={thickness} onChange={setThickness} unit="mm" step={0.5} />
        </div>
      </section>

      <section className="panel calc-table-panel">
        <p className="table-scroll-hint">Swipe horizontally to view full table on smaller screens</p>
        <div className="calc-table-wrap">
          <table className="calc-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>W</th>
                <th>THK</th>
                <th>QTY / L</th>
                <th>Result</th>
                <th>Rate</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((row) => (
                <tr key={row.id}>
                  <td className="item-name" data-label="Item">{row.name}</td>
                  <td className="param-cell" data-label="W">
                    {row.id === 'topRing' && (
                      <input
                        type="number"
                        className="param-input"
                        value={topRing.w}
                        onChange={(e) => updateComponentParam('topRing', 'w', parseFloat(e.target.value) || 0)}
                      />
                    )}
                    {row.id === 'legPad' && (
                      <input
                        type="number"
                        className="param-input"
                        value={legPad.w}
                        onChange={(e) => updateComponentParam('legPad', 'w', parseFloat(e.target.value) || 0)}
                      />
                    )}
                    {row.id === 'basePlate' && (
                      <input
                        type="number"
                        className="param-input"
                        value={basePlate.w}
                        onChange={(e) => updateComponentParam('basePlate', 'w', parseFloat(e.target.value) || 0)}
                      />
                    )}
                    {row.id === 'leg' && (
                      <input
                        type="number"
                        className="param-input"
                        value={leg.w}
                        onChange={(e) => updateLegParam('w', parseFloat(e.target.value) || 0)}
                      />
                    )}
                    {!['topRing', 'legPad', 'basePlate', 'leg'].includes(row.id) && (
                      <span className="param-empty">—</span>
                    )}
                  </td>
                  <td className="param-cell" data-label="THK">
                    {row.id === 'top' && (
                      <input
                        type="number"
                        className="param-input"
                        value={topThickness}
                        onChange={(e) => setTopThickness(parseFloat(e.target.value) || 0)}
                      />
                    )}
                    {row.id === 'topRing' && (
                      <input
                        type="number"
                        className="param-input"
                        value={topRing.thk}
                        onChange={(e) => updateComponentParam('topRing', 'thk', parseFloat(e.target.value) || 0)}
                      />
                    )}
                    {row.id === 'legPad' && (
                      <input
                        type="number"
                        className="param-input"
                        value={legPad.thk}
                        onChange={(e) => updateComponentParam('legPad', 'thk', parseFloat(e.target.value) || 0)}
                      />
                    )}
                    {row.id === 'basePlate' && (
                      <input
                        type="number"
                        className="param-input"
                        value={basePlate.thk}
                        onChange={(e) => updateComponentParam('basePlate', 'thk', parseFloat(e.target.value) || 0)}
                      />
                    )}
                    {row.id === 'leg' && (
                      <input
                        type="number"
                        className="param-input"
                        value={leg.thk}
                        onChange={(e) => updateLegParam('thk', parseFloat(e.target.value) || 0)}
                      />
                    )}
                    {!['top', 'topRing', 'legPad', 'basePlate', 'leg'].includes(row.id) && (
                      <span className="param-empty">—</span>
                    )}
                  </td>
                  <td className="param-cell" data-label="QTY / L">
                    {row.id === 'legPad' && (
                      <input
                        type="number"
                        className="param-input"
                        value={legPad.qty}
                        onChange={(e) => updateComponentParam('legPad', 'qty', parseFloat(e.target.value) || 0)}
                      />
                    )}
                    {row.id === 'basePlate' && (
                      <input
                        type="number"
                        className="param-input"
                        value={basePlate.qty}
                        onChange={(e) => updateComponentParam('basePlate', 'qty', parseFloat(e.target.value) || 0)}
                      />
                    )}
                    {row.id === 'leg' && (
                      <input
                        type="number"
                        className="param-input"
                        value={leg.l}
                        onChange={(e) => updateLegParam('l', parseFloat(e.target.value) || 0)}
                        title="Length (L)"
                      />
                    )}
                    {!['legPad', 'basePlate', 'leg'].includes(row.id) && (
                      <span className="param-empty">—</span>
                    )}
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
                <td className="item-name" data-label=""><strong>Total Weight</strong></td>
                <td className="param-cell hide-mobile" data-label="W"><span className="param-empty">—</span></td>
                <td className="param-cell hide-mobile" data-label="THK"><span className="param-empty">—</span></td>
                <td className="param-cell hide-mobile" data-label="QTY / L"><span className="param-empty">—</span></td>
                <td className="num" data-label="Result"><strong>{formatNum(totalWeight)}</strong></td>
                <td className="rate-cell hide-mobile" data-label="Rate"><span className="param-empty">—</span></td>
                <td className="num hide-mobile" data-label="Total Amount"><span className="param-empty">—</span></td>
              </tr>
              <tr className="total-row total-row-amount">
                <td className="item-name" data-label=""><strong>Total Material Amount</strong></td>
                <td className="param-cell hide-mobile" data-label="W"><span className="param-empty">—</span></td>
                <td className="param-cell hide-mobile" data-label="THK"><span className="param-empty">—</span></td>
                <td className="param-cell hide-mobile" data-label="QTY / L"><span className="param-empty">—</span></td>
                <td className="num hide-mobile" data-label="Result"><span className="param-empty">—</span></td>
                <td className="rate-cell hide-mobile" data-label="Rate"><span className="param-empty">—</span></td>
                <td className="num" data-label="Total Amount"><strong>{formatCurrency(totalMaterialAmount)}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel summary-panel">
        <h2>Cost Summary</h2>
        <div className="summary-grid">
          <SummaryRow label="Total Material Rate" value={totalMaterialAmount} />
          <SummaryLabour
            percent={labourPercent}
            onPercentChange={setLabourPercent}
            value={labourCost}
          />
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
