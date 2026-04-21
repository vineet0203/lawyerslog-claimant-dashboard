import checkIcon from '../assets/icons/check.svg';

function LeftSection() {
  return (
    <section className="left-section">
      <div className="logo-box">
        <span className="logo-text">LAWYERSLOG</span>
      </div>

      <h1 className="left-title">
        Your Case,
        <br />
        Our Commitment!
      </h1>

      <ul className="feature-list">
        <li className="feature-item feature-item-1">
          <img src={checkIcon} alt="check" />
          <span>Submit Your Case in Minute</span>
        </li>
        <li className="feature-item feature-item-2">
          <img src={checkIcon} alt="check" />
          <span>Verified Lawyers Ready to help</span>
        </li>
        <li className="feature-item feature-item-3">
          <img src={checkIcon} alt="check" />
          <span>Track your Case Anytime</span>
        </li>
        <li className="feature-item feature-item-4">
          <img src={checkIcon} alt="check" />
          <span>Secure &amp; Confidential</span>
        </li>
      </ul>
    </section>
  );
}

export default LeftSection;
