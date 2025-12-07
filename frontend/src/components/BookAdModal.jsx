import { useState } from 'react';
import { X, Upload, Calendar, CreditCard } from 'lucide-react';

export default function BookAdModal({ isOpen, onClose, slotId, onBook, category }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        target_url: '',
        start_date: '',
        end_date: '',
        image: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: Details, 2: Payment

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
        }
    };

    const validateDates = () => {
        // Basic validation
        if (!formData.start_date || !formData.end_date) return false;
        return true;
    }

    const handleSubmit = async () => {
        if (!validateDates()) {
            setError("Please select valid dates");
            return;
        }

        setLoading(true);
        setError('');

        // Simulate Razorpay Payment
        // In a real app, we would create an order on backend, get order_id, open Razorpay checkout
        // and then send the success response.
        // For now, we simulate success.

        try {
            // Verify payment success (mock)
            const paymentId = "pay_" + Math.random().toString(36).substring(7);

            await onBook({
                ...formData,
                slot_id: slotId,
                payment_id: paymentId,
                amount_paid: 5000
            });

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
                width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto',
                display: 'flex', flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Book Ad Spot</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <div style={{ padding: '24px' }}>
                    {error && (
                        <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '0.9rem' }}>Ad Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Best AI Tool 2025"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    style={{ width: '100%', padding: '12px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '0.9rem' }}>Description</label>
                                <textarea
                                    placeholder="Short description..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                    style={{ width: '100%', padding: '12px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '8px', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '0.9rem' }}>Target URL</label>
                                <input
                                    type="url"
                                    placeholder="https://"
                                    value={formData.target_url}
                                    onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                                    style={{ width: '100%', padding: '12px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '0.9rem' }}>Ad Image (16:9 Recommended)</label>
                                <div style={{ position: 'relative' }}>
                                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ opacity: 0, position: 'absolute', inset: 0, cursor: 'pointer' }} />
                                    <div style={{ padding: '20px', background: '#0a0a0a', border: '1px dashed #444', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                                        {formData.image ? (
                                            <span style={{ color: '#10b981' }}>{formData.image.name}</span>
                                        ) : (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Upload size={16} /> Upload Image</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '0.9rem' }}>Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                        style={{ width: '100%', padding: '12px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#ccc', marginBottom: '6px', fontSize: '0.9rem' }}>End Date</label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                        style={{ width: '100%', padding: '12px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!formData.title || !formData.target_url || !formData.start_date}
                                style={{
                                    width: '100%', padding: '14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px',
                                    fontWeight: '600', cursor: 'pointer', opacity: (!formData.title || !formData.target_url) ? 0.5 : 1
                                }}
                            >
                                Next: Payment
                            </button>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ marginBottom: '20px', padding: '20px', background: '#1a1a1a', borderRadius: '12px' }}>
                                <h3 style={{ color: '#fff', margin: '0 0 10px 0' }}>Booking Summary</h3>
                                <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{formData.start_date} to {formData.end_date}</p>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff', margin: '20px 0' }}>₹5,000</div>
                                <p style={{ color: '#666', fontSize: '0.8rem' }}>100% Satisfaction Guarantee</p>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px',
                                    fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                }}
                            >
                                {loading ? 'Processing...' : <><CreditCard size={18} /> Pay & Book Now</>}
                            </button>

                            <button
                                onClick={() => setStep(1)}
                                style={{
                                    width: '100%', padding: '14px', background: 'transparent', color: '#888', border: 'none', marginTop: '10px',
                                    fontWeight: '600', cursor: 'pointer'
                                }}
                            >
                                Back
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
