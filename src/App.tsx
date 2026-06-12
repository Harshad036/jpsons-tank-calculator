import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CalculatorPage from './pages/CalculatorPage';
import HomePage from './pages/HomePage';

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function App() {
  return (
    <BrowserRouter basename={routerBasename || undefined}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calculator/:itemId" element={<CalculatorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
