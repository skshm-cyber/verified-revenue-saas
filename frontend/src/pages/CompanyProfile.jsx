import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Edit, Trash2, Code, Share2, HelpCircle, TrendingUp } from 'lucide-react';
import './CompanyProfile.css';
import EditCompanyModal from '../components/EditCompanyModal';

export default function CompanyProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showEmbedModal, setShowEmbedModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [otherCompanies, setOtherCompanies] = useState([]);
    const [companyRank, setCompanyRank] = useState(null);
    const [currentUser, setCurrentUser] = useState(null); // Store the logged-in user's info

    useEffect(() => {
        fetchCompanyDetails();
        fetchOtherCompanies();
    }, [id]);

    // Fetch current user info from backend
    useEffect(() => {
        const fetchCurrentUser = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setCurrentUser(null);
                return;
            }

            try {
                const base = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
                const res = await fetch(`${base}/profile/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const userData = await res.json();
                    console.log('👤 Fetched current user:', userData);
                    setCurrentUser(userData);
                } else {
                    setCurrentUser(null);
                }
            } catch (e) {
                console.error('Error fetching user profile:', e);
                setCurrentUser(null);
            }
        };
        fetchCurrentUser();
    }, []);

    // Re-check ownership whenever company data changes
    useEffect(() => {
        if (!company) return;

        const token = localStorage.getItem('authToken');
        if (!token) {
            console.log('⚠️ No token, setting isOwner=false');
            setIsOwner(false);
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const username = payload.username;
            const addedByUsername = company.added_by_username || '';
            const founderName = company.founder_name || company.founder || '';

            console.log('🔄 Re-checking ownership on company change:');
            console.log('  Username from token:', username);
            console.log('  Company added_by_username:', addedByUsername);
            console.log('  Company founder/founder_name:', founderName);

            const isOwner = (addedByUsername && addedByUsername === username) ||
                (founderName && founderName === username);

            console.log('  Result: isOwner =', isOwner);
            setIsOwner(isOwner);
        } catch (e) {
            console.error('❌ Error in ownership re-check:', e);
            setIsOwner(false);
        }
    }, [company]);

    const fetchCompanyDetails = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const base = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
            const res = await fetch(`${base}/revenue/companies/`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : data.companies || [];

                // Sort by revenue to calculate rank
                const sorted = list.filter(c => c.show_in_leaderboard).sort((a, b) => Number(b.monthly_revenue) - Number(a.monthly_revenue));
                const found = sorted.find(c => c.id === parseInt(id));

                if (found) {
                    const rank = sorted.findIndex(c => c.id === parseInt(id)) + 1;
                    setCompanyRank(rank);

                    setCompany({
                        ...found,
                        revenue: Number(found.monthly_revenue) || 0,
                        growth: Number(found.mom_growth) || 0,
                        founder: found.founder_name || '@founder',
                        tagline: found.tagline || found.category || 'SaaS',
                        description: found.description || '',
                        website: found.website || '',
                        twitter_handle: found.twitter_handle || '',
                        logo: found.logo || null,
                        founding_date: found.founding_date || null,
                        country: found.country || null,
                        follower_count: found.follower_count || 0,
                        estimated_mrr: Number(found.estimated_mrr) || null
                    });

                    // Check ownership with comprehensive logging
                    if (token) {
                        try {
                            const payload = JSON.parse(atob(token.split('.')[1]));
                            console.log('🔍 Checking ownership:');
                            console.log('  Token username:', payload.username);
                            console.log('  Company added_by_username:', found.added_by_username);
                            console.log('  Company founder_name:', found.founder_name);
                            console.log('  Company added_by:', found.added_by);

                            // More robust ownership check
                            const username = payload.username;
                            const addedByUsername = found.added_by_username || '';
                            const founderName = found.founder_name || '';

                            const isOwnerByAddedBy = addedByUsername && addedByUsername === username;
                            const isOwnerByFounder = founderName && founderName === username;

                            console.log('  Match by added_by:', isOwnerByAddedBy);
                            console.log('  Match by founder:', isOwnerByFounder);

                            if (isOwnerByAddedBy || isOwnerByFounder) {
                                console.log('✅ USER IS OWNER - Setting isOwner = true');
                                setIsOwner(true);
                            } else {
                                console.log('❌ User is NOT owner');
                                setIsOwner(false);
                            }
                        } catch (e) {
                            console.error('❌ Error checking ownership:', e);
                            setIsOwner(false);
                        }
                    } else {
                        console.log('⚠️ No auth token found');
                        setIsOwner(false);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch company:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOtherCompanies = async () => {
        try {
            const base = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
            const res = await fetch(`${base}/revenue/companies/`);
            if (res.ok) {
                const data = await res.json();
                const list = Array.isArray(data) ? data : data.companies || [];
                // Get random 3 companies excluding current one
                const others = list
                    .filter(c => c.id !== parseInt(id) && c.show_in_leaderboard)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3);
                setOtherCompanies(others);
            }
        } catch (err) {
            console.error('Failed to fetch other companies:', err);
        }
    };

    const handleUpdate = (updatedCompany) => {
        console.log('📝 handleUpdate called with:', updatedCompany);

        setCompany({
            ...updatedCompany,
            revenue: Number(updatedCompany.monthly_revenue) || 0,
            growth: Number(updatedCompany.mom_growth) || 0,
            founder: updatedCompany.founder_name || '@founder',
            tagline: updatedCompany.tagline || updatedCompany.category || 'SaaS',
            description: updatedCompany.description || '',
            website: updatedCompany.website || '',
            twitter_handle: updatedCompany.twitter_handle || '',
            logo: updatedCompany.logo || null,
            founding_date: updatedCompany.founding_date || null,
            country: updatedCompany.country || null,
            follower_count: updatedCompany.follower_count || 0,
            estimated_mrr: Number(updatedCompany.estimated_mrr) || null
        });

        // CRITICAL: Re-verify and FORCE ownership to true after update
        // Since the user just successfully updated, they MUST be the owner
        console.log('✅ Setting isOwner to TRUE after successful update');
        setIsOwner(true);
    };

    const handleDelete = () => {
        navigate('/');
    };

    const formatRevenue = (rev) => {
        if (rev >= 1000000) {
            return `$${(rev / 1000000).toFixed(1)}M`;
        }
        if (rev >= 1000) {
            return `$${(rev / 1000).toFixed(0)}k`;
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(rev);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    const copyEmbedCode = () => {
        const embedCode = `<iframe src="${window.location.origin}/embed/${id}" width="300" height="400" frameborder="0"></iframe>`;
        navigator.clipboard.writeText(embedCode);
        alert('Embed code copied to clipboard!');
    };

    const shareUrl = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="company-profile-container">
                <div style={{ textAlign: 'center', padding: '100px 20px', color: '#888' }}>
                    Loading...
                </div>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="company-profile-container">
                <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <h2>Company not found</h2>
                    <Link to="/" style={{ color: '#4f46e5', textDecoration: 'none' }}>← Back to Leaderboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="company-profile-container" style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff' }}>
            {/* Header with breadcrumb */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px', color: '#888', fontSize: '0.9rem' }}>
                    <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>★ TrustMRR</Link>
                    <span>›</span>
                    <Link to="/" style={{ color: '#888', textDecoration: 'none' }}>Startup</Link>
                    <span>›</span>
                    <span style={{ color: '#fff' }}>{company.name}</span>
                </div>

                {/* Company Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        {company.logo ? (
                            <img
                                src={company.logo.startsWith('http') ? company.logo : `http://localhost:8000${company.logo}`}
                                alt={company.name}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '12px',
                                    objectFit: 'cover',
                                    border: '1px solid #333'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '12px',
                            backgroundColor: '#222',
                            display: company.logo ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            border: '1px solid #333'
                        }}>
                            {company.name.charAt(0)}
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: '600', margin: '0 0 8px 0' }}>{company.name}</h1>
                            <p style={{ color: '#888', margin: 0 }}>{company.tagline}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button style={{ padding: '8px 16px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <HelpCircle size={16} /> Get Intro
                        </button>
                        {company.website && (
                            <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 16px', backgroundColor: '#fff', border: 'none', color: '#000', borderRadius: '6px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                                Visit <ExternalLink size={16} />
                            </a>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px' }}>
                    <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '20px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            Total revenue {companyRank && <span style={{ padding: '2px 6px', backgroundColor: '#222', borderRadius: '4px', fontSize: '0.75rem' }}>#{companyRank}</span>}
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '4px' }}>{formatRevenue(company.revenue)}</div>
                        <div style={{ fontSize: '0.85rem', color: company.growth >= 0 ? '#10b981' : '#ef4444' }}>
                            {company.growth >= 0 ? '+' : ''}{company.growth}% MoM growth
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '20px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            MRR (estimated) <HelpCircle size={14} />
                        </div>
                        <div style={{ fontSize: '1.4rem', fontWeight: '500', color: '#888' }}>
                            {company.estimated_mrr ? formatRevenue(company.estimated_mrr) : 'Loading...'}
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '20px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '12px' }}>Founder</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {company.founder_photo ? (
                                <img
                                    src={company.founder_photo.startsWith('http') ? company.founder_photo : `http://localhost:8000${company.founder_photo}`}
                                    alt={company.founder}
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#333',
                                display: company.founder_photo ? 'none' : 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {company.founder.charAt(0)}
                            </div>
                            <div>
                                <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{company.founder}</div>
                                {company.follower_count > 0 && (
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>{company.follower_count.toLocaleString()} followers on X</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '20px' }}>
                        <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '8px' }}>Founded</div>
                        {company.founding_date && (
                            <div style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '4px' }}>{formatDate(company.founding_date)}</div>
                        )}
                        {company.country && (
                            <div style={{ fontSize: '0.85rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                🇺🇸 {company.country}
                            </div>
                        )}
                    </div>
                </div>

                {/* Revenue Graph */}
                <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{formatRevenue(company.revenue * 0.25)} revenue last 4 weeks</div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <select style={{ padding: '6px 12px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}>
                                <option>Revenue</option>
                            </select>
                            <select style={{ padding: '6px 12px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px', fontSize: '0.85rem' }}>
                                <option>Last 4 we</option>
                            </select>
                        </div>
                    </div>
                    <div style={{ height: '300px', position: 'relative' }}>
                        <svg viewBox="0 0 800 300" style={{ width: '100%', height: '100%' }}>
                            <defs>
                                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" style={{ stopColor: '#4f46e5', stopOpacity: 0.6 }} />
                                    <stop offset="100%" style={{ stopColor: '#4f46e5', stopOpacity: 0 }} />
                                </linearGradient>
                            </defs>
                            <path
                                d="M 0 150 Q 100 120, 200 100 T 400 80 T 600 70 T 800 90"
                                stroke="#4f46e5"
                                strokeWidth="3"
                                fill="none"
                            />
                            <path
                                d="M 0 150 Q 100 120, 200 100 T 400 80 T 600 70 T 800 90 L 800 300 L 0 300 Z"
                                fill="url(#areaGradient)"
                            />
                        </svg>
                    </div>
                </div>

                {/* Verification Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#888', fontSize: '0.85rem', marginBottom: '20px' }}>
                    <span>✓ Revenue is verified with a Stripe API key. Last updated: {company.last_verified_at ? new Date(company.last_verified_at).toLocaleString() : 'Unknown'}</span>
                </div>

                {/* DEBUG PANEL - Remove after testing */}
                {(() => {
                    if (currentUser && company) {
                        const username = currentUser.username;
                        return (
                            <div style={{ backgroundColor: '#1a1a1a', border: '2px solid #4f46e5', borderRadius: '8px', padding: '15px', marginBottom: '20px', maxWidth: '600px', margin: '0 auto 20px auto' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#4f46e5' }}>🔍 DEBUG: Ownership Check</div>
                                <div style={{ fontSize: '0.85rem', color: '#ccc' }}>
                                    <div>• Your username: <strong style={{ color: '#10b981' }}>{username}</strong></div>
                                    <div>• Company added_by_username: <strong style={{ color: '#10b981' }}>{company.added_by_username || 'null'}</strong></div>
                                    <div>• Company founder_name: <strong style={{ color: '#10b981' }}>{company.founder_name || 'null'}</strong></div>
                                    <div>• Company founder: <strong style={{ color: '#10b981' }}>{company.founder || 'null'}</strong></div>
                                    <div style={{ marginTop: '8px', padding: '8px', background: '#0a0a0a', borderRadius: '4px' }}>
                                        Match: {
                                            (company.added_by_username && company.added_by_username === username) ||
                                                (company.founder_name && company.founder_name === username) ||
                                                (company.founder && company.founder === username)
                                                ? <strong style={{ color: '#10b981' }}>✅ YES - Button should appear</strong>
                                                : <strong style={{ color: '#ef4444' }}>❌ NO - Button will not appear</strong>
                                        }
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    return <div style={{ color: '#888', marginBottom: '20px', textAlign: 'center' }}>Not logged in or loading...</div>;
                })()}

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '60px' }}>
                    <button onClick={() => setShowEmbedModal(true)} style={{ padding: '10px 20px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                        <Code size={16} /> Embed
                    </button>
                    {(() => {
                        console.log('🔘 Rendering action buttons');
                        console.log('🔘 currentUser:', currentUser);
                        console.log('🔘 Company data:', company);

                        // Show button if currentUser matches ownership
                        if (currentUser && company) {
                            const username = currentUser.username;
                            const shouldShowButton =
                                (company.added_by_username && company.added_by_username === username) ||
                                (company.founder_name && company.founder_name === username) ||
                                (company.founder && company.founder === username);

                            console.log('🔍 Button check - username:', username);
                            console.log('🔍 Button check - added_by_username:', company.added_by_username);
                            console.log('🔍 Button check - founder_name:', company.founder_name);
                            console.log('🔍 Button check - shouldShowButton:', shouldShowButton);

                            if (shouldShowButton) {
                                console.log('✅ Showing Edit/Delete button');
                                return (
                                    <button onClick={() => setShowEditModal(true)} style={{ padding: '10px 20px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                        <Edit size={16} /> Edit / Delete
                                    </button>
                                );
                            }
                        }
                        console.log('❌ NOT showing Edit/Delete button');
                        return null;
                    })()}
                    <button onClick={shareUrl} style={{ padding: '10px 20px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                        <Share2 size={16} /> Share
                    </button>
                </div>

                {/* Discover More Startups */}
                <div style={{ marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>Discover more startups</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {otherCompanies.map(c => (
                            <Link to={`/company/${c.id}`} key={c.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div style={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#333'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#222'}>
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                        {c.logo ? (
                                            <img
                                                src={c.logo.startsWith('http') ? c.logo : `http://localhost:8000${c.logo}`}
                                                alt={c.name}
                                                style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '8px',
                                            backgroundColor: '#222',
                                            display: c.logo ? 'none' : 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {c.name.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '500', marginBottom: '4px' }}>{c.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#888' }}>{c.tagline || c.category}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '4px' }}>Total revenue</div>
                                    <div style={{ fontSize: '1.3rem', fontWeight: '600' }}>{formatRevenue(Number(c.monthly_revenue))}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', paddingTop: '40px', borderTop: '1px solid #222' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <span style={{ fontSize: '1.2rem' }}>★ TrustMRR</span>
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>
                        The database of verified startup revenues
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', maxWidth: '600px', margin: '0 auto' }}>
                        <input
                            type="text"
                            placeholder="Search startups, founders, categories..."
                            style={{ flex: 1, padding: '12px 16px', backgroundColor: '#111', border: '1px solid #222', color: '#fff', borderRadius: '8px', fontSize: '0.95rem' }}
                        />
                        <button onClick={() => navigate('/')} style={{ padding: '12px 24px', backgroundColor: '#fff', border: 'none', color: '#000', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                            + Add startup
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showEditModal && (
                <EditCompanyModal
                    company={company}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                />
            )}

            {showEmbedModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowEmbedModal(false)}>
                    <div style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px', padding: '24px', width: '500px' }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '16px' }}>Embed Badge</h3>
                        <p style={{ color: '#888', marginBottom: '16px', fontSize: '0.9rem' }}>Copy this code to embed your revenue badge on your website:</p>
                        <textarea
                            readOnly
                            value={`<iframe src="${window.location.origin}/embed/${id}" width="300" height="400" frameborder="0"></iframe>`}
                            style={{ width: '100%', padding: '12px', backgroundColor: '#0a0a0a', border: '1px solid #222', color: '#fff', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.85rem', minHeight: '100px' }}
                        />
                        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowEmbedModal(false)} style={{ padding: '8px 16px', backgroundColor: '#222', border: '1px solid #333', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>
                                Close
                            </button>
                            <button onClick={copyEmbedCode} style={{ padding: '8px 16px', backgroundColor: '#4f46e5', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer' }}>
                                Copy Code
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
