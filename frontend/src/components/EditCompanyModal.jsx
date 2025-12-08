import React, { useState } from 'react';
import { X, RefreshCw, Trash2, Upload } from 'lucide-react';

const EditCompanyModal = ({ company, onClose, onUpdate, onDelete }) => {
    const [formData, setFormData] = useState({
        name: company.name || '',
        description: company.description || '',
        website: company.website || '',
        twitter_handle: company.twitter_handle || '',
        category: company.category || 'saas',
        founder_name: company.founder_name || '',
        logo: null,
        founder_photo: null
    });
    const [logoPreview, setLogoPreview] = useState(company.logo || null);
    const [founderPhotoPreview, setFounderPhotoPreview] = useState(company.founder_photo || null);
    const [loading, setLoading] = useState(false);
    const [refreshLoading, setRefreshLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState('');

    // Dynamic Backend URL for images
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';
    const backendUrl = apiBase.replace('/api', '');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Process the image automatically
            const processedBlob = await processImage(file);

            // Create a new File object from the processed blob
            const processedFile = new File([processedBlob], file.name, { type: 'image/jpeg' });

            setError(''); // Clear any previous errors
            setFormData(prev => ({ ...prev, logo: processedFile }));
            setLogoPreview(URL.createObjectURL(processedBlob));
        } catch (err) {
            setError(`Error processing image: ${err.message}`);
            e.target.value = ''; // Clear the input
        }
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

    const handleFounderPhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Process the image automatically
            const processedBlob = await processImage(file);

            // Create a new File object from the processed blob
            const processedFile = new File([processedBlob], file.name, { type: 'image/jpeg' });

            setError(''); // Clear any previous errors
            setFormData(prev => ({ ...prev, founder_photo: processedFile }));
            setFounderPhotoPreview(URL.createObjectURL(processedBlob));
        } catch (err) {
            setError(`Error processing image: ${err.message}`);
            e.target.value = ''; // Clear the input
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('website', formData.website);
            data.append('twitter_handle', formData.twitter_handle);
            data.append('category', formData.category);
            data.append('founder_name', formData.founder_name);
            if (formData.logo) {
                data.append('logo', formData.logo);
            }
            if (formData.founder_photo) {
                data.append('founder_photo', formData.founder_photo);
            }

            const token = localStorage.getItem('authToken');

            const res = await fetch(`${apiBase}/revenue/companies/${company.id}/update/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to update company');
            }

            const updatedCompany = await res.json();

            // CRITICAL FIX: Merge with existing company data to preserve ALL fields
            // This ensures added_by_username and other ownership fields are retained
            const completeCompanyData = {
                ...company,  // Start with existing company data
                ...updatedCompany,  // Overwrite with API response
                // Explicitly preserve critical ownership fields if missing from response
                added_by_username: updatedCompany.added_by_username || company.added_by_username,
                added_by: updatedCompany.added_by || company.added_by,
                founder_name: updatedCompany.founder_name || company.founder_name
            };

            console.log('🔄 EditCompanyModal: Passing complete company data to onUpdate:', completeCompanyData);
            onUpdate(completeCompanyData);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshKey = async (secret = '') => {
        if (!apiKey) {
            setError('Please enter a new API key or Client ID');
            return;
        }
        setRefreshLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('authToken');

            // Construct body based on what we have. 
            // The backend handles mapping api_key to client_id for PayPal if needed, 
            // or we can send all possible fields and let backend pick.
            // For simplicity, we'll send api_key as the primary identifier, 
            // and if a secret is provided, we send it as both api_secret and client_secret
            // to cover all bases (Stripe doesn't use secret, Razorpay uses api_secret, PayPal uses client_secret).
            const body = {
                api_key: apiKey,
                client_id: apiKey, // In case it's PayPal
                api_secret: secret,
                client_secret: secret
            };

            const res = await fetch(`${apiBase}/revenue/companies/${company.id}/refresh/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to refresh API key');
            }

            const data = await res.json();
            alert(`Revenue refreshed! New monthly revenue: $${data.revenue}`);
            onUpdate({ ...company, monthly_revenue: data.revenue, last_verified_at: data.last_verified_at });
            // Clear fields after success
            setApiKey('');
            const secretInput = document.querySelector('input[type="password"]');
            if (secretInput) secretInput.value = '';
        } catch (err) {
            setError(err.message);
        } finally {
            setRefreshLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) {
            setDeleteConfirm(true);
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');

            const res = await fetch(`${apiBase}/revenue/companies/${company.id}/delete/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to delete company');
            }

            onDelete(company.id);
            onClose();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px',
                width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
                padding: '24px', position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: '#fff' }}>Edit Startup Details</h2>

                {error && (
                    <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444', marginBottom: '20px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Logo Upload */}
                    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '12px',
                            backgroundColor: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', border: '1px solid #333'
                        }}>
                            {logoPreview ? (
                                <img src={logoPreview.startsWith('http') || logoPreview.startsWith('blob:') ? logoPreview : `${backendUrl}${logoPreview}`} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '2rem' }}>🏢</span>
                            )}
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Logo</label>
                            <label style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '8px 16px', backgroundColor: '#222', border: '1px solid #333',
                                borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '0.9rem'
                            }}>
                                <Upload size={16} /> Upload Logo
                                <input type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                            </label>
                            <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#666', lineHeight: '1.4' }}>
                                <div>✓ Upload any image - automatically resized to 400×400px</div>
                                <div>✓ Non-square images are centered and cropped</div>
                                <div>✓ Optimized for web (JPEG, ~85% quality)</div>
                            </div>
                        </div>
                    </div>

                    {/* Founder Photo Upload */}
                    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            backgroundColor: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden', border: '1px solid #333'
                        }}>
                            {founderPhotoPreview ? (
                                <img src={founderPhotoPreview.startsWith('http') || founderPhotoPreview.startsWith('blob:') ? founderPhotoPreview : `${backendUrl}${founderPhotoPreview}`} alt="Founder preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '2rem' }}>👤</span>
                            )}
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Founder Photo</label>
                            <label style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                padding: '8px 16px', backgroundColor: '#222', border: '1px solid #333',
                                borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '0.9rem'
                            }}>
                                <Upload size={16} /> Upload Photo
                                <input type="file" accept="image/*" onChange={handleFounderPhotoChange} style={{ display: 'none' }} />
                            </label>
                            <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#666', lineHeight: '1.4' }}>
                                <div>✓ Upload any image - automatically resized to 400×400px</div>
                                <div>✓ Non-square images are centered and cropped</div>
                                <div>✓ Optimized for web (JPEG, ~85% quality)</div>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Startup Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Founder Name</label>
                            <input
                                type="text"
                                name="founder_name"
                                value={formData.founder_name}
                                onChange={handleChange}
                                style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            maxLength={500}
                            rows={4}
                            style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px', resize: 'vertical' }}
                        />
                        <div style={{ textAlign: 'right', color: '#666', fontSize: '0.8rem', marginTop: '4px' }}>
                            {formData.description.length}/500
                        </div>
                    </div>

                    {/* Links */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Website URL</label>
                            <input
                                type="url"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://"
                                style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Twitter Handle</label>
                            <input
                                type="text"
                                name="twitter_handle"
                                value={formData.twitter_handle}
                                onChange={handleChange}
                                placeholder="@username"
                                style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '0.9rem' }}>Category</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
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

                    {/* Optional API Key Update Section */}
                    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '8px', marginBottom: '24px', border: '1px solid #333' }}>
                        <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <RefreshCw size={16} /> Update Revenue Integration (Optional)
                        </h3>
                        <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '16px' }}>
                            Only fill this if you need to update your API keys or secrets. This will re-verify your revenue.
                        </p>

                        {/* Fields based on provider - we'll show generic fields that work for all for now, or could fetch provider type */}
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.85rem' }}>API Key / Client ID</label>
                                <input
                                    type="text"
                                    placeholder="New API Key or Client ID"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
                                />
                            </div>

                            {/* Show secret field if user enters a key, assuming it might be needed for Razorpay/PayPal */}
                            {apiKey && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', color: '#ccc', fontSize: '0.85rem' }}>API Secret / Client Secret (if applicable)</label>
                                    <input
                                        type="password"
                                        placeholder="New Secret"
                                        onChange={(e) => {
                                            // We'll handle this in the submit handler by adding it to the body if present
                                            // For now, let's just store it in a temp state or modify handleRefreshKey
                                            e.target.setAttribute('data-secret', e.target.value);
                                        }}
                                        style={{ width: '100%', padding: '10px', background: '#0a0a0a', border: '1px solid #333', color: '#fff', borderRadius: '6px' }}
                                    />
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={(e) => {
                                    // Get secret from input
                                    const secretInput = e.currentTarget.parentElement.querySelector('input[type="password"]');
                                    const secret = secretInput ? secretInput.value : '';
                                    handleRefreshKey(secret);
                                }}
                                disabled={refreshLoading || !apiKey}
                                style={{
                                    marginTop: '8px',
                                    padding: '10px 20px',
                                    backgroundColor: '#333',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: refreshLoading || !apiKey ? 'not-allowed' : 'pointer',
                                    opacity: refreshLoading || !apiKey ? 0.7 : 1,
                                    width: 'fit-content'
                                }}
                            >
                                {refreshLoading ? 'Updating Keys & Refreshing...' : 'Update Keys & Refresh Revenue'}
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingTop: '20px', borderTop: '1px solid #222' }}>
                        <button
                            type="button"
                            onClick={handleDelete}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 20px', backgroundColor: deleteConfirm ? '#ef4444' : 'transparent',
                                border: '1px solid #ef4444', color: deleteConfirm ? '#fff' : '#ef4444',
                                borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            <Trash2 size={16} /> {deleteConfirm ? 'Click to Confirm Delete' : 'Delete Startup'}
                        </button>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    padding: '10px 24px', backgroundColor: 'transparent', border: '1px solid #333',
                                    color: '#ccc', borderRadius: '6px', cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '10px 24px', backgroundColor: '#4f46e5', border: 'none',
                                    color: '#fff', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCompanyModal;
