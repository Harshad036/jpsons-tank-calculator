import CompanyLogo from '../components/CompanyLogo';
import InstallPrompt from '../components/InstallPrompt';
import ItemCard from '../components/ItemCard';
import { CALCULATOR_ITEMS } from '../data/items';

export default function HomePage() {
  return (
    <div className="app home-page">
      <CompanyLogo />

      <InstallPrompt />

      <section className="item-list">
        <h2 className="section-title">Equipment</h2>
        <ul className="item-list-items">
          {CALCULATOR_ITEMS.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} />
            </li>
          ))}
        </ul>
      </section>

      <footer className="footer">
        <p>Works offline after install. Use Chrome on Android or Safari on iPhone to add to home screen.</p>
      </footer>
    </div>
  );
}
