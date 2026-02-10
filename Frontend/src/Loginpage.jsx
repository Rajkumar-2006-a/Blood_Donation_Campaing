import "./Loginpage.css";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
    // State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const [error, setError] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Smooth fade transition instead of alert
                document.body.style.opacity = '0';
                document.body.style.transition = 'opacity 0.3s ease-out';

                setTimeout(() => {
                    if (data.user.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/dashboard');
                    }
                }, 300);
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred during login');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleGoogleLogin = () => {
        alert("Google Login is currently in development. Please use standard authentication.");
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="logo-icon"></div>
                        <h2>Sign In</h2>
                        <p>Access your account</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label htmlFor="email">Email</label>
                                <span className="input-line"></span>
                            </div>
                            <span className="error-message"></span>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label htmlFor="password">Password</label>

                                <button
                                    type="button"
                                    className="password-toggle"
                                    aria-label="Toggle password visibility"
                                    onClick={togglePasswordVisibility}
                                >
                                    <span className={`toggle-icon ${showPassword ? 'show-password' : ''}`}></span>
                                </button>

                                <span className="input-line"></span>
                            </div>
                            <span className="error-message"></span>
                        </div>

                        <div className="form-options">
                            <div className="remember-wrapper">
                                <input type="checkbox" id="remember" name="remember" />
                                <label htmlFor="remember" className="checkbox-label">
                                    <span className="custom-checkbox"></span>
                                    Keep me signed in
                                </label>
                            </div>
                            <a href="#" className="forgot-password">
                                Forgot password?
                            </a>
                        </div>

                        {error && <div className="error-message show" style={{ marginBottom: '10px' }}>{error}</div>}
                        <button type="submit" className="login-btn btn">
                            <span className="btn-text">Sign In</span>
                            <span className="btn-loader"></span>
                            <span className="btn-glow"></span>
                        </button>
                    </form>

                    <div className="divider">
                        <span>or</span>
                    </div>

                    <div className="social-login">
                        <button type="button" className="social-btn google-btn" onClick={handleGoogleLogin}>
                            <span className="social-icon google-icon"></span>
                            <span>Continue with Google</span>
                        </button>

                        <button type="button" className="social-btn apple-btn">
                            <span className="social-icon apple-icon"></span>
                            <span>Continue with Apple</span>
                        </button>
                    </div>

                    <div className="signup-link">
                        <p>
                            New here? <Link to="/signup">Create an account</Link>
                        </p>
                    </div>
                </div>

                <div className="background-effects">
                    <div className="glow-orb glow-orb-1"></div>
                    <div className="glow-orb glow-orb-2"></div>
                    <div className="glow-orb glow-orb-3"></div>
                </div>
            </div>
        </div>
    );
}

export default Login;
