import { useState, useEffect } from 'react';
import { Search, Plus, TrendingUp, Star, Info, Menu, X } from 'lucide-react';

export default function TrustMRRLeaderboard() {
  // ...existing state and logic from your previous code...
  // For brevity, paste all your logic and handlers here

  // --- BEGIN LOGIC ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [signupForm, setSignupForm] = useState({ username: '', email: '', password: '' });
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [companies, setCompanies] = useState([
    { id: 1, rank: 1, name: 'Gumroad', tagline: 'Go from 0 to $1', founder: '@sh1', revenue: 878595861, growth: 0, badge: '🏆' },
    { id: 2, rank: 2, name: 'easytools', tagline: 'Sell digital products easier than ever', founder: '@greg_rog', revenue: 82107087, growth: 0, badge: '🥈' },
    { id: 3, rank: 3, name: 'MaidsnBlack', tagline: 'Home Cleaning Tech Driven Platform', founder: '@rohangilkes', revenue: 21772745, growth: 12, badge: '🥉' },
    { id: 4, rank: 4, name: 'Stack Influence', tagline: 'Micro Creator marketing platform for eCo...', founder: '@laurent_vinc', revenue: 19779977, growth: 8, badge: null }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Revenue');
  const [timeFilter, setTimeFilter] = useState('All time');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
      fetchCompanies(token);
    }
  }, []);

  const showMessage = (type, text) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
  };

  const handleLogin = async () => {
    if (!loginForm.username || !loginForm.password) {
      showMessage('error', 'Please fill all fields');
      return;
    }
    try {
      const res = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.detail || 'Login failed');
      }
      localStorage.setItem('authToken', data.access);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      showMessage('success', 'Successfully logged in!');
      fetchCompanies(data.access);
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const handleSignup = async () => {
    if (!signupForm.username || !signupForm.email || !signupForm.password) {
      showMessage('error', 'Please fill all fields');
      return;
    }
    try {
      const res = await fetch('http://localhost:8000/api/signup/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }
      showMessage('success', 'Account created! Please login.');
      setAuthMode('login');
      setLoginForm({ username: signupForm.username, password: '' });
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  const fetchCompanies = async (token) => {
    try {
      const res = await fetch('http://localhost:8000/api/revenue/companies/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.companies && data.companies.length > 0) {
          setCompanies(data.companies.map((c, i) => ({
            ...c,
            rank: i + 1,
            revenue: Math.floor(Math.random() * 100000000),
            growth: Math.floor(Math.random() * 20),
            founder: '@founder',
            tagline: 'Verified Company',
            badge: i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
          })));
        }
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    showMessage('success', 'Logged out successfully');
  };

  const formatRevenue = (rev) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(rev);
  };
  // --- END LOGIC ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white font-mono">
      {/* Status Message */}
      {statusMessage.text && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-xl backdrop-blur-lg ${
          statusMessage.type === 'success' ? 'bg-green-600/80' : 'bg-red-600/80'
        }`}>
          {statusMessage.text}
        </div>
      )}
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-gray-800 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Star className="w-6 h-6 text-blue-500 fill-blue-500 drop-shadow" />
              <span className="text-xl font-bold tracking-wide">TrustMRR</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {isLoggedIn ? (
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition hover:bg-gray-800 rounded"
                >
                  Logout
                </button>
              ) : (
                <button 
                  onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition hover:bg-gray-800 rounded"
                >
                  Login
                </button>
              )}
            </div>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-800 bg-black/90">
              {isLoggedIn ? (
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-900 rounded">
                  Logout
                </button>
              ) : (
                <button 
                  onClick={() => { setShowAuthModal(true); setAuthMode('login'); setIsMenuOpen(false); }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-900 rounded"
                >
                  Login
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
      {/* Main Content */}
      <div className="pt-16 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center py-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow">
              The database of verified startup<br />revenues
            </h1>
            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mt-12 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search startups, founders, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-900/80 border border-gray-800 rounded-xl focus:border-blue-500 outline-none text-sm shadow-inner transition"
                />
              </div>
              <button 
                onClick={() => isLoggedIn ? showMessage('info', 'Add startup feature coming soon!') : setShowAuthModal(true)}
                className="px-6 py-4 bg-gradient-to-r from-blue-400 to-pink-400 text-black rounded-xl font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Add startup
              </button>
            </div>
            {/* Navigation Tabs */}
            <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-400">
              <button className="hover:text-white transition">Stats</button>
              <span className="text-gray-700">·</span>
              <button className="hover:text-white transition">Olympics</button>
              <span className="text-gray-700">·</span>
              <button className="hover:text-white transition">Categories</button>
              <span className="text-gray-700">·</span>
              <button className="hover:text-white transition">$1 vs $1,000,000</button>
            </div>
          </div>
          {/* Leaderboard */}
          <div className="bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <h2 className="text-2xl font-bold mb-4 md:mb-0">Leaderboard</h2>
              <div className="flex gap-3">
                <select 
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm outline-none cursor-pointer focus:border-blue-500"
                >
                  <option>Revenue</option>
                  <option>Growth</option>
                  <option>MRR</option>
                </select>
                <select 
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm outline-none cursor-pointer focus:border-blue-500"
                >
                  <option>All time</option>
                  <option>This year</option>
                  <option>This month</option>
                </select>
              </div>
            </div>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-800 text-sm text-gray-400">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Startup</div>
              <div className="col-span-3">Founder</div>
              <div className="col-span-3">Revenue</div>
              <div className="col-span-1">MoM Growth</div>
            </div>
            {/* Table Body */}
            <div className="space-y-2 mt-4">
              {companies
                .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            c.founder.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((company) => (
                <div 
                  key={company.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-900/40 hover:to-pink-900/40 transition cursor-pointer shadow-md hover:scale-[1.02] duration-150"
                >
                  {/* Rank & Badge */}
                  <div className="col-span-1 flex items-center gap-2">
                    {company.badge && <span className="text-2xl">{company.badge}</span>}
                    {!company.badge && <span className="text-gray-600">{company.rank}</span>}
                  </div>
                  {/* Startup Info */}
                  <div className="col-span-12 md:col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-lg font-bold shadow-lg">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{company.name}</div>
                      <div className="text-sm text-gray-400 truncate">{company.tagline}</div>
                    </div>
                  </div>
                  {/* Founder */}
                  <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                    <span className="text-gray-400">{company.founder}</span>
                  </div>
                  {/* Revenue */}
                  <div className="col-span-12 md:col-span-3 flex items-center gap-2">
                    <span className="font-bold">{formatRevenue(company.revenue)}</span>
                    <Info className="w-4 h-4 text-gray-600" />
                  </div>
                  {/* Growth */}
                  <div className="col-span-12 md:col-span-1 flex items-center">
                    {company.growth > 0 && (
                      <div className="flex items-center gap-1 text-green-500 animate-pulse">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">{company.growth}%</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Empty State */}
            {companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
              <div className="text-center py-12 text-gray-400">
                No startups found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 border border-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {authMode === 'login' ? 'Welcome back' : 'Create account'}
              </h2>
              <button onClick={() => setShowAuthModal(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>
            </div>
            {/* ...existing modal form code... */}
            {authMode === 'login' ? (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none focus:border-gray-600"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none focus:border-gray-600"
                />
                <button 
                  onClick={handleLogin}
                  className="w-full px-4 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Login
                </button>
                <p className="text-center text-sm text-gray-400">
                  Don't have an account?{' '}
                  <button onClick={() => setAuthMode('signup')} className="text-white hover:underline">
                    Sign up
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={signupForm.username}
                  onChange={(e) => setSignupForm({...signupForm, username: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none focus:border-gray-600"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({...signupForm, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none focus:border-gray-600"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({...signupForm, password: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && handleSignup()}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg outline-none focus:border-gray-600"
                />
                <button 
                  onClick={handleSignup}
                  className="w-full px-4 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Sign up
                </button>
                <p className="text-center text-sm text-gray-400">
                  Already have an account?{' '}
                  <button onClick={() => setAuthMode('login')} className="text-white hover:underline">
                    Login
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
