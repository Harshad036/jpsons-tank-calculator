import CompanyLogo from '../components/CompanyLogo';
import InstallPrompt from '../components/InstallPrompt';
import ItemCard from '../components/ItemCard';
import { CALCULATOR_ITEMS } from '../data/items';

export default function HomePage() {
  return (
    <div className="app home-page">
      <header className="home-hero">
        <CompanyLogo />
        <p className="home-tagline">
          Professional mixing equipment calculators for material weight and costing
        </p>
      </header>

      <InstallPrompt />

      <section className="home-equipment" aria-labelledby="equipment-heading">
        <div className="section-header">
          <h2 id="equipment-heading">Equipment Calculators</h2>
          <p>Select a tank type to estimate weight, material rate, and total cost</p>
        </div>
        <ul className="item-list-items">
          {CALCULATOR_ITEMS.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} />
            </li>
          ))}
        </ul>
      </section>

      <footer className="home-footer">
        <p>Install on your device for quick access and offline use.</p>
      </footer>
    </div>
  );
}
