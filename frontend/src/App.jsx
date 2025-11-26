import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CompanyList from "./pages/CompanyList";
import CompanyRevenue from "./pages/CompanyRevenue";
import AddRevenue from "./pages/AddRevenue";
import Integrations from "./pages/Integrations";
import StripeIntegration from "./pages/StripeIntegration";
import RazorpayIntegration from "./pages/RazorpayIntegration";
import PaypalIntegration from "./pages/PaypalIntegration";
import TrustMRRLeaderboard from "./pages/Leaderboard";
import "./App.css";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("authToken") || "");

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [token]);

  function handleLogout() {
    setToken("");
  }

  return (
    <Router>
      <nav className="navbar">
        <div className="navbar-brand">TrustMRR</div>
        <div className="navbar-links">
          <Link to="/companies">Companies</Link>
          <Link to="/revenue">Revenue</Link>
          <Link to="/add">Add Revenue</Link>
          <Link to="/integrations">Integrations</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/signup">Signup</Link>
          {!token ? (
            <Link to="/login">Login</Link>
          ) : (
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          )}
        </div>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/companies" />} />
          <Route path="/login" element={<Login onLogin={setToken} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/companies" element={<CompanyList token={token} />} />
          <Route path="/revenue" element={<CompanyRevenue />} />
          <Route path="/add" element={<AddRevenue token={token} />} />
          <Route path="/integrations" element={<Integrations />} />
          <Route path="/integrations/stripe" element={<StripeIntegration />} />
          <Route path="/integrations/razorpay" element={<RazorpayIntegration />} />
          <Route path="/integrations/paypal" element={<PaypalIntegration />} />
          <Route path="/leaderboard" element={<TrustMRRLeaderboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
