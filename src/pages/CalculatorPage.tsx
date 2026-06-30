import { Navigate, useParams } from 'react-router-dom';
import { getItemById } from '../data/items';
import AgitatorCalculatorPage from './AgitatorCalculatorPage';
import HighShearMixerCalculatorPage from './HighShearMixerCalculatorPage';
import JacketedCalculatorPage from './JacketedCalculatorPage';
import MixingCalculatorPage from './MixingCalculatorPage';

export default function CalculatorPage() {
  const { itemId } = useParams<{ itemId: string }>();
  const item = itemId ? getItemById(itemId) : undefined;

  if (!item) {
    return <Navigate to="/" replace />;
  }

  if (item.id === 'agitator') {
    return <AgitatorCalculatorPage item={item} />;
  }

  if (item.id === 'high-shear-mixer') {
    return <HighShearMixerCalculatorPage item={item} />;
  }

  if (item.id === 'jacketed-mixing-tank') {
    return <JacketedCalculatorPage item={item} />;
  }

  return <MixingCalculatorPage item={item} />;
}
