import { useState } from 'react';
import LeftSection from '../components/LeftSection';
import FormCard from '../components/FormCard';
import eyeIcon from '../assets/icons/eye.svg';
import googleIcon from '../assets/icons/google.svg';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      const activeStorage = remember ? localStorage : sessionStorage;
      const inactiveStorage = remember ? sessionStorage : localStorage;
      const fallbackName = email.trim().split('@')[0];
      const loginUser = {
        id: data.user?.id || '',
        name: data.user?.name || fallbackName,
        email: data.user?.email || email.trim(),
        role: data.user?.role || 'claimant'
      };

      activeStorage.setItem('lawyerslog_token', data.token);
      activeStorage.setItem('lawyerslog_user', JSON.stringify(loginUser));
      activeStorage.setItem('lawyerslog_user_name', loginUser.name);

      inactiveStorage.removeItem('lawyerslog_token');
      inactiveStorage.removeItem('lawyerslog_user');
      inactiveStorage.removeItem('lawyerslog_user_name');

      window.location.href = '/cases';
    } catch {
      setError('Unable to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-root login-view">
      <section className="auth-canvas">
        <div className="auth-bg" />
        <LeftSection />

        <FormCard className="auth-card login-card">
          <h2 className="auth-card-title">Log In to your Account</h2>

          <form className="auth-form login-form" onSubmit={handleSubmit}>
            <div className="field-box field-email">
              <span className="field-label">Email</span>
              <input
                className="field-input"
                type="email"
                value={email}
                placeholder="johnsondoe@nomail.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field-box field-password">
              <span className="field-label field-label-password">Password</span>
              <input
                className="field-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                placeholder="***************"
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                <img src={eyeIcon} alt="toggle password visibility" />
              </button>
            </div>

            <div className="meta-row">
              <label className="checkbox-label remember-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                />
                <span>Remember me</span>
              </label>
              <a className="forgot-link" href="/reset">
                Forgot Password?
              </a>
            </div>

            {error ? <p className="error-text">{error}</p> : null}

            <button className="auth-btn primary-auth-btn" type="submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="divider-wrap">
            <div className="divider-line" />
            <span>Or</span>
          </div>

          <button type="button" className="auth-btn google-auth-btn">
            <img src={googleIcon} alt="google" />
            <span>Log In with Google</span>
          </button>

          <p className="auth-bottom-copy">
            New User?
            <a href="/signup"> SIGN UP HERE</a>
          </p>
        </FormCard>
      </section>
    </main>
  );
}

export default Login;
