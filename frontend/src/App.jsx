import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Leaderboard from './pages/Leaderboard';
import CompanyProfile from './pages/CompanyProfile';
import MyAds from './pages/MyAds';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Leaderboard />} />
        <Route path="/company/:id" element={<CompanyProfile />} />
        <Route path="/my-ads" element={<MyAds />} />
      </Routes>
    </Router>
  );
}

export default App;
