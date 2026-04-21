import { useState } from 'react';
import LeftSection from '../components/LeftSection';
import FormCard from '../components/FormCard';
import eyeIcon from '../assets/icons/eye.svg';
import googleIcon from '../assets/icons/google.svg';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setError('You must accept Terms & Conditions');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:5001/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Claimant User',
          email: email.trim(),
          password,
          role: 'claimant',
          phone: '',
          licenseNumber: '',
          practiceArea: '',
          companyName: ''
        })
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Signup failed');
        return;
      }

      localStorage.setItem('lawyerslog_pending_email', email.trim().toLowerCase());
      window.location.href = '/reset';
    } catch {
      setError('Unable to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-root signup-view">
      <section className="auth-canvas">
        <div className="auth-bg" />
        <LeftSection />

        <FormCard className="auth-card signup-card">
          <h2 className="auth-card-title">Create an Account</h2>

          <form className="auth-form signup-form" onSubmit={handleSubmit}>
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

            <div className="field-box field-confirm">
              <span className="field-label">Confirm Password</span>
              <input
                className="field-input"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                placeholder="***************"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <label className="checkbox-label terms-label">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={() => setAgreeTerms(!agreeTerms)}
              />
              <span>
                By signing up, you agree to our <a href="#">Terms &amp; Conditions</a> and <a href="#">Privacy Policy</a>.
              </span>
            </label>

            {error ? <p className="error-text error-text-signup">{error}</p> : null}

            <button className="auth-btn primary-auth-btn signup-submit" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'GET STARTED'}
            </button>
          </form>

          <div className="divider-wrap signup-divider-wrap">
            <div className="divider-line" />
            <span>Or</span>
          </div>

          <button type="button" className="auth-btn google-auth-btn signup-google-btn">
            <img src={googleIcon} alt="google" />
            <span>Sign up with Google</span>
          </button>

          <p className="auth-bottom-copy signup-bottom-copy">
            Already have an account?
            <a href="/"> LOGIN</a>
          </p>
        </FormCard>
      </section>
    </main>
  );
}

export default Signup;
