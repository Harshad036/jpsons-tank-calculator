import { assetUrl } from '../lib/assetUrl';

export default function CompanyLogo() {
  return (
    <div className="company-logo">
      <img
        src={assetUrl('logo.png')}
        alt="JP Sons Engineering — Manufacture & Exports, All Type of Mixing Equipments Manufacturer"
        className="logo-image"
      />
    </div>
  );
}
