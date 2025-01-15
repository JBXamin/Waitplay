import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Import the CSS file

const LoginPage = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(Array(4).fill(''));
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && mobile.length === 10 && otp.join('').length === 4) {
      navigate('/selection'); // Redirect to the Selection Page
    } else {
      alert('Please fill in all fields correctly.');
    }
  };

  const handleOtpChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) { // Only allow numeric input
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3) {
        otpRefs.current[index + 1].focus(); // Move focus to next box
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus(); // Move focus to previous box on backspace
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
        <div className='form-group otp-input'>
            <div className="otp-background">
                <div className="otp-box">
                    <label className='otp-text'>OTP</label>
                    {[0, 1, 2, 3].map((_, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={otp[index]}
                        ref={(el) => (otpRefs.current[index] = el)}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                      />
                    ))}
                </div>
            </div>
        </div>
        <div className='exit-login'>
            <button type="submit" className="submit-btn">
            Launch Menu Card Now
            </button>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;