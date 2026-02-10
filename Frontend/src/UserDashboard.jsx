import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ROG.css";

function UserDashboard() {
    const [user, setUser] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searchCity, setSearchCity] = useState("");
    const [searchBloodGroup, setSearchBloodGroup] = useState("");
    const [loading, setLoading] = useState(false);
    const [showCampForm, setShowCampForm] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [campForm, setCampForm] = useState({
        institution_name: '',
        location: '',
        camp_date: '',
        contact_person: ''
    });
    const navigate = useNavigate();

    // Toast notification system
    const showToast = (message, type = 'success', title = '') => {
        const id = Date.now();
        const toast = { id, message, type, title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Info') };
        setToasts(prev => [...prev, toast]);

        setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === id ? { ...t, hiding: true } : t));
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 300);
        }, 4000);
    };

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            navigate("/login");
        } else {
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleSearch = async () => {
        if (!searchBloodGroup || !searchCity) {
            showToast('Please select blood group and enter city', 'warning', 'Missing Info');
            return;
        }

        setLoading(true);
        try {
            const query = new URLSearchParams({
                blood_group: searchBloodGroup,
                city: searchCity
            }).toString();

            const response = await fetch(`http://localhost:5000/api/inventory/search?${query}`);
            const data = await response.json();
            setSearchResults(data);

            if (data.length === 0) {
                showToast('No donors found matching your criteria', 'warning', 'No Results');
            } else {
                showToast(`Found ${data.length} donor(s) in ${searchCity}`, 'success', 'Search Complete');
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to search donors. Please try again.', 'error', 'Search Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleCampSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/camps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(campForm)
            });

            if (response.ok) {
                showToast('Your camp request has been submitted for review', 'success', 'Request Submitted');
                setShowCampForm(false);
                setCampForm({ institution_name: '', location: '', camp_date: '', contact_person: '' });
            } else {
                showToast('Failed to submit request. Please try again.', 'error', 'Submission Failed');
            }
        } catch (error) {
            console.error(error);
            showToast('Network error. Please check your connection.', 'error', 'Connection Error');
        }
    };

    if (!user) return null;

    return (
        <div className="rog-main-content">

            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast ${toast.type} ${toast.hiding ? 'hiding' : ''}`}>
                        <div className="toast-icon">
                            {toast.type === 'success' && '✓'}
                            {toast.type === 'error' && '✗'}
                            {toast.type === 'warning' && '⚠'}
                        </div>
                        <div className="toast-content">
                            <div className="toast-title">{toast.title}</div>
                            <div className="toast-message">{toast.message}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* --- TOP HEADER --- */}
            <header className="rog-navbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '28px',
                        height: '28px',
                        background: 'linear-gradient(135deg, var(--rog-red) 0%, #aa0020 100%)',
                        clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0 100%)',
                        boxShadow: '0 0 10px rgba(255, 10, 62, 0.4)'
                    }}></div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.5px', color: 'var(--rog-text-dark)' }}>
                        One Drop
                    </div>
                </div>
                <button onClick={handleLogout} className="rog-btn-secondary" style={{ padding: '8px 20px', fontSize: '0.9rem' }}>
                    LOGOUT
                </button>
            </header>

            {/* --- MAIN CONTENT GRID --- */}
            <section className="rog-container-wide">
                <div className="rog-dashboard-layout">

                    {/* LEFT: Hero Section */}
                    <div className="anim-slide-up" style={{ position: 'sticky', top: '100px' }}>
                        <div style={{
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: 'var(--rog-red)',
                            letterSpacing: '2px',
                            marginBottom: '12px',
                            textTransform: 'uppercase'
                        }}>
                            Welcome Back, {user.name}
                        </div>
                        <h1 className="rog-hero-title">
                            CONNECT.<br />
                            DONATE.<br />
                            <span style={{ color: 'var(--rog-red)' }}>SAVE LIVES.</span>
                        </h1>
                        <p className="rog-hero-subtitle" style={{ marginBottom: '32px' }}>
                            Join the elite network of donors via One Drop. Your contribution powers the future of healthcare.
                        </p>
                        <p className="rog-hero-subtitle" style={{ marginBottom: '32px', fontSize: '1.5rem', fontWeight: '700' }}>
                            <span style={{ color: 'var(--rog-red)' }}>உங்கள் ரத்ததானம்,</span> <span style={{ color: '#ffffff' }}>மற்றொருவர் வாழ்க்கையின் ஒளி</span>
                        </p>

                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                            <div className="rog-stat-block">
                                <div className="rog-stat-number">12</div>
                                <div className="rog-stat-label">Donations</div>
                            </div>
                            <div className="rog-stat-block">
                                <div className="rog-stat-number">45</div>
                                <div className="rog-stat-label">Lives Saved</div>
                            </div>
                            <div className="rog-stat-block">
                                <div className="rog-stat-number">{user.blood_group}</div>
                                <div className="rog-stat-label">My Type</div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Profile & Find Donors */}
                    <div style={{ display: 'grid', gap: '32px', paddingLeft: '40px' }}> {/* Increased gap from 24px */}

                        {/* Profile Overview */}
                        <div className="rog-panel-dark anim-slide-up" style={{ animationDelay: '0.1s', padding: '32px' }}> {/* Increased padding from 24px */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}> {/* Reduced margin */}
                                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--rog-text-dark)' }}>
                                    Profile
                                </h2>
                                <span style={{
                                    color: '#10b981',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    fontSize: '0.85rem'
                                }}>
                                    ● ACTIVE DONOR
                                </span>
                            </div>

                            <div style={{ display: 'grid', gap: '16px' }}> {/* Reduced gap */}
                                <div>
                                    <label style={{
                                        color: 'var(--rog-text-dim)',
                                        textTransform: 'uppercase',
                                        fontSize: '0.8rem',
                                        letterSpacing: '1px',
                                        fontWeight: '600'
                                    }}>Full Name</label>
                                    <div style={{ fontSize: '1.2rem', fontWeight: '500', marginTop: '2px', color: 'var(--rog-text-light)' }}>{user.name}</div>
                                </div>
                                <div>
                                    <label style={{
                                        color: 'var(--rog-text-dim)',
                                        textTransform: 'uppercase',
                                        fontSize: '0.8rem',
                                        letterSpacing: '1px',
                                        fontWeight: '600'
                                    }}>Email Address</label>
                                    <div style={{ fontSize: '1rem', fontFamily: 'monospace', color: '#d1d5db', marginTop: '2px' }}>
                                        {user.email}
                                    </div>
                                </div>
                                <div>
                                    <label style={{
                                        color: 'var(--rog-text-dim)',
                                        textTransform: 'uppercase',
                                        fontSize: '0.8rem',
                                        letterSpacing: '1px',
                                        fontWeight: '600'
                                    }}>Location</label>
                                    <div style={{ fontSize: '1rem', marginTop: '2px', color: 'var(--rog-text-light)' }}>{user.city || 'Not Specified'}</div>
                                </div>
                            </div>

                            <div style={{
                                marginTop: '24px', /* Reduced margin */
                                padding: '12px', /* Reduced padding */
                                background: 'rgba(255, 10, 62, 0.08)',
                                border: '1px dashed rgba(255, 10, 62, 0.3)',
                                borderRadius: '4px'
                            }}>
                                <div style={{ color: 'var(--rog-red)', fontWeight: '700', marginBottom: '4px', fontSize: '0.85rem' }}>
                                    Need assistance?
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: '1.5', margin: 0 }}>
                                    Contact our support team for help with donation appointments.
                                </p>
                            </div>
                        </div>

                        {/* Find Donors */}
                        <div className="rog-panel-dark anim-slide-up" style={{ animationDelay: '0.2s', padding: '24px' }}> {/* Adjusted padding for consistency */}
                            <h2 style={{
                                fontSize: '1.25rem',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                marginBottom: '8px',
                                letterSpacing: '0.5px',
                                color: 'var(--rog-text-dark)'
                            }}>Find Donors</h2>
                            <p style={{ color: '#9ca3af', marginBottom: '24px', fontSize: '0.9rem' }}>
                                Search the database for available blood donors in your city.
                            </p>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                                gap: '12px',
                                marginBottom: '24px'
                            }}>
                                <select
                                    value={searchBloodGroup}
                                    onChange={(e) => setSearchBloodGroup(e.target.value)}
                                    className="rog-select-dark"
                                >
                                    <option value="">Select Group</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Enter City Name..."
                                    value={searchCity}
                                    onChange={(e) => setSearchCity(e.target.value)}
                                    className="rog-input-dark"
                                />
                                <button onClick={handleSearch} className="rog-btn-primary">
                                    {loading ? '...' : 'SEARCH'}
                                </button>
                            </div>

                            {/* Search Results */}
                            <div style={{ minHeight: '150px' }}>
                                {loading && <div style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.9rem' }}>Scanning database...</div>}

                                {!loading && searchResults.length > 0 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                        {searchResults.map(donor => (
                                            <div key={donor.id} style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                padding: '12px',
                                                border: '1px solid rgba(255,255,255,0.08)',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                                    e.currentTarget.style.borderColor = 'rgba(255, 10, 62, 0.3)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: '700', marginBottom: '2px', color: 'var(--rog-text-light)', fontSize: '0.95rem' }}>{donor.name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                                        {donor.city} • {donor.phone}
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: '1.2rem',
                                                    fontWeight: '900',
                                                    color: 'var(--rog-red)',
                                                    textShadow: '0 0 10px rgba(255, 10, 62, 0.3)'
                                                }}>
                                                    {donor.blood_group}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {!loading && searchResults.length === 0 && (
                                    <div style={{
                                        color: '#555',
                                        fontStyle: 'italic',
                                        borderTop: '1px solid rgba(255,255,255,0.05)',
                                        paddingTop: '16px',
                                        fontSize: '0.9rem'
                                    }}>
                                        No active search.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- CAMPAIGN CTA --- */}
            <section className="rog-container-wide rog-section anim-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="rog-panel-dark" style={{
                    padding: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '24px'
                }}>
                    <div style={{ flex: '1 1 400px', maxWidth: '600px' }}>
                        <h2 style={{
                            fontSize: '1.75rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            marginBottom: '12px',
                            letterSpacing: '0.5px',
                            color: 'var(--rog-text-light)'
                        }}>
                            Organize a Blood Camp
                        </h2>
                        <p style={{ fontSize: '0.95rem', color: '#9ca3af', lineHeight: '1.5' }}>
                            Host a donation drive at your institution. We provide full logistics support and medical staff. Make a massive impact today.
                        </p>
                    </div>
                    <button onClick={() => setShowCampForm(true)} className="rog-btn-primary" style={{
                        padding: '12px 36px',
                        fontSize: '1rem'
                    }}>
                        START REQUEST
                    </button>
                </div>
            </section>

            {/* Camp Request Modal */}
            {showCampForm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    backdropFilter: 'blur(8px)'
                }}>
                    <div className="rog-panel-dark" style={{ width: '500px', maxWidth: '90vw', padding: '32px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px', textTransform: 'uppercase', color: 'var(--rog-text-light)' }}>
                            REQUEST FORM
                        </h2>
                        <form onSubmit={handleCampSubmit} style={{ display: 'grid', gap: '16px' }}>
                            <input
                                type="text"
                                placeholder="Institution Name"
                                className="rog-input-dark"
                                value={campForm.institution_name}
                                onChange={e => setCampForm({ ...campForm, institution_name: e.target.value })}
                                required
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <input
                                    type="text"
                                    placeholder="Location/City"
                                    className="rog-input-dark"
                                    value={campForm.location}
                                    onChange={e => setCampForm({ ...campForm, location: e.target.value })}
                                    required
                                />
                                <input
                                    type="date"
                                    className="rog-input-dark"
                                    value={campForm.camp_date}
                                    onChange={e => setCampForm({ ...campForm, camp_date: e.target.value })}
                                    required
                                    style={{ colorSchem: 'dark' }}
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Contact Person"
                                className="rog-input-dark"
                                value={campForm.contact_person}
                                onChange={e => setCampForm({ ...campForm, contact_person: e.target.value })}
                                required
                            />
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                <button type="submit" className="rog-btn-primary" style={{ flex: 1 }}>SUBMIT</button>
                                <button type="button" onClick={() => setShowCampForm(false)} className="rog-btn-secondary" style={{ flex: 1 }}>
                                    CANCEL
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default UserDashboard;
