import { useMemo, useState } from 'react';

function Reset() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isOtpComplete = useMemo(() => otp.every((d) => d.trim() !== ''), [otp]);

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) {
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    if (!isOtpComplete) {
      setMessage('Please enter the 6-digit OTP code');
      return;
    }

    try {
      setLoading(true);
      const email = localStorage.getItem('lawyerslog_pending_email');
      if (!email) {
        setMessage('Signup email not found. Please sign up again.');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.join('') })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'OTP verification failed');
        return;
      }

      localStorage.removeItem('lawyerslog_pending_email');
      setMessage('OTP verified successfully. Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch {
      setMessage('Unable to verify OTP right now');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const email = localStorage.getItem('lawyerslog_pending_email');
      if (!email) {
        setMessage('Signup email not found. Please sign up again.');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-signup-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Failed to resend OTP');
        return;
      }

      setMessage('A new OTP code has been sent');
    } catch {
      setMessage('Unable to resend OTP right now');
    }
  };

  return (
    <main className="auth-root reset-page">
      <section className="auth-canvas">
        <div className="auth-bg" />

        <section className="reset-card-figma">
          <h2 className="reset-main-title">Create an Account</h2>
          <div className="reset-divider" />

          <form className="reset-content" onSubmit={handleVerify}>
            <div className="reset-copy">
              <p className="reset-subtitle">Enter the OTP sent to your email or phone</p>
              <p className="reset-caption">We&apos;ve sent a 6-digit code to: example@email.com</p>
            </div>

            <div className="otp-row">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  maxLength={1}
                  className="otp-input-box"
                />
              ))}
            </div>

            <div className="reset-resend-wrap">
              <span>Didn&apos;t receive the code?</span>
              <button type="button" className="resend-link" onClick={handleResend}>
                Resend Code
              </button>
            </div>

            {message ? <p className="reset-message">{message}</p> : null}

            <button type="submit" className="reset-submit-btn" disabled={loading}>
              {loading ? 'VERIFYING...' : 'GET STARTED'}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}

export default Reset;
