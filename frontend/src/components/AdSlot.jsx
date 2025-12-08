import { useState } from 'react';
import { ExternalLink, Calendar, Plus } from 'lucide-react';

export default function AdSlot({ slotId, status, adData, onBookClick, price }) {
    const isBooked = status === 'booked';

    // Dynamic Backend URL for images
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
    const backendUrl = apiBase.replace('/api', '');

    const handleAdClick = async (e) => {
        if (!isBooked || !adData) return;

        // Track click
        try {
            await fetch(`${apiBase}/revenue/ads/${adData.id}/click/`, { method: 'POST' });
            console.log('Ad click tracked');
        } catch (err) {
            console.error('Failed to track click:', err);
        }
    };

    if (isBooked && adData) {
        return (
            <div style={{ marginBottom: '20px' }}>
                <a
                    href={adData.target_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleAdClick}
                    className="ad-slot booked"
                    style={{
                        display: 'block',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid #333',
                        transition: 'transform 0.2s',
                        textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}> {/* 16:9 Aspect Ratio */}
                        {adData.image ? (
                            <img
                                src={adData.image.startsWith('http') ? adData.image : `${backendUrl}${adData.image}`}
                                alt={adData.title}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(45deg, #4f46e5, #9333ea)' }}></div>
                        )}

                        <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: '#fff' }}>
                            AD
                        </div>
                    </div>
                    <div style={{ padding: '12px' }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#fff', fontWeight: '600' }}>{adData.title}</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa', lineHeight: '1.4' }}>{adData.description}</p>
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: '#4f46e5' }}>
                            Visit Website <ExternalLink size={10} style={{ marginLeft: '4px' }} />
                        </div>
                    </div>
                </a>
                <div
                    onClick={() => onBookClick(slotId)}
                    style={{
                        marginTop: '8px', fontSize: '0.75rem', color: '#555',
                        cursor: 'pointer', textAlign: 'center', textDecoration: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#888'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#555'}
                >
                    <Calendar size={12} /> Book this slot for future
                </div>
            </div>
        );
    }

    // Available Slot
    return (
        <div
            className="ad-slot available"
            onClick={() => onBookClick(slotId)}
            style={{
                marginBottom: '20px',
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: '#111',
                border: '1px dashed #444',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '180px'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4f46e5';
                e.currentTarget.style.backgroundColor = '#151515';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#444';
                e.currentTarget.style.backgroundColor = '#111';
            }}
        >
            <div style={{
                width: '40px', height: '40px', borderRadius: '50%', background: '#222',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: '#666'
            }}>
                <Plus size={20} />
            </div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#fff' }}>Advertise Here</h4>
            <p style={{ margin: '0 0 12px 0', fontSize: '0.8rem', color: '#666' }}>Reach verified founders</p>
            <div style={{
                padding: '6px 12px', background: '#222', borderRadius: '20px',
                fontSize: '0.75rem', color: '#fff', border: '1px solid #333'
            }}>
                Book for ₹{price || '5,000'}/mo
            </div>
        </div>
    );
}
