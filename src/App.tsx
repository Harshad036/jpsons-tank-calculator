import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CalculatorPage from './pages/CalculatorPage';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calculator/:itemId" element={<CalculatorPage />} />
      </Routes>
    </BrowserRouter>
  );
}
