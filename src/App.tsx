import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CalculatorPage from './pages/CalculatorPage';
import HomePage from './pages/HomePage';

function routerBasename(): string | undefined {
  const base = import.meta.env.BASE_URL;
  if (!base || base === '/' || base === './') return undefined;
  return base.replace(/\/$/, '');
}

export default function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calculator/:itemId" element={<CalculatorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
