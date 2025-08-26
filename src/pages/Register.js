import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/Register.css'; // CSS dosyasını import edin

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Kayıt Ol</h2>
      {error && <div className="register-error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label className="form-label">Kullanıcı Adı:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Şifre:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Şifre Tekrar:</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <button type="submit" className="register-button" disabled={loading}>
          {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
        </button>
      </form>

      <p className="login-link">
        Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link>
      </p>
    </div>
  );
};

export default Register;