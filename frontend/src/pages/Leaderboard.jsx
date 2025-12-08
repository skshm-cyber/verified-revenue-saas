import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, TrendingUp, Star, Info, Menu, X, Shield, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import './Leaderboard.css';
import AdSlot from '../components/AdSlot';
import BookAdModal from '../components/BookAdModal';

export default function TrustMRRLeaderboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [signupForm, setSignupForm] = useState({ username: '', email: '', password: '' });
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Revenue');
  const [timeFilter, setTimeFilter] = useState('All time');

  // Add Startup Modal State
  const [showAddStartupModal, setShowAddStartupModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('stripe');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [integrationForm, setIntegrationForm] = useState({
    apiKey: '',
    apiSecret: '',
    clientId: '',
    companyName: '',
    twitterHandle: '',
    category: 'saas',
    isAnonymous: false,
    showInLeaderboard: true
  });

  // Ad System State
  const [adSlots, setAdSlots] = useState({});
  const [adBookingState, setAdBookingState] = useState({ isOpen: false, slotId: null });

  useEffect(() => {
    const fetchAdSlots = async () => {
      try {
        const base = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
        const res = await fetch(`${base}/revenue/ads/slots/`);
        if (res.ok) {
          const data = await res.json();
          setAdSlots(data);
        }
      } catch (err) {
        console.error("Ads fetch error", err);
      }
    };
    fetchAdSlots();
  }, []);

  const handleBookAdClick = (slotId) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setAdBookingState({ isOpen: true, slotId });
  };

  const handleAdBookingSubmit = async (formData) => {
    const token = localStorage.getItem('authToken');
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        payload.append(key, formData[key]);
      }
    });

    const res = await fetch(`${base}/revenue/ads/book/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: payload
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || Array.isArray(err) ? err[0] : "Booking failed");
    }

    showMessage('success', 'Ad booked successfully! It is now live.');
    // Refresh ads
    const slotsRes = await fetch(`${base}/revenue/ads/slots/`);
    if (slotsRes.ok) setAdSlots(await slotsRes.json());
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }
    fetchCompanies(token);
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

  const fetchCompanies = async (token, category = 'all') => {
    console.log('🔍 Fetching companies with category:', category);
    setLoading(true);
    try {
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
      const categoryParam = category && category !== 'all' ? `?category=${category}` : '';
      const url = `${base}/revenue/companies/${categoryParam}`;
      console.log('📡 API URL:', url);

      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('❌ Failed to fetch companies', res.status, text);
        return;
      }

      const data = await res.json();
      console.log('✅ Raw API response:', data);
      console.log('📊 Number of companies received:', data.length);

      const list = Array.isArray(data) ? data : data.companies || [];
      const normalized = list.map((c, i) => ({
        id: c.id || i,
        name: c.is_anonymous ? 'Anonymous Company' : (c.name || c.company_name || 'Unknown'),
        tagline: c.category || 'SaaS',
        founder: c.is_anonymous ? 'Anonymous' : (c.founder_name || '@founder'),
        revenue: Number(c.monthly_revenue) || 0,
        growth: Number(c.mom_growth) || 0,
        isVerified: c.is_verified || false,
        isAnonymous: c.is_anonymous || false,
        logo: c.logo || null
      })).sort((a, b) => b.revenue - a.revenue)
        .map((c, i) => ({ ...c, rank: i + 1, badge: i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : null }));

      console.log('📋 Normalized companies:', normalized);
      console.log('🎯 Setting', normalized.length, 'companies to state');
      setCompanies(normalized);
    } catch (err) {
      console.error('❌ Failed to fetch companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsLoggedIn(false);
    showMessage('success', 'Logged out successfully');
  };

  // Automatic image processing function
  const processImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          // Target dimensions (square)
          const MAX_SIZE = 400;

          // Create canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Make it square by cropping to center
          const size = Math.min(img.width, img.height);
          const x = (img.width - size) / 2;
          const y = (img.height - size) / 2;

          // Set canvas to target size
          canvas.width = MAX_SIZE;
          canvas.height = MAX_SIZE;

          // Draw image (cropped and resized)
          ctx.drawImage(img, x, y, size, size, 0, 0, MAX_SIZE, MAX_SIZE);

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to process image'));
              }
            },
            'image/jpeg',
            0.85 // Quality (85%)
          );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Handle logo upload with automatic processing
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const processedBlob = await processImage(file);
      const processedFile = new File([processedBlob], file.name, { type: 'image/jpeg' });
      setIntegrationForm({ ...integrationForm, logo: processedFile });
    } catch (err) {
      showMessage('error', `Error processing image: ${err.message}`);
    }
  };

  const formatRevenue = (rev) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(rev);
  };

  const renderGrowth = (growth) => {
    if (growth > 0) return <span className="growth positive"><ArrowUp size={14} /> {growth.toFixed(1)}%</span>;
    if (growth < 0) return <span className="growth negative"><ArrowDown size={14} /> {Math.abs(growth).toFixed(1)}%</span>;
    return <span className="growth neutral"><Minus size={14} /></span>;
  };

  const handleAddStartupSubmit = async () => {
    if (!integrationForm.companyName) {
      showMessage('error', 'Please enter a startup name');
      return;
    }

    let endpoint = '';
    let body = {
      company_name: integrationForm.companyName,
      category: integrationForm.category,
      show_in_leaderboard: integrationForm.showInLeaderboard,
      is_anonymous: integrationForm.isAnonymous
    };

    if (selectedProvider === 'stripe') {
      if (!integrationForm.apiKey) {
        showMessage('error', 'Please enter Stripe API key');
        return;
      }
      endpoint = 'stripe/';
      body.api_key = integrationForm.apiKey;
    } else if (selectedProvider === 'razorpay') {
      if (!integrationForm.apiKey || !integrationForm.apiSecret) {
        showMessage('error', 'Please enter Razorpay Key ID and Secret');
        return;
      }
      endpoint = 'razorpay/';
      body.api_key = integrationForm.apiKey;
      body.api_secret = integrationForm.apiSecret;
    } else if (selectedProvider === 'paypal') {
      if (!integrationForm.clientId || !integrationForm.apiSecret) {
        showMessage('error', 'Please enter PayPal Client ID and Secret');
        return;
      }
      endpoint = 'paypal/';
      body.client_id = integrationForm.clientId;
      body.client_secret = integrationForm.apiSecret;
    }

    try {
      const token = localStorage.getItem('authToken');
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

      const formData = new FormData();
      // Append all body fields to FormData
      Object.keys(body).forEach(key => {
        formData.append(key, body[key]);
      });

      // Append new fields
      formData.append('description', integrationForm.description);
      formData.append('website', integrationForm.website);
      formData.append('twitter_handle', integrationForm.twitterHandle);
      if (integrationForm.logo) {
        formData.append('logo', integrationForm.logo);
      }

      const res = await fetch(`${base}/revenue/integrations/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Content-Type is handled automatically for FormData
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Integration failed');
      }

      showMessage('success', 'Startup added and revenue verified!');
      setShowAddStartupModal(false);
      setIntegrationForm({
        apiKey: '',
        apiSecret: '',
        clientId: '',
        companyName: '',
        twitterHandle: '',
        category: 'saas',
        isAnonymous: false,
        showInLeaderboard: true,
        description: '',
        website: '',
        logo: null
      });
      fetchCompanies(token, selectedCategory);
    } catch (err) {
      showMessage('error', err.message);
    }
  };

  return (
    <div className="leaderboard-container">
      {/* Status Message */}
      {statusMessage.text && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', padding: '15px 25px', borderRadius: '8px',
          backgroundColor: statusMessage.type === 'success' ? '#10b981' : '#ef4444', color: 'white', zIndex: 1000
        }}>
          {statusMessage.text}
        </div>
      )}

      <header className="header">
        <div className="header-top">
          <div className="brand">
            <Star className="brand-icon" size={24} fill="#4f46e5" />
            <span>TrustMRR</span>
          </div>
          {isLoggedIn ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => window.location.href = '/my-ads'}
                className="login-btn"
                style={{ background: '#4f46e5' }}
              >
                My Ads
              </button>
              <button onClick={handleLogout} className="login-btn">Logout</button>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="login-btn">Login</button>
          )}
        </div>
        <h1 className="main-title">The database of verified startup revenues</h1>

        <div className="search-bar-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search startups, founders, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="add-startup-btn"
            onClick={() => isLoggedIn ? setShowAddStartupModal(true) : setShowAuthModal(true)}
          >
            + Add startup
          </button>
        </div>

        <div className="category-filter-container">
          <label htmlFor="category-select" style={{ marginRight: '10px', color: '#888' }}>Filter by Category:</label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              fetchCompanies(localStorage.getItem('authToken'), e.target.value);
            }}
            className="filter-select"
            style={{ padding: '8px 12px', borderRadius: '6px', background: '#222', border: '1px solid #333', color: '#fff' }}
          >
            <option value="all">All Categories</option>
            <option value="saas">SaaS</option>
            <option value="youtuber_gamer">YouTuber - Gamer</option>
            <option value="youtuber_content_creator">YouTuber - Content Creator</option>
            <option value="youtuber_educational">YouTuber - Educational</option>
            <option value="influencer_instagram">Influencer - Instagram</option>
            <option value="influencer_facebook">Influencer - Facebook</option>
            <option value="influencer_twitter">Influencer - Twitter/X</option>
            <option value="indian_startup">Indian Startup</option>
            <option value="film_entertainment">Film/Entertainment</option>
            <option value="business_india">Business in India</option>
            <option value="ecommerce">E-commerce</option>
            <option value="consulting">Consulting</option>
            <option value="agency">Agency</option>
            <option value="other">Other</option>
          </select>
        </div>
      </header>

      <div className="main-content">
        {/* Left Sidebar */}
        <div className="side-column">
          <div className="side-column">
            {['left_1', 'left_2', 'left_3', 'left_4', 'left_5'].map(slotId => (
              <AdSlot
                key={slotId}
                slotId={slotId}
                status={adSlots[slotId]?.status || 'available'}
                adData={adSlots[slotId]?.ad}
                price={adSlots[slotId]?.price}
                onBookClick={handleBookAdClick}
              />
            ))}
          </div>
        </div>

        {/* Center Leaderboard */}
        <div className="leaderboard-panel">
          <div className="leaderboard-header">
            <div className="leaderboard-title">Leaderboard</div>
            <div className="filters">
              <select className="filter-select" value={selectedFilter} onChange={e => setSelectedFilter(e.target.value)}>
                <option>Revenue</option>
                <option>Growth</option>
              </select>
              <select className="filter-select" value={timeFilter} onChange={e => setTimeFilter(e.target.value)}>
                <option>All time</option>
                <option>This Month</option>
              </select>
            </div>
          </div>

          <div className="table-header">
            <div>#</div>
            <div>Startup</div>
            <div>Founder</div>
            <div>Revenue</div>
            <div>MoM Growth</div>
          </div>

          <div className="table-body">
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Loading...</div>
            ) : companies.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No companies found.</div>
            ) : (
              companies
                .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.founder.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((company) => (
                  <Link key={company.id} to={`/company/${company.id}`} className="table-row" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="rank">{company.badge || company.rank}</div>
                    <div className="startup-info">
                      {company.logo ? (
                        <img
                          src={company.logo.startsWith('http') ? company.logo : `http://localhost:8000${company.logo}`}
                          alt={company.name}
                          className="startup-logo"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="startup-logo" style={{
                        backgroundColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
                        display: company.logo ? 'none' : 'flex'
                      }}>
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <span className="startup-name">{company.name}</span>
                        <span className="startup-desc">{company.tagline}</span>
                      </div>
                    </div>
                    <div className="founder-info">
                      <div className="founder-avatar"></div>
                      <span>{company.founder}</span>
                    </div>
                    <div className="revenue">{formatRevenue(company.revenue)}</div>
                    <div className="growth-cell">
                      {renderGrowth(company.growth)}
                    </div>
                  </Link>
                ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="side-column">
          <div className="side-column">
            {['right_1', 'right_2', 'right_3', 'right_4', 'right_5'].map(slotId => (
              <AdSlot
                key={slotId}
                slotId={slotId}
                status={adSlots[slotId]?.status || 'available'}
                adData={adSlots[slotId]?.ad}
                price={adSlots[slotId]?.price}
                onBookClick={handleBookAdClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Browse by Category Section */}
      <div style={{
        maxWidth: '1400px',
        margin: '60px auto 40px auto',
        padding: '0 20px',
        borderTop: '1px solid #222',
        paddingTop: '60px'
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '2rem',
          marginBottom: '40px',
          fontWeight: '600'
        }}>
          Browse by category
        </h2>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'center',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {[
            { value: 'saas', label: 'SaaS', icon: '💼' },
            { value: 'youtuber_gamer', label: 'YouTuber - Gamer', icon: '🎮' },
            { value: 'youtuber_content_creator', label: 'Content Creator', icon: '🎬' },
            { value: 'youtuber_educational', label: 'Educational', icon: '📚' },
            { value: 'influencer_instagram', label: 'Instagram', icon: '📸' },
            { value: 'influencer_facebook', label: 'Facebook', icon: '👥' },
            { value: 'influencer_twitter', label: 'Twitter/X', icon: '🐦' },
            { value: 'indian_startup', label: 'Indian Startup', icon: '🇮🇳' },
            { value: 'film_entertainment', label: 'Film/Entertainment', icon: '🎭' },
            { value: 'business_india', label: 'Business in India', icon: '🏢' },
            { value: 'ecommerce', label: 'E-commerce', icon: '🛒' },
            { value: 'consulting', label: 'Consulting', icon: '💡' },
            { value: 'agency', label: 'Agency', icon: '🎨' },
            { value: 'other', label: 'Other', icon: '📦' }
          ].map(cat => (
            <button
              key={cat.value}
              onClick={() => {
                setSelectedCategory(cat.value);
                fetchCompanies(localStorage.getItem('authToken'), cat.value);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                padding: '12px 20px',
                background: selectedCategory === cat.value ? '#4f46e5' : '#1a1a1a',
                border: '1px solid',
                borderColor: selectedCategory === cat.value ? '#4f46e5' : '#333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== cat.value) {
                  e.currentTarget.style.background = '#252525';
                  e.currentTarget.style.borderColor = '#555';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== cat.value) {
                  e.currentTarget.style.background = '#1a1a1a';
                  e.currentTarget.style.borderColor = '#333';
                }
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{ backgroundColor: '#111', border: '1px solid #333', padding: '30px', borderRadius: '16px', width: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2>{authMode === 'login' ? 'Login' : 'Sign Up'}</h2>
              <button onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
            </div>
            <input
              style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
              placeholder="Username"
              value={authMode === 'login' ? loginForm.username : signupForm.username}
              onChange={e => authMode === 'login' ? setLoginForm({ ...loginForm, username: e.target.value }) : setSignupForm({ ...signupForm, username: e.target.value })}
            />
            {authMode === 'signup' && (
              <input
                style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
                placeholder="Email"
                value={signupForm.email}
                onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
              />
            )}
            <input
              style={{ width: '100%', padding: '10px', marginBottom: '20px', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
              placeholder="Password"
              type="password"
              value={authMode === 'login' ? loginForm.password : signupForm.password}
              onChange={e => authMode === 'login' ? setLoginForm({ ...loginForm, password: e.target.value }) : setSignupForm({ ...signupForm, password: e.target.value })}
            />
            <button
              onClick={authMode === 'login' ? handleLogin : handleSignup}
              style={{ width: '100%', padding: '12px', background: '#fff', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {authMode === 'login' ? 'Login' : 'Sign Up'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '15px', color: '#888', fontSize: '0.9rem' }}>
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <span
                style={{ color: '#fff', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
              >
                {authMode === 'login' ? 'Sign up' : 'Login'}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Add Startup Modal */}
      {showAddStartupModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '16px',
            width: '600px',
            maxWidth: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>Add your startup</h2>
                <p style={{ margin: 0, color: '#888', fontSize: '0.85rem' }}>Get a dedicated page on TrustMRR to showcase your startup's verified revenue.</p>
              </div>
              <button onClick={() => setShowAddStartupModal(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Provider Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #333', padding: '0 20px' }}>
              {['stripe', 'razorpay', 'paypal'].map(provider => (
                <button
                  key={provider}
                  onClick={() => setSelectedProvider(provider)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '15px 20px',
                    color: selectedProvider === provider ? '#fff' : '#888',
                    cursor: 'pointer',
                    borderBottom: selectedProvider === provider ? '2px solid #4f46e5' : '2px solid transparent',
                    textTransform: 'capitalize'
                  }}
                >
                  {provider}
                </button>
              ))}
            </div>

            {/* Form */}
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.9rem' }}>Startup Name</label>
                <input
                  type="text"
                  placeholder="e.g. My Awesome SaaS"
                  value={integrationForm.companyName}
                  onChange={(e) => setIntegrationForm({ ...integrationForm, companyName: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.9rem' }}>Description</label>
                <textarea
                  placeholder="Brief description of your startup"
                  value={integrationForm.description}
                  onChange={(e) => setIntegrationForm({ ...integrationForm, description: e.target.value })}
                  maxLength={500}
                  rows={3}
                  style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.9rem' }}>Website URL</label>
                  <input
                    type="url"
                    placeholder="https://"
                    value={integrationForm.website}
                    onChange={(e) => setIntegrationForm({ ...integrationForm, website: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.9rem' }}>Twitter Handle</label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={integrationForm.twitterHandle}
                    onChange={(e) => setIntegrationForm({ ...integrationForm, twitterHandle: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.9rem' }}>Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
                />
                <div style={{ marginTop: '5px', fontSize: '0.75rem', color: '#666', lineHeight: '1.3' }}>
                  Upload any image - automatically resized to 400×400px and optimized for web
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.9rem' }}>Category</label>
                <select
                  value={integrationForm.category}
                  onChange={(e) => setIntegrationForm({ ...integrationForm, category: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
                >
                  <option value="saas">SaaS</option>
                  <option value="youtuber_gamer">YouTuber - Gamer</option>
                  <option value="youtuber_content_creator">YouTuber - Content Creator</option>
                  <option value="youtuber_educational">YouTuber - Educational</option>
                  <option value="influencer_instagram">Influencer - Instagram</option>
                  <option value="influencer_facebook">Influencer - Facebook</option>
                  <option value="influencer_twitter">Influencer - Twitter/X</option>
                  <option value="indian_startup">Indian Startup</option>
                  <option value="film_entertainment">Film/Entertainment</option>
                  <option value="business_india">Business in India</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="consulting">Consulting</option>
                  <option value="agency">Agency</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setIntegrationForm({ ...integrationForm, showInLeaderboard: !integrationForm.showInLeaderboard })}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '1px solid #666',
                  borderRadius: '4px',
                  backgroundColor: integrationForm.showInLeaderboard ? '#4f46e5' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {integrationForm.showInLeaderboard && <div style={{ width: '8px', height: '8px', backgroundColor: '#fff', borderRadius: '2px' }}></div>}
                </div>
                <span style={{ color: '#ccc', fontSize: '0.9rem' }}>Show in public leaderboard</span>
              </div>

              {selectedProvider === 'stripe' && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.9rem' }}>Stripe API key</label>
                  <input
                    type="text"
                    placeholder="rk_live_..."
                    value={integrationForm.apiKey}
                    onChange={(e) => setIntegrationForm({ ...integrationForm, apiKey: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px', fontFamily: 'monospace' }}
                  />
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.75rem', color: '#666' }}>Click here to create a read-only API key.</p>
                </div>
              )}

              {selectedProvider === 'razorpay' && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.9rem' }}>Key ID</label>
                    <input
                      type="text"
                      placeholder="rzp_live_..."
                      value={integrationForm.apiKey}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, apiKey: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.9rem' }}>Key Secret</label>
                    <input
                      type="password"
                      placeholder="Secret..."
                      value={integrationForm.apiSecret}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, apiSecret: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px', fontFamily: 'monospace' }}
                    />
                  </div>
                </>
              )}

              {selectedProvider === 'paypal' && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.9rem' }}>Client ID</label>
                    <input
                      type="text"
                      placeholder="Client ID..."
                      value={integrationForm.clientId}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, clientId: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.9rem' }}>Secret</label>
                    <input
                      type="password"
                      placeholder="Secret..."
                      value={integrationForm.apiSecret}
                      onChange={(e) => setIntegrationForm({ ...integrationForm, apiSecret: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px', fontFamily: 'monospace' }}
                    />
                  </div>
                </>
              )}

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.9rem' }}>X handle (optional)</label>
                <input
                  type="text"
                  placeholder="@username"
                  value={integrationForm.twitterHandle}
                  onChange={(e) => setIntegrationForm({ ...integrationForm, twitterHandle: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
                />
              </div>

              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setIntegrationForm({ ...integrationForm, isAnonymous: !integrationForm.isAnonymous })}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '1px solid #666',
                  borderRadius: '4px',
                  backgroundColor: integrationForm.isAnonymous ? '#4f46e5' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {integrationForm.isAnonymous && <div style={{ width: '8px', height: '8px', backgroundColor: '#fff', borderRadius: '2px' }}></div>}
                </div>
                <span style={{ color: '#ccc', fontSize: '0.9rem' }}>Anonymous mode</span>
                <Info size={16} color="#666" />
              </div>

              <button
                onClick={handleAddStartupSubmit}
                style={{ width: '100%', padding: '12px', background: '#fff', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Add startup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Booking Modal */}
      <BookAdModal
        isOpen={adBookingState.isOpen}
        onClose={() => setAdBookingState({ isOpen: false, slotId: null })}
        slotId={adBookingState.slotId}
        onBook={handleAdBookingSubmit}
      />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #222',
        marginTop: '80px',
        paddingTop: '60px',
        paddingBottom: '40px',
        maxWidth: '1400px',
        margin: '80px auto 0 auto',
        padding: '60px 20px 40px 20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Navigation */}
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '20px', color: '#fff' }}>Navigation</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>Stats</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>Olympics</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>Categories</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>Recently Added</a>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: '0.9rem' }}>Top 100 Startups</a>
              </li>
            </ul>
          </div>

          {/* Browse Startups */}
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '20px', color: '#fff' }}>Browse Startups</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '12px' }}>
                <button
                  onClick={() => {
                    setSelectedCategory('saas');
                    fetchCompanies(localStorage.getItem('authToken'), 'saas');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
                >
                  SaaS
                </button>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <button
                  onClick={() => {
                    setSelectedCategory('youtuber_gamer');
                    fetchCompanies(localStorage.getItem('authToken'), 'youtuber_gamer');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
                >
                  YouTubers
                </button>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <button
                  onClick={() => {
                    setSelectedCategory('influencer_instagram');
                    fetchCompanies(localStorage.getItem('authToken'), 'influencer_instagram');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
                >
                  Influencers
                </button>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <button
                  onClick={() => {
                    setSelectedCategory('indian_startup');
                    fetchCompanies(localStorage.getItem('authToken'), 'indian_startup');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
                >
                  Indian Startups
                </button>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <button
                  onClick={() => {
                    setSelectedCategory('ecommerce');
                    fetchCompanies(localStorage.getItem('authToken'), 'ecommerce');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}
                >
                  E-commerce
                </button>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '20px', color: '#fff' }}>About TrustMRR</h3>
            <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
              The database of verified startup revenues. Track real revenue data from payment processors like Stripe, Razorpay, and PayPal.
            </p>
            <div style={{ marginTop: '20px' }}>
              <a href="#" style={{ color: '#4f46e5', textDecoration: 'none', fontSize: '0.9rem' }}>Add your startup →</a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          borderTop: '1px solid #222',
          paddingTop: '30px',
          textAlign: 'center',
          color: '#666',
          fontSize: '0.85rem'
        }}>
          <p style={{ margin: 0 }}>© 2025 TrustMRR. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
