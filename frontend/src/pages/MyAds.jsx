import { useState, useEffect } from 'react';
import { Eye, Calendar, TrendingUp, DollarSign, XCircle, Clock, CheckCircle } from 'lucide-react';

export default function MyAds() {
    const [adsData, setAdsData] = useState({
        active: [],
        scheduled: [],
        expired: [],
        total_spent: 0,
        total_clicks: 0,
        total_impressions: 0
    });
    const [loading, setLoading] = useState(true);

    // Dynamic Backend URL for images
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
    const backendUrl = apiBase.replace('/api', '');

    useEffect(() => {
        fetchMyAds();
    }, []);

    const fetchMyAds = async () => {
        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch(`${apiBase}/revenue/ads/my/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setAdsData(data);
            }
        } catch (err) {
            console.error('Failed to fetch ads:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAd = async (adId) => {
        if (!confirm('Are you sure you want to cancel this ad?')) return;

        const token = localStorage.getItem('authToken');
        try {
            const res = await fetch(`${apiBase}/revenue/ads/${adId}/cancel/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.message + (data.refund_eligible ? ` Refund: ₹${data.refund_amount}` : ''));
                fetchMyAds();
            }
        } catch (err) {
            console.error('Failed to cancel ad:', err);
        }
    };

    const AdCard = ({ ad, type }) => (
        <div className="ad-card" style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
            border: '1px solid #333',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px'
        }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
                {/* Ad Image */}
                <div style={{
                    width: '120px',
                    height: '68px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#222',
                    flexShrink: 0
                }}>
                    {ad.image ? (
                        <img
                            src={ad.image.startsWith('http') ? ad.image : `${backendUrl}${ad.image}`}
                            alt={ad.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                            No Image
                        </div>
                    )}
                </div>

                {/* Ad Info */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#fff' }}>{ad.title}</h3>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#aaa' }}>{ad.description}</p>
                            <a href={ad.target_url} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5', fontSize: '0.8rem', textDecoration: 'none' }}>
                                {ad.target_url}
                            </a>
                        </div>
                        <div style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: type === 'active' ? '#10b981' : type === 'scheduled' ? '#f59e0b' : '#6b7280',
                            color: '#fff'
                        }}>
                            {type === 'active' ? '● LIVE' : type === 'scheduled' ? '⏱ SCHEDULED' : '✓ EXPIRED'}
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '12px' }}>
                        <div style={{ background: '#111', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '2px' }}>SLOT</div>
                            <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: '600' }}>{ad.slot_id}</div>
                        </div>

                        <div style={{ background: '#111', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '2px' }}>DATES</div>
                            <div style={{ fontSize: '0.85rem', color: '#fff' }}>
                                {new Date(ad.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(ad.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </div>
                        </div>

                        {type === 'active' && (
                            <div style={{ background: '#111', padding: '10px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '2px' }}>DAYS LEFT</div>
                                <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: '600' }}>{ad.days_remaining} days</div>
                            </div>
                        )}

                        {type === 'scheduled' && (
                            <div style={{ background: '#111', padding: '10px', borderRadius: '8px' }}>
                                <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '2px' }}>STARTS IN</div>
                                <div style={{ fontSize: '0.9rem', color: '#f59e0b', fontWeight: '600' }}>{ad.starts_in_days} days</div>
                            </div>
                        )}

                        <div style={{ background: '#111', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '2px' }}>IMPRESSIONS</div>
                            <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: '600' }}>{ad.impressions?.toLocaleString() || 0}</div>
                        </div>

                        <div style={{ background: '#111', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '2px' }}>CLICKS</div>
                            <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: '600' }}>{ad.clicks?.toLocaleString() || 0}</div>
                        </div>

                        <div style={{ background: '#111', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '2px' }}>CTR</div>
                            <div style={{ fontSize: '0.9rem', color: '#4f46e5', fontWeight: '600' }}>{ad.ctr || 0}%</div>
                        </div>

                        <div style={{ background: '#111', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '2px' }}>PAID</div>
                            <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: '600' }}>₹{ad.amount_paid?.toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Actions */}
                    {type === 'scheduled' && (
                        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => handleCancelAd(ad.id)}
                                style={{
                                    padding: '8px 16px',
                                    background: '#dc2626',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <XCircle size={14} /> Cancel Ad
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                Loading your ads...
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', marginBottom: '30px' }}>
                My Advertisements
            </h1>

            {/* Summary Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', padding: '24px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <DollarSign size={24} color="#fff" />
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Total Spent</div>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>₹{adsData.total_spent?.toLocaleString()}</div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '24px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <Eye size={24} color="#fff" />
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Total Views</div>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>{adsData.total_impressions?.toLocaleString()}</div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '24px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <TrendingUp size={24} color="#fff" />
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>Total Clicks</div>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>{adsData.total_clicks?.toLocaleString()}</div>
                </div>
            </div>

            {/* Active Ads */}
            {adsData.active.length > 0 && (
                <>
                    <h2 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={20} color="#10b981" /> Active Ads ({adsData.active.length})
                    </h2>
                    {adsData.active.map(ad => <AdCard key={ad.id} ad={ad} type="active" />)}
                </>
            )}

            {/* Scheduled Ads */}
            {adsData.scheduled.length > 0 && (
                <>
                    <h2 style={{ fontSize: '1.3rem', color: '#fff', marginTop: '40px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={20} color="#f59e0b" /> Scheduled Ads ({adsData.scheduled.length})
                    </h2>
                    {adsData.scheduled.map(ad => <AdCard key={ad.id} ad={ad} type="scheduled" />)}
                </>
            )}

            {/* Expired Ads */}
            {adsData.expired.length > 0 && (
                <>
                    <h2 style={{ fontSize: '1.3rem', color: '#fff', marginTop: '40px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={20} color="#6b7280" /> Past Ads ({adsData.expired.length})
                    </h2>
                    {adsData.expired.map(ad => <AdCard key={ad.id} ad={ad} type="expired" />)}
                </>
            )}

            {adsData.active.length === 0 && adsData.scheduled.length === 0 && adsData.expired.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>No advertisements yet</p>
                    <p style={{ fontSize: '0.9rem' }}>Book your first ad to reach thousands of entrepreneurs!</p>
                </div>
            )}
        </div>
    );
}
