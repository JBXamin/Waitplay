import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Import the CSS file

const LoginPage = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && mobile.length === 10 && otp.length === 4) {
      navigate('/selection'); // Redirect to the Selection Page
    } else {
      alert('Please fill in all fields correctly.');
    }
  };

  return (
    <div className="login-page">
      <h1 className='welcome'>Welcome to <br /> Waitplay Family</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
            <div className='name-input'>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
        </div>
        <div className="form-group mobile-input-group">
          <div className="mobile-input-wrapper">
            <input
              type="text"
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              maxLength={10}
              required
            />
            <button type="button" className="get-otp-btn">
              Get OTP
            </button>
          </div>
        </div>
        <div className="form-group otp-input">
          <label>OTP</label>
          <div className="otp-box">
            <input
              type="text"
              maxLength={1}
              value={otp[0] || ''}
              onChange={(e) => setOtp((prev) => e.target.value + prev.slice(1))}
            />
            <input
              type="text"
              maxLength={1}
              value={otp[1] || ''}
              onChange={(e) => setOtp((prev) => prev.slice(0, 1) + e.target.value + prev.slice(2))}
            />
            <input
              type="text"
              maxLength={1}
              value={otp[2] || ''}
              onChange={(e) => setOtp((prev) => prev.slice(0, 2) + e.target.value + prev.slice(3))}
            />
            <input
              type="text"
              maxLength={1}
              value={otp[3] || ''}
              onChange={(e) => setOtp((prev) => prev.slice(0, 3) + e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="submit-btn">
          Launch Menu Card Now
        </button>
      </form>
    </div>
  );
};

export default LoginPage;