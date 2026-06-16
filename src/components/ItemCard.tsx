import { useNavigate } from 'react-router-dom';
import type { CalculatorItem } from '../data/items';
import { assetUrl } from '../lib/assetUrl';

interface ItemCardProps {
  item: CalculatorItem;
}

export default function ItemCard({ item }: ItemCardProps) {
  const navigate = useNavigate();

  return (
    <article className="item-card">
      {item.image && (
        <div className="item-card-visual">
          <img
            src={assetUrl(item.image ?? '')}
            alt={item.title}
            className="item-card-image"
          />
        </div>
      )}
      <div className="item-info">
        <h2>{item.title}</h2>
        <p>{item.description}</p>
      </div>
      <button
        type="button"
        className="btn-calculate"
        onClick={() => navigate(`/calculator/${item.id}`)}
      >
        <span>Open Calculator</span>
        <span className="btn-calculate-arrow" aria-hidden="true">→</span>
      </button>
    </article>
  );
}
