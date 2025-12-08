import { useState } from 'react';
import { X, Upload, Eye } from 'lucide-react';

export default function BookAdModal({ isOpen, onClose, slotId, onBook }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        target_url: '',
        duration: 1, // weeks
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    const PRICE_PER_WEEK = 5000;
    const totalPrice = formData.duration * PRICE_PER_WEEK;

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.target_url || !formData.image) {
            setError("Please fill all required fields");
            return;
        }

        setLoading(true);
        setError('');

        try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + (formData.duration * 7));

            const paymentId = "pay_" + Math.random().toString(36).substring(7);

            await onBook({
                ...formData,
                slot_id: slotId,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                payment_id: paymentId,
                amount_paid: totalPrice
            });

            setFormData({ title: '', description: '', target_url: '', duration: 1, image: null });
            setImagePreview(null);
            onClose();
        } catch (err) {
            setError(err.message || "Booking failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
            <div style={{
                backgroundColor: '#111', border: '1px solid #333', borderRadius: '16px',
                width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Book Ad Spot - {slotId}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '24px' }}>
                    {error && (
                        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '0.9rem' }}>
                            Ad Title <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Best AI Tool 2025"
                            maxLength={100}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            style={{ width: '100%', padding: '12px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '0.9rem' }}>Description</label>
                        <textarea
                            placeholder="Short description..."
                            maxLength={200}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                            style={{ width: '100%', padding: '12px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '8px', resize: 'vertical' }}
                        />
                        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>{formData.description.length}/200</div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '0.9rem' }}>
                            Target URL <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="url"
                            placeholder="https://yourwebsite.com"
                            value={formData.target_url}
                            onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                            style={{ width: '100%', padding: '12px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '0.9rem' }}>
                            Ad Banner (16:9 Recommended) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                id="ad-image-upload"
                                style={{ display: 'none' }}
                            />
                            <label
                                htmlFor="ad-image-upload"
                                style={{
                                    display: 'block',
                                    padding: '20px',
                                    background: '#0a0a0a',
                                    border: '1px dashed #444',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    color: '#888',
                                    cursor: 'pointer'
                                }}
                            >
                                {formData.image ? (
                                    <span style={{ color: '#10b981' }}>✓ {formData.image.name}</span>
                                ) : (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                        <Upload size={16} /> Upload Banner Image
                                    </span>
                                )}
                            </label>
                        </div>
                        {imagePreview && (
                            <button
                                onClick={() => setShowPreview(true)}
                                style={{
                                    marginTop: '8px',
                                    padding: '8px 16px',
                                    background: '#222',
                                    border: '1px solid #333',
                                    borderRadius: '6px',
                                    color: '#4f46e5',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Eye size={14} /> Preview Banner
                            </button>
                        )}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: '#ccc', marginBottom: '10px', fontSize: '0.9rem' }}>
                            Advertising Duration
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                            {[1, 2, 4, 8].map(weeks => (
                                <button
                                    key={weeks}
                                    onClick={() => setFormData({ ...formData, duration: weeks })}
                                    style={{
                                        padding: '16px 12px',
                                        background: formData.duration === weeks ? '#4f46e5' : '#1a1a1a',
                                        border: `1px solid ${formData.duration === weeks ? '#4f46e5' : '#333'}`,
                                        borderRadius: '8px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{weeks}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '2px' }}>
                                        {weeks === 1 ? 'Week' : 'Weeks'}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#10b981', marginTop: '6px', fontWeight: '600' }}>
                                        ₹{(weeks * PRICE_PER_WEEK).toLocaleString()}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{
                        padding: '20px',
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        border: '1px solid #333'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#aaa' }}>Duration:</span>
                            <span style={{ color: '#fff', fontWeight: '600' }}>{formData.duration} {formData.duration === 1 ? 'Week' : 'Weeks'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#aaa' }}>Price per week:</span>
                            <span style={{ color: '#fff' }}>₹{PRICE_PER_WEEK.toLocaleString()}</span>
                        </div>
                        <div style={{ height: '1px', background: '#333', margin: '12px 0' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600' }}>Total:</span>
                            <span style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>₹{totalPrice.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.title || !formData.target_url || !formData.image}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: loading || !formData.title || !formData.target_url || !formData.image ? '#444' : '#10b981',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '1rem',
                            cursor: loading || !formData.title || !formData.target_url || !formData.image ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'Processing Payment...' : `Pay ₹${totalPrice.toLocaleString()} & Book Now`}
                    </button>

                    <p style={{ textAlign: 'center', color: '#666', fontSize: '0.75rem', marginTop: '12px' }}>
                        Ad goes live immediately after payment confirmation
                    </p>
                </div>
            </div>

            {showPreview && imagePreview && (
                <div
                    onClick={() => setShowPreview(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 3000,
                        padding: '20px'
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: '800px',
                            width: '100%',
                            background: '#111',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '1px solid #333'
                        }}
                    >
                        <div style={{ padding: '16px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: '#fff' }}>Ad Preview</h3>
                            <button onClick={() => setShowPreview(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{
                                borderRadius: '12px',
                                overflow: 'hidden',
                                backgroundColor: '#1a1a1a',
                                border: '1px solid #333'
                            }}>
                                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', color: '#fff' }}>
                                        AD
                                    </div>
                                </div>
                                <div style={{ padding: '12px' }}>
                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#fff', fontWeight: '600' }}>
                                        {formData.title || 'Your Ad Title'}
                                    </h4>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa', lineHeight: '1.4' }}>
                                        {formData.description || 'Your ad description will appear here'}
                                    </p>
                                    <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: '#4f46e5' }}>
                                        Visit Website →
                                    </div>
                                </div>
                            </div>
                            <p style={{ textAlign: 'center', color: '#666', fontSize: '0.85rem', marginTop: '16px' }}>
                                This is how your ad will appear to users
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
