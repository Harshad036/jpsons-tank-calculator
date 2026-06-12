import { useNavigate } from 'react-router-dom';
import type { CalculatorItem } from '../data/items';

interface ItemCardProps {
  item: CalculatorItem;
}

export default function ItemCard({ item }: ItemCardProps) {
  const navigate = useNavigate();

  return (
    <article className="item-card">
      {item.image && (
        <img
          src={item.image}
          alt={item.title}
          className="item-card-image"
        />
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
        Calculate
      </button>
    </article>
  );
}
